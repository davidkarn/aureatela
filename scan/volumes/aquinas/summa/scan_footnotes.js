const {execSync}  = require('node:child_process');
const fs          = require('fs');
const util        = require('util');
const utils       = require('../../../../utils');

const roman_numerals = //'M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})';
      '(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})';

const footnotes_table = [
    {author: 'dionysius',
     title: 'ecclesial_hierarchy',
     pattern: 'Eccl. Hier.',
     latinpattern: 'Eccles. Hier.'},
    {author: 'dionysius',
     title: 'divine_names',
     pattern: 'Div. Nom.',
     latinpattern: 'divinis nominibus'},
    {author: 'augustine',
     title: 'the_city_of_god_',
     pattern: 'De Civ. Dei',
     latinpattern: 'de Civ. Dei',
     processor: (ref_nums) => {
         return {orig: ref_nums,
                 volume: 0 + ref_nums[0],
                 section: 1 + ref_nums[1]}; }},     
    {author: 'augustine',
     title: 'literal_meaning_of_genesis',
     pattern: 'Gen. ad lit.',
     latinpattern: 'gen. ad lit.'},
    {author: 'augustine',
     title: 'arianism_and_other_heresies', // ??
     pattern: 'De Heres.',
     latinpattern: 'de heres'},
    {author: 'augustine',
     title: 'on_the_trinity', 
     pattern: 'De Trin.',
     latinpattern: 'de trin'},
    {author: 'augustine',
     title: 'homilies_on_john', 
     pattern: 'in Joan.',
     latinpattern: 'in Joan'},
    {author: 'augustine',
     title: 'misc_questions', 
     pattern: 'Questions.',
     latinpattern: 'questions.'},
    {author: 'augustine',
     title: 'on_christian_doctrine', 
     pattern: 'De Doctr. Christ.',
     latinpattern: 'de doctr. christ..',
     processor: (ref_nums) => {
         return {orig: ref_nums,
                 volume: 1 + ref_nums[0],
                 section: 1 + ref_nums[1]}; }},
    {author: 'augustine',
     title: 'enchiridion', 
     pattern: 'Enchir.',
     latinpattern: 'enchir'},
    {author: 'augustine',
     title: 'confessions', 
     pattern: 'Confess.',
     latinpattern: 'confess'},
    {author: 'augustine',
     title: 'on_evil', 
     pattern: 'De Lib Arb.',
     latinpattern: 'de lib arb'},
    {author: 'augustine',
     title: 'on_music', 
     pattern: 'Music',
     latinpattern: 'music'},
    {author: 'hugh_of_st_victor',
     title: 'on_the_sacraments', 
     pattern: 'De Sacram',
     latinpattern: 'de sacram'},
    {author: 'boethius',
     title: 'consolation_of_philosophy', 
     pattern: 'De Consol.',
     latinpattern: 'de consol'},
    {author: 'boethius',
     title: 'on_the_trinity', 
     pattern: 'De Trin.',
     latinpattern: 'de trin'},
    {author: 'john_damascene',
     title: 'on_the_orthodox_faith', 
     pattern: 'De Fide Orth.',
     latinpattern: 'de fide orth'},
    {author: 'peter_lombard',
     title: 'sentences', 
     pattern: 'Sent.',
     latinpattern: 'Sent.'},
    {author: 'bonaventure',
     title: 'on_the_sentences', 
     pattern: 'Sent.',
     latinpattern: 'Sent.'},
    {author: 'albert_the_great',
     title: 'on_the_sentences', 
     pattern: 'Sent.',
     latinpattern: 'Sent.'},
    {author: 'alexander_of_hales',
     title: 'on_the_sentences', 
     pattern: 'Sent.',
     latinpattern: 'Sent.'},
    {author: 'ambrose',
     title: 'expositions_on_luke', 
     pattern: 'Expos. in Luc.',
     latinpattern: 'expos. in luc'},
    {author: 'ambrose',
     title: 'on_repentence', 
     pattern: 'De Poenit.',
     latinpattern: 'de poenit'},
    {author: 'ambrose',
     title: 'on_the_sacraments', 
     pattern: 'De Sacram.',
     latinpattern: 'de sacram'},
    {author: 'ambrose',
     title: 'on_the_mysteries', 
     pattern: 'De Mysteriis.',
     latinpattern: 'de mysteriis'},
    {author: 'jerome',
     title: 'letters', 
     pattern: 'Epistle.',
     latinpattern: 'epistle'},
    {author: 'origen',
     title: 'commentary_on_matthew', 
     pattern: 'in Matth.',
     latinpattern: 'in Matth'},
    {author: 'hilary_of_pontiers',
     title: 'commentary_on_matthew', 
     pattern: 'in Matth.',
     latinpattern: 'in Matth'},
    {author: 'chrysostom',
     data_author: 'st_john_chrysostom',
     title: 'commentary_on_matthew', 
     pattern: 'in Matth.',
     latinpattern: 'in Matth',
     processor: (ref_nums) => {
         return {orig: ref_nums,
                 volume: -1 + ref_nums[0],
                 section: 0,
                 paragraph: 1 + (ref_nums.length > 1 ? ref_nums[1] : 0)}; }},
    {author: 'ambrose',
     title: 'prosologium', 
     pattern: 'Prosolog.',
     latinpattern: 'prosolog'},
    {author: 'ambrose',
     title: 'monologium', 
     pattern: 'Monol.',
     latinpattern: 'monol'},
    {author: 'aristotle',
     title: 'nicomachean_ethics', 
     pattern: 'Ethic.',
     latinpattern: 'ethic'},
    {author: 'aristotle',
     title: 'metaphysics', 
     pattern: 'Metaph.',
     latinpattern: 'metaph'},
    {author: 'aristotle',
     title: 'Physics', 
     pattern: 'Phys.',
     latinpattern: 'ethic'},
    {author: 'aristotle',
     title: 'de_anima', 
     pattern: 'De Anima',
     latinpattern: 'ethic'},
    {author: 'aristotle',
     title: 'topics', 
     pattern: 'Topics',
     latinpattern: 'topics'},
    {author: 'aristotle',
     title: 'prior_analytics', 
     pattern: 'Prior. Anal.',
     latinpattern: 'prior. anal.'},
    {author: 'aristotle',
     title: 'posterior_analytics', 
     pattern: 'Poster',
     latinpattern: 'poster'},
    {author: 'aristotle',
     title: 'categories', 
     pattern: 'Categor',
     latinpattern: 'categor'},
    {author: 'aristotle',
     title: 'on_memory', 
     pattern: 'De Memoria',
     latinpattern: 'de memoria'},
    {author: 'aristotle',
     title: 'on_sense_and_sensibility', 
     pattern: 'De Sens. et Sensato',
     latinpattern: 'de sens et sensato'},
    {author: 'aristotle',
     title: 'on_generation_and_corruption', 
     pattern: 'De Gener',
     latinpattern: 'de gener'},
    {author: 'aristotle',
     title: 'on_generation_of_animals', 
     pattern: 'De Gener. Anim',
     latinpattern: 'de gener anim'},
    {author: 'aristotle',
     title: 'on_politics', 
     pattern: 'Polit',
     latinpattern: 'polit'},
];

mark_dupes(footnotes_table);

function scan_for_footnotes(path) {
    const data       = JSON.parse(fs.readFileSync(path));

    apply_footnotes(
        path,
        {...data,
         parts: data.parts.map(
             part => {
                 return {
                     ...part,
                     paragraphs: part.paragraphs.map(
                         para => {
                             return {
                                 ...para,
                                 refs: find_footnotes(para.eng,
                                                      footnotes_table)}; })}; })}); }

function apply_footnotes(path, data) {
    console.log('writing', path, util.inspect(data, false, null, true));
    execSync("mkdir -p ../../../../data/books/aquinas/summa/");
    fs.writeFileSync("../../../../data/books/aquinas/summa/"
                     + (path
                        .replace(/.*\//, '')
                        .replace('.html', '')
                        .toLowerCase()),
                     JSON.stringify(data, null, "  ")); }

function mark_dupes(footnotes) {
    const table = footnotes.reduce(
        (acc, cur) => {
            return {
                ...acc,
                [cur.pattern]: (acc[cur.pattern] || []).concat(cur.author)}; },
        {});
    
    for (let i in footnotes) {
        if (table[footnotes[i].pattern].length > 1) {
            footnotes[i].is_dupe = true; }}}

function parse_number(string) {
    string = string.replace(/[^a-z0-9]+/gi, '');

    if (string.match(/^[0-9]+$/)) {
        return parseInt(string); }
    
    else {
        return utils.parse_roman(string); }}    

function get_ref_block(pattern, string) {
    let number_matches = [...string.matchAll(
        new RegExp("\\b((" + roman_numerals + "|[0-9]+)[,. ]*)+\\b", "gi"))];
    if (number_matches.length > 0) {
        number_matches = number_matches
            .map(m => m[0])
            .sort((a, b) => a.length > b.length ? -1 : 1)[0]
            .split(/[,. ]+/)
            .map(parse_number);
        //    number_matches = number_matches.map(parse_number);
        
        if (pattern.processor) {
            return pattern.processor(number_matches, string); }

        else {
            return {author:    pattern.author,
                    volume:    pattern.title,
                    reference: number_matches}; }}
    
    else {
        return null; }}
        
function find_footnotes(text, patterns) {
    text = text.toLowerCase();
    
    const refs = patterns.map(pattern => {
        let matches = [...text.matchAll(pattern
                                        .pattern
                                        .toLowerCase())];
        if (matches.length === 0) {
            matches = [...text.matchAll(pattern
                                        .pattern
                                        .toLowerCase()
                                        .replace(/\./g, ''))]; }

        return matches.map(match => {
            const index        = match.index;
            let context_before = text.slice(Math.max(0, index - 28), index);
            let context_after  = text.slice(index, index + 28 + match[0].length);
            
            if (pattern.is_dupe) {
                if (!context_before.match(pattern.author.replace('_', ' '))) {
                    return null; }}

            const after_regex  = new RegExp(
                '\\b((' + roman_numerals + "|[0-9]+)[., ]*)+[a-z. *]*(]|\\))", 'gi');
            const before_regex = new RegExp(
                "(\\(|\\[)\\**[a-z. ]*((" + roman_numerals + "|[0-9]+)[., ]*)+", 'gi');

            let chapt_match = [...context_after.matchAll(after_regex)];
            if (chapt_match.length === 0)
                chapt_match = [...context_before.matchAll(before_regex)];
            console.log(chapt_match, context_before);
            const ref_block = chapt_match.length > 0
                  && get_ref_block(pattern, chapt_match[0][0]);
            
            return chapt_match.length === 0 || !ref_block
                ? null
                : {index:     match.index,
                   volume:    pattern.title,
                   author:    pattern.data_author || pattern.author,
                   reference: ref_block}; }); });

    let found_refs = refs.flat().filter(x => x);
    const paren_matches = [...text.matchAll(/\(.*?\)/g),
                           ...text.matchAll(/\[.*?\]/g)];
    paren_matches.map(match => {
        let matchstart = match.index;
        let matchend   = match.index + match[0].length;
        let crossovers = found_refs.filter(
            r => !(r.index > matchstart && r.index < matchend));

        if (crossovers.length === 0) {
            let bible_refs = utils.parse_refs(text.slice(matchstart, matchend));
            
            if (bible_refs.length > 0) {
                found_refs.push({index:     matchstart + bible_refs[0].index,
                                 volume:    "bible",
                                 author:    "bible",
                                 reference: bible_refs[0]}); }}});
    
    return found_refs; }

const path = "./SS_SS187.html.json";

function scan_all() {
    fs
        .readdirSync('./')
        .map(filename => {
            if (filename.match('.html.json')) {
                scan_for_footnotes(filename); }}); }

scan_all();
//scan_for_footnotes(path);

