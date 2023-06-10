#!/bin/bash
mkdir -p sources
cd sources
wget 'https://www.gutenberg.org/cache/epub/1581/pg1581-images.html'
mv pg1581-images.html pg1581.html
wget -np -L -r -l 3 'https://www.tertullian.org/fathers2/'
