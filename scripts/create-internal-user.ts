/**
 * Creates or updates a staff account for the internal application.
 *
 * There is no user-management UI yet (out of scope until a later phase),
 * so this CLI script is how additional BT Home Designs staff get access.
 * Run against the database configured in DATABASE_URL.
 *
 * Usage:
 *   npm run db:create-user -- --email=becky@bthomedesigns.com --password="a strong password" --name="Becky" --role=ADMIN
 *
 * Re-running with an existing email updates that user's name/password/role
 * (upsert) rather than creating a duplicate.
 */
import { prisma } from "../lib/db/prisma";
import { InternalUserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function main() {
  const email = getArg("email")?.trim().toLowerCase();
  const password = getArg("password");
  const name = getArg("name")?.trim();
  const roleArg = (getArg("role") ?? "STAFF").toUpperCase();

  if (!email || !password || !name) {
    console.error(
      'Usage: npm run db:create-user -- --email=you@example.com --password="..." --name="Your Name" [--role=ADMIN|STAFF]'
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  if (roleArg !== InternalUserRole.ADMIN && roleArg !== InternalUserRole.STAFF) {
    console.error('Role must be "ADMIN" or "STAFF".');
    process.exit(1);
  }
  const role: InternalUserRole = roleArg;

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.internalUser.upsert({
    where: { email },
    update: { name, passwordHash, role },
    create: { email, name, passwordHash, role },
  });

  console.log(`OK: ${user.email} (${user.role}) is ready to sign in at /internal/login.`);
}

main()
  .catch((err) => {
    console.error("Failed to create/update user:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
