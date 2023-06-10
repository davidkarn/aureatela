#!/bin/bash
mkdir -p sources
cd sources
wget 'https://www.gutenberg.org/cache/epub/1582/pg1582.html'
wget -np -L -r -l 3 'https://www.tertullian.org'
