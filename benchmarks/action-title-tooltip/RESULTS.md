# Action title tooltip benchmark results

Measured on 2026-08-02 with Google Chrome 151.0.7922.71, Vite+ 0.2.4, and an Intel Core Ultra 5 225H.
Each timing is the median of five fresh page loads in headless Chrome with explicit garbage collection enabled.
The workload mounts 2,000 mixed action components, updates every title, recycles the full keyed list five times,
and unmounts it.

| Metric                                 | Original per-instance runtime | Shared lazy runtime | Change |
| -------------------------------------- | ----------------------------: | ------------------: | -----: |
| Mount                                  |                      372.5 ms |            180.4 ms | -51.6% |
| Update every title                     |                       88.6 ms |             52.0 ms | -41.3% |
| Five full-list recycle rounds          |                    2,947.7 ms |          1,090.8 ms | -63.0% |
| Unmount                                |                      190.4 ms |             17.9 ms | -90.6% |
| Listener registrations                 |                       300,000 |              48,066 | -84.0% |
| Tooltip elements after unopened mount  |                         2,000 |                   0 |  -100% |
| Anchored triggers after unopened mount |                         2,000 |                   0 |  -100% |

The isolated memory benchmark registered, opened, unregistered, and removed 2,000 raw triggers per batch for ten
batches. After the first batch, forced-GC heap samples stayed between 2.20 MB and 2.26 MB (about 64 KB growth over
the remaining nine batches), with zero tooltip elements and zero anchored triggers left at the end.

The Vue development-mode list benchmark's absolute heap value is not used as a tooltip retention metric: the same
roughly 220 MB retained-heap reading occurs in the original implementation when the benchmark omits every title, so
it reflects the repeated development-mode component workload rather than the tooltip runtime. The isolated runtime
benchmark above is the relevant leak check.

## Follow-up shared interaction runtime

Measured again on 2026-08-03 after action press-shape morphing was moved from four DOM listeners per component
instance to one delegated document runtime. The same 2,000-item, five-recycle, five-load workload produced these
medians:

| Metric                                 | Shared Tooltip only | Shared Tooltip + press runtime | Change from original |
| -------------------------------------- | ------------------: | -----------------------------: | -------------------: |
| Mount                                  |            180.4 ms |                       197.4 ms |               -47.0% |
| Update every title                     |             52.0 ms |                        68.9 ms |               -22.2% |
| Five full-list recycle rounds          |          1,090.8 ms |                       962.3 ms |               -67.4% |
| Unmount                                |             17.9 ms |                        24.5 ms |               -87.1% |
| Listener registrations                 |              48,066 |                             90 |              -99.97% |
| Tooltip elements after unopened mount  |                   0 |                              0 |                -100% |
| Anchored triggers after unopened mount |                   0 |                              0 |                -100% |

Timing variance between the two optimized runs is expected from development-mode compilation and browser scheduling;
the deterministic result of this follow-up is the listener count, which fell from 48,066 to 90 registrations across
12,000 component lifetimes. The isolated ten-batch forced-GC run after the shared Tooltip generalization retained zero
tooltip elements and zero anchors; post-first-batch heap samples stayed between 2.83 MB and 2.91 MB (about 76 KB
growth over the remaining nine batches).
