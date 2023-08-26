const {execSync}  = require('node:child_process');
const fs          = require('fs');
const util        = require('util');
const utils       = require("./utils")

function scan_books() {
    return fs
        .readdirSync('./data/books/')
        .map(author => scan_author(author)); }

function scan_author(author) {
    return {author: titleify(author),
            books: (fs
                    .readdirSync('./data/books/' + author)
                    .map(title => scan_title(author, title))
                    .filter(title => title.volumes.length))}; }

function scan_title(author, title) {
    return {key:     title,
            title:   titleify(title),
            volumes: (fs
                      .readdirSync('./data/books/' + author + "/" + title)
                      .filter(name => (name != 'book.json' && !name.match('refs.json')
                                       && !name.match('#') && !name.match('~')))
                      .map(volume => scan_volume(author, title, volume))).filter(x => x)}; }

function is_title(str) {
    return str.replace(/[^a-zA-Z.-]+/g, '').length > 6; }

function titleify(str) {
    return ucfirst(str.replace(/[_-]/g, ' ').trim().split(/ +/)
                   .map(word => {
                       if (["a", "for", "the", "on", "of", "from", "or"].includes(word)) {
                           return word.toLowerCase(); }
            
                       else {
                           return ucfirst(word); }}).join(' ')); }

function ucfirst(str) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase(); }

function scan_volume(author, title, volume) {
    const path = "./data/books/" + author + "/" + title + "/" + volume;
    const json = JSON.parse(fs.readFileSync(path));

    if (!json || (json.parts && json.parts.length == 0)) {
        return null; }

    else if (json.heading) {
        return {format: 'v2',
                path,
                title: (is_title(json.heading)
                        ? json.heading
                        : json.parts[0] && titleify(json.parts[0].header.eng))} }
    
    else {
        return {format: 'v1',
                path,
                title: json.volume_title}}; }

const data = JSON.stringify(scan_books(), null, 2);
fs.writeFileSync("./data/toc.json", data);
