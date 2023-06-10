const fs          = require('fs');
const util        = require('util');

const roman_numerals = '(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})';

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
     title: 'city_of_god',
     pattern: 'De Civ. Dei',
     latinpattern: 'de Civ. Dei'},
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
     latinpattern: 'de doctr. christ..'},
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
     title: 'commentary_on_matthew', 
     pattern: 'in Matth.',
     latinpattern: 'in Matth'},
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
    console.log('writing', path);
    fs.writeFileSync(path, JSON.stringify(data, null, "  ")); }

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
                '((' + roman_numerals + "|[0-9]+)[\\.,]* )*([a-z. ])*\\**[\\])]", 'gi');
            const before_regex = new RegExp(
                "[\\[(]\\**[a-z. ]*((" + roman_numerals + "|[0-9]+)[\.,]* *)", 'gi');

            let chapt_match = [...context_after.matchAll(after_regex)];
            if (chapt_match.length === 0)
                chapt_match = [...context_before.matchAll(before_regex)];

            return chapt_match.length === 0
                ? null
                : {index:     match.index,
                   volume:    pattern.title,
                   author:    pattern.author,
                   reference: chapt_match[0][0]}; }); });

    return refs.flat().filter(x => x); }

const path = "./SS_SS187.html.json";

function scan_all() {
    fs
        .readdirSync('./')
        .map(filename => {
            if (filename.match('.html.json')) {
                scan_for_footnotes(filename); }}); }

scan_all(); 
