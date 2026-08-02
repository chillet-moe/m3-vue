# Delegated Tooltip benchmark results

Measured on 2026-08-03 with Google Chrome 151.0.7922.71, Vite+ 0.2.4, and an Intel Core Ultra 5 225H.
Each timing is the median of five fresh page loads in headless Chrome. The workload mounts 1,000 buttons, performs
three keyed-list recycle rounds, and unmounts the list.

| Metric                           | Bounded delegated slot pool | Per-instance target Tooltip |  Change |
| -------------------------------- | --------------------------: | --------------------------: | ------: |
| Mount                            |                      5.8 ms |                     77.0 ms |  -92.5% |
| Three recycle rounds             |                      8.7 ms |                    257.0 ms |  -96.6% |
| Unmount                          |                      0.7 ms |                     26.8 ms |  -97.4% |
| Listener registrations           |                           7 |                      76,000 | -99.99% |
| Tooltip elements after mount     |                           3 |                       1,000 |  -99.7% |
| Anchored triggers after mount    |                           0 |                       1,000 |   -100% |
| `aria-describedby` after recycle |                           0 |                       1,000 |   -100% |

The delegated mode retains exactly three Vue `Tooltip` surfaces for the slot pool and no anchored trigger until a
trigger is focused or hovered. The per-instance mode eagerly creates one target surface, anchor, and full directive
setup per item. DOM and listener counts are deterministic; timing is directional and should be re-measured on the
target browser and hardware before treating it as a release threshold.
