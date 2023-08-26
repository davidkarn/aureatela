const fs       = require('fs')
const util     = require('util');
const works    = require('./fathers_works.js');

function get_tocs() {
    const root_toc = {};
    const folders  = fs.readdirSync('./public/data/sources/');
    
    folders.map(folder => {
        const toc = JSON.parse(fs.readFileSync('./public/data/sources/'
                                               + folder
                                               + '/toc.json'));
        Object.values(toc.contents).map(content => {
            root_toc[(content.author || "") + ':' + content.title] = content; }); });

    return root_toc; }

function connect_works() {
    const toc = get_tocs();
    return works
        .sort((a, b) => a.paths[0] > b.paths[0] ? 1 : -1)
        .map(work => {
            const content = toc[work.author + ':' + work.title]
            
            if (content) {
                work.paths = [[content.code, content.target, content.href]]; }

            return work; }); }

//fs.writeFileSync('fathers_works.json', JSON.stringify(connect_works(), null, "  "));
//console.log(util.inspect(connect_works(), false, null, true));

const works2 = JSON.parse(fs.readFileSync('fathers_works.json'));
fs.writeFileSync('fathers_works2.json', JSON.stringify(works2.sort((a, b) => a.paths[0][0] > b.paths[0][0] ? 1 : -1), null, "  "));
