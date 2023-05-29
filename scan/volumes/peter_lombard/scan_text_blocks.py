import cv2
import numpy as np
import os
import sys
import json
import subprocess

fn = sys.argv[1]
image = cv2.imread(fn)

scale_percent = 30

gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (25,25), 0)
thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15,15))
dilate = cv2.dilate(thresh, kernel, iterations=4)

cnts = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
cnts = cnts[0] if len(cnts) == 2 else cnts[1]
paras = []

for c in cnts:
    x,y,w,h = cv2.boundingRect(c)
    if (x < 600 and x > 50 and w > 1500):
        paras.append([x,y,w,h])
        cv2.rectangle(image, (x, y), (x + w, y + h), (36,255,12), 2)

text_x_std = np.std(list(map(lambda x: x[0], list(paras))))
text_x_mean = np.mean(list(map(lambda x: x[0], list(paras))))

textblocks = []
footnotes = []

for para in paras:
    if para[0] > text_x_mean:
        footnotes.append(para)
    else:
        textblocks.append(para)

x_diff = int(np.mean(list(map(lambda x: x[0], list(footnotes))))
                  - np.mean(list(map(lambda x: x[0], list(textblocks)))))

toptxtblock = [0, 99999999]
btmtxtblock = [0, 0]

for block in textblocks:
    if block[1] < toptxtblock[1]:
        toptxtblock = block
    if block[1] > btmtxtblock[1]:
        btmtxtblock = block

textblock = [
    toptxtblock[0] + x_diff,         toptxtblock[1],
    toptxtblock[0] + toptxtblock[2], toptxtblock[1],
    btmtxtblock[0] + x_diff,         btmtxtblock[1] + btmtxtblock[3], 
    btmtxtblock[0] + btmtxtblock[2], btmtxtblock[1] + btmtxtblock[3]
]

resp = {"text": "",
        "footnotes": []}

for block in footnotes:
    cv2.imwrite(fn + '.writing.png', image[block[1]:(block[1]+block[3]), block[0]:(block[2]+block[0])])
    text = subprocess.getoutput("tesseract --dpi 150 -l lat " + fn + ".writing.png -")
    resp['footnotes'].append(text)

cv2.imwrite(fn + '.writing.png', image[textblock[1]:textblock[7], textblock[0]:textblock[6]])
text = subprocess.getoutput("tesseract --dpi 150 -l lat " + fn + ".writing.png -")
resp['text'] = text
json.dump(resp, sys.stdout)    
