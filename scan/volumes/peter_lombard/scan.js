const fs              = require('fs');
const { exec, execSync, spawn } = require('node:child_process');

function curry(that, ...args) {
    return function(...calledWithArgs) {
        const newArgs = [];
        
        for (const i in args) {
            if (args[i] === undefined) 
                newArgs.push(calledWithArgs.shift());

            else 
                newArgs.push(args[i]); }

        const as = newArgs.concat(calledWithArgs);
        return that.apply(that, as); }; }

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

const prep_files = (prefix, bg_color) => {
    fs
        .readdirSync('./')
        .filter(fn => fn.slice(0, prefix.length) == prefix)
        .map(curry(prep_file, bg_color)); };

const prep_file = (bg_color, filename) => {
    const exec = (str) => {
        console.log(str);
        execSync(str); };
    
    exec("convert -crop 50%x100% +repage -density 150 "
         + filename + " "
         + filename.replace('-','').replace(".png", "_%d.png"));

    [filename.replace('-','').replace(".png", "_0.png"),
     filename.replace('-','').replace(".png", "_1.png")]
        .map(filename => {
            const margin_fn = filename.replace(".png", "_margin.png");

            // the margin on these scans is sometimes to slim, it needs padding
            // in order for page-dewarp not to clip it
            exec("convert " + filename + " -resize 110%x110% "
                 + " -background '" + bg_color + "' "
                 + " -gravity center -extent 110%x110% "
                 + margin_fn);
            exec("~/.local/bin/page-dewarp " + margin_fn);
            exec("rm " + margin_fn + " " + filename); }); };

//pull_scans();
//convert_scans();
prep_files('tomus3_-', "#CD974F");
