import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Quote } from "./types";

/**
 * Persistence for quotes and their uploaded photos.
 *
 * Two drivers, chosen automatically:
 *   - Postgres, when DATABASE_URL is set (required for Vercel/serverless,
 *     whose filesystem is not persistent). Tables are created on first use.
 *   - Local files under QUOTES_DATA_DIR (default ./.data/quotes), for local
 *     development and the preview. Gitignored; never served statically.
 *
 * Photos are never placed in /public — they're only readable through
 * /api/quote-files, which checks the customer's link or the admin session.
 */

export type StoredFile = { mime: string; data: Buffer };

export interface QuoteStore {
  list(): Promise<Quote[]>;
  get(id: string): Promise<Quote | null>;
  getByToken(token: string): Promise<Quote | null>;
  /** Insert a new quote. */
  create(quote: Quote): Promise<void>;
  /** Write if quote.rev still equals expectedRev; returns false on conflict. */
  replace(quote: Quote, expectedRev: number): Promise<boolean>;
  nextSequence(name: string): Promise<number>;
  putFile(id: string, quoteId: string, file: StoredFile): Promise<void>;
  getFile(id: string): Promise<StoredFile | null>;
}

// ---------------------------------------------------------------- file driver

class FileStore implements QuoteStore {
  private chain: Promise<unknown> = Promise.resolve();
  constructor(private dir: string) {}

  /** Serialize writes within this process (dev/preview is single-process). */
  private lock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(fn, fn);
    this.chain = run.catch(() => undefined);
    return run;
  }

  private async ensure() {
    await fs.mkdir(path.join(this.dir, "quotes"), { recursive: true });
    await fs.mkdir(path.join(this.dir, "files"), { recursive: true });
  }

  private quotePath(id: string) {
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("bad id");
    return path.join(this.dir, "quotes", `${id}.json`);
  }

  private async writeAtomic(file: string, data: string | Buffer) {
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, data);
    await fs.rename(tmp, file);
  }

  async list(): Promise<Quote[]> {
    await this.ensure();
    const names = await fs.readdir(path.join(this.dir, "quotes"));
    const quotes = await Promise.all(
      names.filter((n) => n.endsWith(".json")).map(async (n) => JSON.parse(await fs.readFile(path.join(this.dir, "quotes", n), "utf8")) as Quote)
    );
    return quotes;
  }

  async get(id: string): Promise<Quote | null> {
    try {
      return JSON.parse(await fs.readFile(this.quotePath(id), "utf8")) as Quote;
    } catch {
      return null;
    }
  }

  async getByToken(token: string): Promise<Quote | null> {
    return (await this.list()).find((q) => q.token === token) ?? null;
  }

  create(quote: Quote): Promise<void> {
    return this.lock(async () => {
      await this.ensure();
      await this.writeAtomic(this.quotePath(quote.id), JSON.stringify(quote, null, 1));
    });
  }

  replace(quote: Quote, expectedRev: number): Promise<boolean> {
    return this.lock(async () => {
      const current = await this.get(quote.id);
      if (!current || current.rev !== expectedRev) return false;
      await this.writeAtomic(this.quotePath(quote.id), JSON.stringify(quote, null, 1));
      return true;
    });
  }

  nextSequence(name: string): Promise<number> {
    return this.lock(async () => {
      await this.ensure();
      const file = path.join(this.dir, "counters.json");
      let counters: Record<string, number> = {};
      try {
        counters = JSON.parse(await fs.readFile(file, "utf8"));
      } catch {}
      counters[name] = (counters[name] ?? 0) + 1;
      await this.writeAtomic(file, JSON.stringify(counters));
      return counters[name];
    });
  }

  async putFile(id: string, quoteId: string, file: StoredFile): Promise<void> {
    await this.ensure();
    if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("bad id");
    await this.writeAtomic(path.join(this.dir, "files", id), file.data);
    await this.writeAtomic(path.join(this.dir, "files", `${id}.meta.json`), JSON.stringify({ mime: file.mime, quoteId }));
  }

  async getFile(id: string): Promise<StoredFile | null> {
    if (!/^[0-9a-f-]{36}$/.test(id)) return null;
    try {
      const meta = JSON.parse(await fs.readFile(path.join(this.dir, "files", `${id}.meta.json`), "utf8"));
      return { mime: meta.mime, data: await fs.readFile(path.join(this.dir, "files", id)) };
    } catch {
      return null;
    }
  }
}

// ------------------------------------------------------------ postgres driver

type Sql = import("postgres").Sql;

class PostgresStore implements QuoteStore {
  private ready: Promise<void> | null = null;
  constructor(private sql: Sql) {}

  private init(): Promise<void> {
    this.ready ??= (async () => {
      await this.sql`create table if not exists bt_quotes (
        id text primary key,
        token text not null unique,
        rev integer not null,
        data jsonb not null,
        updated_at timestamptz not null default now()
      )`;
      await this.sql`create table if not exists bt_quote_files (
        id text primary key,
        quote_id text not null,
        mime text not null,
        data bytea not null,
        created_at timestamptz not null default now()
      )`;
      await this.sql`create table if not exists bt_counters (name text primary key, value integer not null)`;
    })();
    return this.ready;
  }

  async list(): Promise<Quote[]> {
    await this.init();
    const rows = await this.sql<{ data: Quote }[]>`select data from bt_quotes`;
    return rows.map((r) => r.data);
  }

  async get(id: string): Promise<Quote | null> {
    await this.init();
    const rows = await this.sql<{ data: Quote }[]>`select data from bt_quotes where id = ${id}`;
    return rows[0]?.data ?? null;
  }

  async getByToken(token: string): Promise<Quote | null> {
    await this.init();
    const rows = await this.sql<{ data: Quote }[]>`select data from bt_quotes where token = ${token}`;
    return rows[0]?.data ?? null;
  }

  async create(quote: Quote): Promise<void> {
    await this.init();
    await this.sql`insert into bt_quotes (id, token, rev, data) values (${quote.id}, ${quote.token}, ${quote.rev}, ${this.sql.json(quote as never)})`;
  }

  async replace(quote: Quote, expectedRev: number): Promise<boolean> {
    await this.init();
    const result = await this.sql`update bt_quotes
      set data = ${this.sql.json(quote as never)}, rev = ${quote.rev}, token = ${quote.token}, updated_at = now()
      where id = ${quote.id} and rev = ${expectedRev}`;
    return result.count === 1;
  }

  async nextSequence(name: string): Promise<number> {
    await this.init();
    const rows = await this.sql<{ value: number }[]>`insert into bt_counters (name, value) values (${name}, 1)
      on conflict (name) do update set value = bt_counters.value + 1 returning value`;
    return rows[0].value;
  }

  async putFile(id: string, quoteId: string, file: StoredFile): Promise<void> {
    await this.init();
    await this.sql`insert into bt_quote_files (id, quote_id, mime, data) values (${id}, ${quoteId}, ${file.mime}, ${file.data})`;
  }

  async getFile(id: string): Promise<StoredFile | null> {
    await this.init();
    const rows = await this.sql<{ mime: string; data: Buffer }[]>`select mime, data from bt_quote_files where id = ${id}`;
    return rows[0] ? { mime: rows[0].mime, data: Buffer.from(rows[0].data) } : null;
  }
}

// ------------------------------------------------------------------- factory

const globalForStore = globalThis as unknown as { __btQuoteStore?: QuoteStore };

export async function getStore(): Promise<QuoteStore> {
  if (globalForStore.__btQuoteStore) return globalForStore.__btQuoteStore;
  const databaseUrl = process.env.DATABASE_URL;
  let store: QuoteStore;
  if (databaseUrl) {
    const { default: postgres } = await import("postgres");
    store = new PostgresStore(postgres(databaseUrl, { max: 3, idle_timeout: 20, onnotice: () => {} }));
  } else {
    if (process.env.VERCEL) {
      throw new Error("Quote storage is not configured: set DATABASE_URL (Postgres) — Vercel's filesystem is not persistent.");
    }
    store = new FileStore(path.resolve(process.env.QUOTES_DATA_DIR || path.join(process.cwd(), ".data", "quotes")));
  }
  globalForStore.__btQuoteStore = store;
  return store;
}

export function storageMode(): "postgres" | "local-files" | "unconfigured" {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.VERCEL) return "unconfigured";
  return "local-files";
}
