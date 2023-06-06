import cv2
import numpy as np
import os
import sys
import json
import subprocess

fn = sys.argv[1]
image = cv2.imread(fn)

blurfactor = 25
dilatefactor = 15
istomus1 = False

isodd = True
if fn.endswith("0_margin_thresh.png"):
    isodd = False

if "tomus1_" in fn:
    istomus1 = True
    blurfactor = 21
    dilatefactor = 4

scale_percent = 30



gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (blurfactor, blurfactor), 0)
thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (dilatefactor, dilatefactor))
dilate = cv2.dilate(thresh, kernel, iterations=4)

cnts = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#thresh = cv2.resize(thresh, (int(image.shape[1] * 0.5), int(image.shape[0] * 0.5)))
#dilate = cv2.resize(dilate, (int(image.shape[1] * 0.5), int(image.shape[0] * 0.5)))


cnts = cnts[0] if len(cnts) == 2 else cnts[1]
paras = []

for c in cnts:
    x,y,w,h = cv2.boundingRect(c)
    print(x,y,w,h)
    if ((not istomus1 and isodd and x < 600 and x > 50 and w > 1500)
        or (not istomus1 and not isodd and x < 800 and x > 50 and w > 1500)
        or (istomus1 and isodd and x < 100 and x > 30 and w > 700)
        or (istomus1 and not isodd and x  < 200 and x  > 150 and w > 700)):
        paras.append([x,y,w,h])
        cv2.rectangle(image, (x, y), (x + w, y + h), (36,255,12), 2)

#image = cv2.resize(image, (int(image.shape[1] * 0.5), int(image.shape[0] * 0.5)))
#cv2.imshow("image", image)
#cv2.waitKey(0)
print(paras)
text_x_std = np.std(list(map(lambda x: x[0], list(paras))))
text_x_mean = np.mean(list(map(lambda x: x[0], list(paras))))
if not isodd:
    text_x_std = np.std(list(map(lambda x: x[0] + x[2], list(paras))))
    text_x_mean = np.mean(list(map(lambda x: x[0] + x[2], list(paras))))

textblocks = []
footnotes = []

for para in paras:
    if ((not isodd and para[0] + para[2] < text_x_mean)
        or (isodd and para[0] > text_x_mean)):
        footnotes.append(para)
    else:
        textblocks.append(para)

print(list(map(lambda x: x[0], list(footnotes))))
print(list(map(lambda x: x[0], list(textblocks))))

x_diff = 0
if len(list(footnotes)) > 0 and len(textblocks) > 0:
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
    cv2.imwrite(fn + '.writing.png', image[block[1]:(block[1] + block[3]),
                                           block[0]:(block[2] + block[0])])
    text = subprocess.getoutput("tesseract -c preserve_interword_spaces=1 --dpi 150 -l lat " + fn + ".writing.png -")
    resp['footnotes'].append(text)

cv2.imwrite(fn + '.writing.png', image[textblock[1]:textblock[7], textblock[0]:textblock[6]])
text = subprocess.getoutput("tesseract --dpi 150 -l lat " + fn + ".writing.png -")
resp['text'] = text
json.dump(resp, sys.stdout)    
