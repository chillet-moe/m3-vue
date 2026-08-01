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
