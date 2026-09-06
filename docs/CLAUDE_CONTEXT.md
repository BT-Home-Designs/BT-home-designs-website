# BT HOME DESIGNS QUOTE SYSTEM

## AUTHORITATIVE RULES

- Existing public website must remain unchanged.
- Internal app lives under /internal and requires authentication.
- PostgreSQL + Prisma.
- Matrix pricing engine is locked. Do not modify without explicit approval.
- Roller/Neolux dealer cost = vendor retail × 0.80.
- Customer pricing is separate from vendor pricing.
- Total Internal Cost = Cost of Goods + Labor.
- Cash Price = Total Internal Cost × 1.75.
- Credit Card Fee = Cash Price × 6%.
- Credit Card Price = Cash Price + Credit Card Fee.
- Never invent missing prices.
- Historical quote pricing must remain immutable/auditable.
- Customer-facing output must never expose dealer cost, cost of goods, markup, profit, or margin.

## AUTHORITATIVE DOCUMENTS

Read these only when relevant:

- docs/pricing-spec.md
- docs/business-rules.md

Do not restate their contents unless a rule changes or I ask for a summary.

## TOKEN-EFFICIENT WORK MODE

1. Inspect only files relevant to the current task.
2. Do not narrate routine terminal commands.
3. Do not narrate each file edit.
4. Do not restate requirements already documented in the repo.
5. Do not repeat matrices, fabric catalogs, or business rules unless they changed.
6. Use the current repo state instead of reconstructing prior phases.
7. Do not perform broad repository reviews unless needed to resolve a failure.
8. Run required tests silently.
9. Interrupt me only for:
   - a real blocker
   - a required business-rule decision
   - a material test/build failure
10. Keep completion reports concise.

## COMPLETION REPORT FORMAT

At completion report only:

- Files changed
- Schema/migration changes, if any
- Tests/typecheck/lint/build results
- Blockers or deviations
- Commit SHA
- Remote push confirmation

Do not summarize implementation details already visible in the diff unless something unusual occurred.
