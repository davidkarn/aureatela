#!/bin/bash
sudo apt install imagemagick
pip install page-dewarp

convert -crop 50%x100% +repage -density 150 tomus3_-056.png tomus3_056_%d.png
convert tomus3_056_1.png -resize 110%x110% -background '#CD974F'  -gravity center -extent 110%x110% tomus3_056_1_margin.png
~/.local/bin/page-dewarp tomus3_056_1_margin.png 


#wget https://latinocr.org/1.0/lat.traineddataa
sudo apt-get install tesseract-ocr-lat
