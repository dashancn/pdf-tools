# SCI Benchmark Report

**Date**: 2026-04-07T03:03:46.599Z
**Commit**: 3803dba
**Machine**: MacOS Desktop
**Constants**: E power=18W, I=332 gCO₂eq/kWh, M embodied=211000g, lifetime=11680h
**LCA Source**: Apple 14-inch MacBook Pro PER Oct 2021

| Tool | Time (ms) | Input | Output | E (mgCO₂) | M (mgCO₂) | SCI (mgCO₂eq) |
|------|-----------|-------|--------|------------|------------|----------------|
| merge-pdf | 87 | 46.4 KB | 44.7 KB | 143.756 | 0.435 | 144.191 |
| split-pdf | 5 | 23.2 KB | 21.7 KB | 8.134 | 0.025 | 8.159 |
| compress-pdf | 237 | 23.2 KB | 23.0 KB | 392.756 | 1.187 | 393.943 |
| rotate-pdf | 15 | 23.2 KB | 23.2 KB | 25.066 | 0.076 | 25.142 |
| watermark-pdf | 13 | 23.2 KB | 25.6 KB | 22.078 | 0.067 | 22.145 |
| page-numbers | 5 | 23.2 KB | 25.2 KB | 8.798 | 0.027 | 8.825 |
| pdf-to-jpg | 467 | 23.2 KB | 1.03 MB | 774.556 | 2.341 | 776.897 |
| organize-pdf | 4 | 23.2 KB | 23.2 KB | 7.304 | 0.022 | 7.326 |
| crop-pdf | 3 | 23.2 KB | 23.2 KB | 4.814 | 0.015 | 4.829 |
| pdf-to-png | 195 | 23.2 KB | 1.59 MB | 323.866 | 0.979 | 324.845 |
| extract-images | 15 | 23.2 KB | 723 B | 25.066 | 0.076 | 25.142 |
| grayscale-pdf | 358 | 23.2 KB | 1.08 MB | 593.782 | 1.795 | 595.577 |
| resize-pdf | 183 | 23.2 KB | 1.29 MB | 303.614 | 0.918 | 304.532 |
| header-footer | 7 | 23.2 KB | 25.9 KB | 11.288 | 0.034 | 11.322 |
| flatten-pdf | 5 | 23.2 KB | 23.2 KB | 8.798 | 0.027 | 8.825 |
| pdf-to-text | 22 | 23.2 KB | 8.3 KB | 36.686 | 0.111 | 36.797 |
| edit-metadata | 4 | 23.2 KB | 23.1 KB | 7.304 | 0.022 | 7.326 |
| pdf-to-webp | 943 | 23.2 KB | 534.5 KB | 1564.716 | 4.730 | 1569.446 |
| nup-pdf | 490 | 23.2 KB | 545.8 KB | 812.902 | 2.457 | 815.359 |
| add-blank-page | 4 | 23.2 KB | 23.2 KB | 7.138 | 0.022 | 7.160 |
| remove-blank-pages | 62 | 23.2 KB | 23.2 KB | 103.252 | 0.312 | 103.564 |
| ocr-pdf | 10324 | 23.2 KB | 939.6 KB | 17137.176 | 51.805 | 17188.981 |
| compare-pdf | 1899 | 46.4 KB | 865.2 KB | 3151.510 | 9.527 | 3161.037 |
| reverse-pages | 3 | 23.2 KB | 23.1 KB | 5.478 | 0.017 | 5.495 |
| invert-colors | 1603 | 23.2 KB | 939.6 KB | 2661.146 | 8.044 | 2669.190 |
| repair-pdf | 4 | 23.2 KB | 23.1 KB | 5.810 | 0.018 | 5.828 |
| pdf-to-epub | 40 | 23.2 KB | 19.6 KB | 66.566 | 0.201 | 66.767 |
| booklet-pdf | 5 | 23.2 KB | 23.1 KB | 8.964 | 0.027 | 8.991 |
| text-to-pdf | 11 | 0 B | 2.8 KB | 17.762 | 0.054 | 17.816 |
| markdown-to-pdf | 10 | 0 B | 1.7 KB | 15.936 | 0.048 | 15.984 |
| protect-pdf | 218 | 23.2 KB | 1.36 MB | 361.050 | 1.091 | 362.141 |
| jpg-to-pdf | 0 | 0 B | 0 B | 0.000 | 0.000 | 0.000 |
| unlock-pdf | 603 | 1.36 MB | 1.33 MB | 1001.312 | 3.027 | 1004.339 |
| redact-pdf | 141 | 23.2 KB | 63.7 KB | 233.230 | 0.705 | 233.935 |
| sign-pdf | 3 | 23.2 KB | 23.9 KB | 5.312 | 0.016 | 5.328 |
| edit-pdf | 3 | 23.2 KB | 23.5 KB | 5.312 | 0.016 | 5.328 |
| add-qr-code | 4 | 23.2 KB | 23.9 KB | 5.976 | 0.018 | 5.994 |

**Total**: 29958.504 mgCO₂eq across 37 tools in 17995ms
