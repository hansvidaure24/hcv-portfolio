A multi-account download feature on an enterprise online banking platform sometimes returned one session's data shaped by another session's state. I traced it to shared state in the data-access layer and refactored that layer so concurrent sessions stay isolated.

This write-up describes the problem and the patterns involved, not Fiserv's code or systems.

## Problem
Retail and business customers can download activity for several accounts at once. Behind that one button, the platform talks to five different banking cores, each with its own data formats and response times.

Under concurrent use, the feature produced defects that were hard to reproduce: [describe what users or QA actually saw — e.g. a download that mixed in the wrong account's settings, intermittent errors, or files that differed between runs].

## Constraints
- **It's a bank.** A cross-session data leak is a security incident, not just a bug. The fix had to be provably correct, not just make the symptom go away.
- **Five cores, one code path.** The data-access logic was shared across all five integrations, so a change had to be safe for every one of them.
- **No downtime.** The fix shipped through the normal release process, with peer review and regression testing.
- [Add any others: release window, test environment limits, team size.]

## Investigation
- The defects only appeared under concurrent sessions, which pointed at shared mutable state rather than at any one core's integration.
- [Describe how you narrowed it down — e.g. reproducing it with parallel requests, logging per-request identifiers, or reading the cache and object lifetimes.]
- Two root causes:
  - **Thread safety:** [which object was shared across threads, e.g. a service registered as a singleton that held per-request fields].
  - **Cache isolation:** [what the cache was keyed on, and why that let one session's entry serve another, e.g. a key that left out the user or account].

## Key decisions
[Draft: these three are my guess at what "concurrency-safe design patterns" meant on your resume. Rewrite any that don't match what you actually did.]

**Fix the shape, not the symptom.** Putting locks around the shared object would have hidden the race at the cost of throughput. Instead, per-request state moved out of shared objects, so there was nothing left to race on.

**Make the cache key say who it belongs to.** Every cache entry is now scoped to [the session / user / account context], so one session's entry can't serve another.

**Change one layer for all five cores.** The refactor was confined to the shared data-access layer, so each core's integration kept its existing behavior and tests.

[Add the option you rejected and why, e.g. turning the cache off, or locking per core.]

## Results
- Eliminated the thread-safety and cache-isolation defects in the feature, across all five banking cores
- [Add a number if you have one: defect tickets closed, error rate before and after, or download time under load.]
- [Add any follow-up, e.g. a code-review checklist item or a concurrency test the team now runs.]

## What I learned
Bugs that only show up under load are usually about ownership: who owns a piece of state, and for how long. I now check object lifetimes and cache keys first whenever a defect only shows up under concurrent use.
