The transaction history page on an enterprise online banking platform loaded a customer's entire history into server memory before showing anything. I replaced that with cursor-based pagination that fetches 50 records at a time, and pages that used to time out now load in normal response times.

This write-up describes the problem and the patterns involved, not Fiserv's code or systems.

## Problem
For most customers, loading the full history was fine. Business accounts with tens of thousands of transactions a month were different: the page worked for minutes, held the whole history in memory, and then timed out.

## Constraints
- **Several backends, different capabilities.** The platform talks to more than one banking backend, and not all of them could fetch page by page yet.
- **Old and new had to run side by side.** The legacy load-everything path had to keep working for each backend until that backend was ready to switch.
- **No downtime.** Every change shipped through the normal release process, with peer review and regression testing.

## What I did
1. Replaced the load-everything model with a cursor-based pagination layer that fetches 50 records per request.
2. Built two cursor strategies, page-index and record-offset, so the same layer works with each backend's capabilities across 5 account types.
3. Rolled it out one backend at a time through per-integration configuration, keeping the legacy path alive until each was ready.
4. Added a nightly caching job so the heaviest accounts still load quickly first thing in the morning.

## The bug I found on the way
Mid-migration, I found two packages registering the same service. The configuration system picked one or the other depending on load order. That had been causing intermittent failures in an unrelated feature for months. I made one canonical registration and wired the other as a dependency, and those errors stopped.

## Trade-off
The server no longer holds a customer's full history at once, so features like sorting across every transaction had to be scoped to the current page or rethought. That's a real loss of capability. For the customers hit hardest by the old approach, pages that load were worth it.

## Results
- Page loads went from multi-minute timeouts to normal response times
- Data per request went from the full history to 50 records, a 10–40x reduction
- 5 account types supported through 2 cursor strategies
- Months of intermittent errors in another feature resolved as a side effect

## What I learned
Pagination looks like a front-end change but is really a contract change: every caller that assumed it had all the data has to be found and rethought. I now start migrations like this by listing those callers before writing any code.
