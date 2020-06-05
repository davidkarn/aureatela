var cheerio     = require('cheerio')
var fs          = require('fs')
var mkdirp      = require('mkdirp')

function parse_douay(filename) {
    filename = filename || './sources/pg1581.html'
    fs.readFile(filename, 'utf8', (err, data) => {
	var $          = cheerio.load(data)
	var ps         = $('p')
	var chapter    = false
	var book       = false
	var verse      = false
	var books      = {}

	var save_verse = (book, chapter, verse, line) => {
	    if (!books[book])             books[book] = {}
	    if (!books[book][chapter])    books[book][chapter] = {verses: []}
	    books[book][chapter].verses.push(line) }

	var save_chapter = (book, chapter) => {
	    var folder = 'data/bible/' + book.toLowerCase() + '/' + chapter
	    console.log(folder)
	    mkdirp(folder).then((m, e) => {
		fs.writeFile(folder + '/douay.json', JSON.stringify(books[book][chapter]), () => {}) }) }

	Object.values(ps).map((p) => {
	    if (!p || !p.attribs) return
	    var text     = $(p).text()
	    var style    = p.attribs.style

	    if (style == 'margin-top: 3em' && text.match(' Chapter ')) {
		var old_book = book
		var old_chap = chapter
		book         = text.match(/(.*?) Chapter/)[1]
		chapter      = Number.parseInt(text.match(/Chapter (.*)/)[1])
	
		if (old_book && book != old_book || old_chap && chapter != old_chap) {
		    console.log('writing: ', book, old_chap)
		    save_chapter(old_book, old_chap) }}
	    
	    else if (book) {
		var parsed   = text.match(/^(\d+):(\d+)\. ([\s\S]*)$/m)
		if (parsed) {
		    verse     = Number.parseInt(parsed[2])
		    chapter   = Number.parseInt(parsed[1])
		    var line  = parsed[3]

		    save_verse(book, chapter, verse, line) }}})
	
    	save_chapter(book, chapter) }) }

parse_douay()
	
	
