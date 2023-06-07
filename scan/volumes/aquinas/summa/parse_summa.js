const cheerio     = require('cheerio');
const fs          = require('fs');
const util        = require('util');

function elems(cheerio_elements) {
    return Object.values(cheerio_elements).filter(x => x.type == 'tag'); }

function parse_questions(bookname) {
    fs
        .readdirSync('./isidore.co/aquinas/summa/' + bookname + '/')
        .map(filename => {
            console.log(filename);
            parse_question('./isidore.co/aquinas/summa/' + bookname + '/' + filename,
                           filename,
                           bookname); }); }

function parse_question(path, filename, bookname) {
    const data       = fs.readFileSync(path);
    const $          = cheerio.load(data);
    const parts      = elems($('table'));

    const parsed  = parts.map(part => {
        const trs     = elems($('tr', part));
        const header  = $(part).prev().text().trim();
        const parsed  = {header: {eng: header},
                        paragraphs: []};
        trs.map(tr => {
            const tds = elems($('td', tr));
            parsed.paragraphs.push({eng: $(tds[1]).text().trim(),
                                    lat: $(tds[0]).text().trim()}) });
        
        return parsed; });

    const question_title = $(elems($('a'))[5]).text();
    const section        = {heading: question_title,
                            parts:   parsed};

    fs.writeFileSync("./" + bookname + "_" + filename + ".json",
                     JSON.stringify(section, null, "  "));
    console.log([bookname, filename]); }
        
parse_questions("FP");
parse_questions("FS");
parse_questions("SS");
parse_questions("TP");
parse_questions("X1");
parse_questions("X2");
parse_questions("XP");
