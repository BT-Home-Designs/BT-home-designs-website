import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote, getQuoteWithDetails } from "./quotes";

/**
 * Integration tests against a real Postgres database (DATABASE_URL) —
 * these exercise Prisma directly, the same way the actual server actions
 * do, rather than mocking the database. Each test cleans up the rows it
 * creates.
 */

describe("quotes — creation and customer association", () => {
  const createdCustomerIds: string[] = [];
  const createdQuoteIds: string[] = [];

  after(async () => {
    await prisma.quote.deleteMany({ where: { id: { in: createdQuoteIds } } });
    await prisma.customer.deleteMany({ where: { id: { in: createdCustomerIds } } });
  });

  test("1. creating a quote generates a quote number and defaults to DRAFT", async () => {
    const customer = await createCustomer({ name: "Test Customer — Quote Creation" });
    createdCustomerIds.push(customer.id);

    const quote = await createQuote({ customerId: customer.id });
    createdQuoteIds.push(quote.id);

    assert.match(quote.quoteNumber, /^Q-\d{4}-\d{4}$/);
    assert.equal(quote.status, "DRAFT");
    assert.equal(quote.customerId, customer.id);
  });

  test("2. a quote is associated with its customer and loads with details", async () => {
    const customer = await createCustomer({ name: "Test Customer — Association", email: "assoc@example.com" });
    createdCustomerIds.push(customer.id);

    const quote = await createQuote({ customerId: customer.id });
    createdQuoteIds.push(quote.id);

    const loaded = await getQuoteWithDetails(quote.id);
    assert.ok(loaded);
    assert.equal(loaded?.customer.id, customer.id);
    assert.equal(loaded?.customer.name, "Test Customer — Association");
    assert.deepEqual(loaded?.lineItems, []);
  });

  test("quote numbers are unique across repeated creations", async () => {
    const customer = await createCustomer({ name: "Test Customer — Uniqueness" });
    createdCustomerIds.push(customer.id);

    const quoteA = await createQuote({ customerId: customer.id });
    const quoteB = await createQuote({ customerId: customer.id });
    createdQuoteIds.push(quoteA.id, quoteB.id);

    assert.notEqual(quoteA.quoteNumber, quoteB.quoteNumber);
  });
});
