const { exec, spawn } = require('node:child_process');

const sentences_urls = [
    "https://lib.undercaffeinated.xyz/get/PDF/5636/CalibreLibrary", // sentences 1
    "https://lib.undercaffeinated.xyz/get/PDF/5651/CalibreLibrary", // sentences 2
    "https://lib.undercaffeinated.xyz/get/PDF/5652/CalibreLibrary"]; // sentences 3 & 4

const pull_scans = () => {
    sentences_urls.map(url => 
        exec("wget '" + url + "'")); };

const convert_scans = () => {
    [["CalibreLibrary.1", "tomus1_"],
     ["CalibreLibrary.2", "tomus3_"],
     ["CalibreLibrary", "tomus2_"]]
        .map(
            file => exec("pdftoppm -r 300 -png " + file[0] + " " + file[1])); };

convert_scans();
