const fs                        = require('fs');
const util                      = require('util');
const { exec, execSync, spawn } = require('node:child_process');

function last(ar) {
    return ar[ar.length - 1]; }

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
    [//["CalibreLibrary.1", "tomus1_"],
     ["CalibreLibrary.2", "tomus3_"],
     ["CalibreLibrary", "tomus2_"]]
        .map(
            file => execSync("pdftoppm -r 150 -png " + file[0] + " " + file[1])); };

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
            exec("convert " + filename + " -resize 120%x110% "
                 + " -background '" + bg_color + "' "
                 + " -gravity center -extent 120%x110% "
                 + margin_fn);
            exec("~/.local/bin/page-dewarp " + margin_fn);
            exec("rm " + margin_fn + " " + filename); }); };

const scan_files = () => {
    const suffix = "_margin_thresh.png"
    fs
        .readdirSync('./')
        .filter(fn => fn.slice(0 - suffix.length) == suffix)
        .map(filename => {
            try {
                const scanned_data = scan_file(filename);
                fs.writeFileSync(
                    filename.slice(0, filename.length - suffix.length) + "-ocr.json",
                    JSON.stringify(scanned_data)); }

            catch (e) {
                // some files will fail because they are TOC or headings and dont match
                // the format of the text pages that scan_file is designed for
                console.error('error scanning file: ' + filename);
                console.error(e); }}); };
                
const scan_file = (fn) => {
    const text             = JSON.parse(execSync("python3 scan_text_blocks.py " + fn));
    const footnotes_block  = text.footnotes[1];
    const footnotes        = parse_footnotes(footnotes_block);
    const chapters         = parse_chapters(text.text, footnotes);
    return chapters; }

const process_notes = (paragraph, notes) => {
    let done          = false;
    let last_index    = 0;
    let found_notes   = [];

    if (typeof paragraph !== "string") {
        found_notes = paragraph.notes
        paragraph   = paragraph.paragraph; }
    
    while (!done && notes.length > 0) {
        let offset  = 1;
        let testing = notes[0]
        let matches = [
            ...paragraph.matchAll(
                new RegExp(" " + (testing[0] == 8 ? "(8|\\$)" : testing[0]) + "\\W", "g"))]
            .filter(match => match.index >= last_index);

        if (matches.length === 0) {
            offset = 0;
            matches = [
                ...paragraph.matchAll(
                    new RegExp("[a-z]" + (testing[0] == 8 ? "(8|\\$)" : testing[0]) + "\\W", "g"))]
                .filter(match => match.index >= last_index); }
        
        console.log(" " + (testing[0] == 8 ? "(8|\\$)" : testing[0]) + "\\W", matches);
        
        if (matches.length > 0) {
            let match  = matches[0];
            last_index = match.index;
            
            paragraph  = paragraph.slice(0, match.index + (1 - offset))
                + "<<<fn:" + testing[0] + ">>>"
                + paragraph.slice(match.index + offset + 1);
            
            found_notes.push(testing);
            notes.shift(); }
        
        else {
            done = true; }}

    return [found_notes, paragraph]; }

const parse_chapters = (text, footnotes) => {
    const notes      = Object.keys(footnotes).map(fnInd => [fnInd, footnotes[fnInd]]);
    const chapters   = [{title: 'continuation', paragraphs: []}];
    const paragraphs = text
          .split(/\n\s*\n/g)
          .map(para => para.replace(/(\w)-\n(\w)/g, '$1$2').replace(/\n/g, " "))
          .filter(para => !para.match(/^\s*$/));

    let last_matched = 0;
    while (notes.length > 0) {
        paragraphs.forEach((paragraph, ind) => {
            if (ind >= last_matched) {
                let [paragraph_notes, text] = process_notes(paragraph, notes);
                paragraphs[ind] = {paragraph: text, notes: paragraph_notes};
                
                if (notes.length > 0) {
                    last_matched = ind; }}});
        
        if (notes.length > 0) {
            notes.shift(); }}
        
    paragraphs.forEach((paragraph, ind) => {
        if (paragraph.paragraph.match(/^Cap\. /i)) {
            chapters.push({title: paragraph.paragraph, paragraphs: []}); }
        
        else {
            last(chapters).paragraphs.push(paragraph); }}); 
        
    console.log(util.inspect(chapters, false, null, true));
    return chapters; }

const parse_footnotes = (text) => {
    return text.replace(/\u2013|\u2014/g, "-")
        .replace(/^(\s|-)+/, "")
        .split(/ {4,8}/)
        .map((footnote, ind) => [
            ind,
            footnote
                .replace(/^[0-9?*&()]{1,2} +/, '')
                .replace(/\s+/g, ' ')
                .replace(/.\s*$/, '')])
        .reduce(
            (acc, cur) => {
                return {...acc,
                        [cur[0] + 1]: cur[1]};
            }, {}); }

//pull_scans();
//convert_scans();
//prep_files('tomus1_-', "#ffffff");
//prep_files('tomus2_-', "#CD974F");
//prep_files('tomus3_-', "#CD974F");

scan_files();
//scan_file("tomus1_550_1_margin_thresh.png");
