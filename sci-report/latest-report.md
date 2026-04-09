# SCI Benchmark Report

**Date**: 2026-04-09T15:08:14.394Z
**Commit**: fde5dc6
**Machine**: Apple MacBook Pro M1
**Constants**: E power=18W, I=332 gCO2eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO2) | M (mgCO2) | SCI (mgCO2eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| merge-pdf | 8 | 46.4 KB | 44.7 KB | 12.616 | 0.038 | 12.654 |
| split-pdf | 5 | 23.2 KB | 21.7 KB | 7.470 | 0.023 | 7.493 |
| compress-pdf | 50 | 23.2 KB | 23.0 KB | 82.336 | 0.249 | 82.585 |
| rotate-pdf | 4 | 23.2 KB | 23.2 KB | 6.806 | 0.021 | 6.827 |
| watermark-pdf | 60 | 23.2 KB | 25.6 KB | 98.936 | 0.299 | 99.235 |
| page-numbers | 5 | 23.2 KB | 25.2 KB | 7.968 | 0.024 | 7.992 |
| pdf-to-jpg | 326 | 23.2 KB | 1.03 MB | 540.496 | 1.634 | 542.130 |
| organize-pdf | 4 | 23.2 KB | 23.2 KB | 7.138 | 0.022 | 7.160 |
| crop-pdf | 4 | 23.2 KB | 23.2 KB | 5.810 | 0.018 | 5.828 |
| pdf-to-png | 233 | 23.2 KB | 1.59 MB | 387.444 | 1.171 | 388.615 |
| extract-images | 23 | 23.2 KB | 723 B | 37.350 | 0.113 | 37.463 |
| grayscale-pdf | 477 | 23.2 KB | 1.08 MB | 791.322 | 2.392 | 793.714 |
| resize-pdf | 236 | 23.2 KB | 1.29 MB | 391.760 | 1.184 | 392.944 |
| header-footer | 6 | 23.2 KB | 25.9 KB | 10.126 | 0.031 | 10.157 |
| flatten-pdf | 3 | 23.2 KB | 23.2 KB | 5.312 | 0.016 | 5.328 |
| pdf-to-text | 31 | 23.2 KB | 8.3 KB | 51.958 | 0.157 | 52.115 |
| edit-metadata | 18 | 23.2 KB | 23.1 KB | 30.046 | 0.091 | 30.137 |
| pdf-to-webp | 1546 | 23.2 KB | 534.5 KB | 2565.530 | 7.755 | 2573.285 |
| nup-pdf | 940 | 23.2 KB | 545.8 KB | 1560.400 | 4.717 | 1565.117 |
| add-blank-page | 20 | 23.2 KB | 23.2 KB | 33.864 | 0.102 | 33.966 |
| remove-blank-pages | 136 | 23.2 KB | 23.2 KB | 225.428 | 0.681 | 226.109 |
| ocr-pdf | 12722 | 23.2 KB | 939.7 KB | 21118.520 | 63.840 | 21182.360 |
| compare-pdf | 2564 | 46.4 KB | 865.3 KB | 4255.742 | 12.865 | 4268.607 |
| reverse-pages | 9 | 23.2 KB | 23.1 KB | 15.438 | 0.047 | 15.485 |
| invert-colors | 2219 | 23.2 KB | 939.8 KB | 3683.872 | 11.136 | 3695.008 |
| repair-pdf | 6 | 23.2 KB | 23.1 KB | 10.624 | 0.032 | 10.656 |
| pdf-to-epub | 46 | 23.2 KB | 19.6 KB | 76.692 | 0.232 | 76.924 |
| booklet-pdf | 7 | 23.2 KB | 23.1 KB | 12.284 | 0.037 | 12.321 |
| text-to-pdf | 11 | 0 B | 2.8 KB | 17.928 | 0.054 | 17.982 |
| markdown-to-pdf | 4 | 0 B | 1.7 KB | 5.976 | 0.018 | 5.994 |
| protect-pdf | 488 | 23.2 KB | 1.36 MB | 809.582 | 2.447 | 812.029 |
| jpg-to-pdf | 0 | 0 B | 0 B | 0.000 | 0.000 | 0.000 |
| unlock-pdf | 292 | 1.36 MB | 1.33 MB | 484.886 | 1.466 | 486.352 |
| redact-pdf | 196 | 23.2 KB | 63.8 KB | 325.194 | 0.983 | 326.177 |
| sign-pdf | 6 | 23.2 KB | 23.9 KB | 9.794 | 0.030 | 9.824 |
| edit-pdf | 12 | 23.2 KB | 23.5 KB | 20.418 | 0.062 | 20.480 |
| add-qr-code | 9 | 23.2 KB | 23.9 KB | 14.110 | 0.043 | 14.153 |
| pdf-to-markdown | 57 | 23.2 KB | 8.2 KB | 95.284 | 0.288 | 95.572 |
| check-accessibility | 7 | 23.2 KB | 1012 B | 10.956 | 0.033 | 10.989 |

**Total**: 37941.766 mgCO2eq across 39 tools in 22790ms
