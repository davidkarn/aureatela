const {execSync}  = require('node:child_process');
const fs          = require('fs');
const util        = require('util');
const utils       = require("./utils")

function scan_books() {
    fs
        .readdirSync('./data/books/')
        .map(author => scan_author(author)); }

function scan_author(author) {
    fs
        .readdirSync('./data/books/' + author)
        .map(title => scan_title(author, title)); }

function scan_title(author, title) {
    fs
        .readdirSync('./data/books/' + author + "/" + title)
        .filter(name => name != 'book.json')
        .map(volume => scan_volume(author, title, volume)); }

function scan_volume(author, title, volume) {
    const data = JSON.parse(fs.readFileSync("./data/books/"
                                            + author + "/"
                                            + title + "/"
                                            + volume));

    if (data && data.key && data.sections && !data.header && !data.parts) {
        scan_fathers_volume(author, title, volume, data); }

    else if (data) {
        scan_other_volume(author, title, voluem, data); }}

function scan_fathers_volume(author, title, volume, data) {
    console.log('scanning fathers', author, title, volume);    
    data.sections.map((section, section_index) => {
        section.paragraphs.map((paragraph, paragraph_index) => {
            paragraph.references.map(
                ref => record_fathers_reference(
                    author, title, volume, section_index, paragraph,
                    paragraph_index, ref)); }); }); }

function record_fathers_reference(author, title, volume, section_index,
                                  paragraph, paragraph_index, reference) {
    if (reference.bible_refs) {
        reference.bible_refs.map(ref => {
            store_bible_ref(ref.book, ref.chapter, ref.verses,
                            {author, title, volume, section_index,
                             paragraph, paragraph_index, fn: ref.fn}); }); }}

function scan_other_volume(author, title, volume, data) {
    console.log('scanning other', author, title, volume);
    data.parts.map((section, section_index) => {
        section.paragraphs.map((paragraph, paragraph_index) => {
            paragraph.references.map(
                record_other_reference(author, title, volume, section_index,
                                       paragraph, paragraph_index,
                                       reference)); }); }); }

function record_other_reference(author, title, volume, section_index,
                                paragraph, paragraph_index, reference) {
    if (reference.author === "bible") {
        store_bible_ref(reference.book, reference.chapter, reference.verses,
                        {author, title, volume, section_index, paragraph_index,
                         paragraph, fn: reference.index}); }

    else if (reference.reference && reference.reference.section) {
        store_book_ref(reference.author, reference.volume,
                       reference.reference.section, reference.reference.volume,
                       reference.reference.paragraph,
                       {author, title, volume, section_index,
                        paragraph_index, paragraph,
                        fn: reference.index}); } }

function store_book_ref(author, book, volume, section, paragraph, ref_data) {
    console.log('writing book', author, book, volume, section, paragraph);
    paragraph      = paragraph || 0;
    section        = section || 0;
    let refs_list  = {};
    const path     = ("data/books/" + author + "/" + book
                      + "/volume_" + volume + "_refs.json");
    const code     = [ref_data.author, ref_data.title, ref_data.volume,
                      ref_data.section_index, ref_data.paragraph_index,
                      author, book, volume, section, paragraph].join(":");
    
    if (fs.existsSync(path)) {
        refs_list = JSON.parse(rs.readFileSync(path)); }

    refs_list[code] = {book, volume, section, paragraph, ...ref_data};
    fs.writeFileSync(path, JSON.stringify(refs_list)); }
                         
function store_bible_ref(book, chapter, verses, ref_data) {
    console.log('writing bible', book, chapter, verses);
    if (utils.book_keys_tbl[book]) {
        book = utils.book_keys_tbl[book]; }

    let refs_list  = {};
    const path     = "./data/bible/" + book + "/" + chapter + "/refs.json";
    const code     = [ref_data.author, ref_data.title, ref_data.volume,
                      ref_data.section_index, ref_data.paragraph_index,
                      book, chapter].join(":");
    
    if (fs.existsSync(path)) {
        refs_list = JSON.parse(fs.readFileSync(path)); }
    
    refs_list[code] = {book, chapter, verses, ...ref_data};
    fs.writeFileSync(path, JSON.stringify(refs_list)); }

scan_books();
