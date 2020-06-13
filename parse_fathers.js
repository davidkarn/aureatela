var cheerio     = require('cheerio')
var fsprom      = require('fs').promises
var mkdirp      = require('mkdirp')
var util        = require('util')
var utils       = require('./utils')
const fs        = require('fs')
const { promisify } = require('util')

var fsp = {readdir:   fsprom.readdir,
	   readFile:  fs.readFileSync,
	   writeFile: fs.writeFileSync}

const {book_keys_tbl, parse_refs, to_code} = utils


var test_refs = {
    "1 Cor. ii. 14.": [],
    "Ps. lxxii. 3.": [],
    "Hab. ii. 4; Rom. i. 17.": [],
    "John xx. 19.": [],
    "1 Cor. ii. 9.": [],
    "1 Cor. iii. 4.": [],
    "Ps. lxxxii. 6.": [],
    "Ps. cxlviii. 5.": [],
    "Ps. cxxi. 1, 2.": [],
    "John i. 9.": [],
    "John i. 30.": [],
    "John i. 16.": [],
    "Matt. v. 8.": [],
    "Deus.": [],
    "Gen. i.": [],
    "1 Cor. viii. 4.": [],
    "Ps. xxii. 6.": [],
    "Job xxv. 6.": [],
    "Wisd. xi. 21.": [],
    "Eccles. x. 1.": [],
    "Ex. viii.": [],
    "Ps. civ. 24.": [],
    "John i. 26, 27.": [],
    "Matt. v. 8.": [],
    "Ex. iii. 14.": [],
    "Rom. i. 20-22.": [],
    "Matt. xiv. 25.": [],
    "Eph. v. 8.": [],
    "John i. 5.": [],
    "John v. 35.": [],
    "John i. 20, 27.": [],
    "Ps. xxvii. 12.": [],
    "Matt. vii. 7.": [],
    "Matt. xxi. 23-27; Mark xii. 28-33; Luke xx. 2-8.": [],
    "Ps. cxxxii. 17.": [],
    "Phil. iii. 20. [R.V.: \"Our citizenship is in heaven.\"": [],
    "Ps. ii. 7, 8.": [],
    "Ps. xv. 5.": [],
    "Gen. ii. 23.": [],
    "Eph. v. 28, 29.": [],
    "Matt. xiii. 3-25.": [],
    "Matt. ii. 2.": [],
    "Rom. vi. 14.": [],
    "Gal. iv. 4, 5.": []}

function test_references() {
    Object.keys(test_refs).slice(0, 20).map((fn) => {
	var text = fn
	if (text.match(/\[.*?\]/))
	    text = text.match(/\[(.*?)\]/)[1]
	console.log([text, JSON.stringify(parse_refs(text))]) 
	console.log([fn, JSON.stringify(parse_refs(fn))]) }) }



async function async_each(array, callback) {
    for (let index = 0; index < array.length; index++) 
	await callback(index, array[index], array) }

async function parse_from_ttorg(filename) {
    filename      = filename || 'sources/www.tertullian.org/fathers2/ANF-07/anf07-36.htm'
    var folder    = filename.match(/fathers2\/(.*?)\//)[1]
    var end_part  = filename.match(/fathers2\/(.*?)\.htm/)[1]
    var data      = await fsp.readFile(filename, 'utf8')

    var toc       = await fsp.readFile('public/data/sources/' + folder + "/toc.json", 'utf8')
    toc           = JSON.parse(toc)

    
    if (data) {
	var $             = cheerio.load(data)
	var collection    = $('title').text().trim()
i	var as            = Object.values($('a')).filter((x) => x.name == 'a' && x.type == 'tag')
	var ps            = Object.values($('p')).filter((x) => x.name == 'p' && x.type == 'tag')

	var tracking      = true
	var title
	
	for (var i in as) 
	    if ($(as[i]).text().length > 3) {
		var el  = $(as[i])
		el.children().each((i, x) => $(x).text(''))
		title = el.text().trim()
		break }

	var code          = to_code(end_part, title)
	var author        = toc.contents[code] && toc.contents[code].author
	var article       = {title, code, author, filename, chapters: []}
	var chapter       = {name:       '',
			     index:       1,
			     paragraphs: []}

	var write_reference = async (book, chapter, verse, source_code, source_chapter, source_paragraph, text) => {
	    try {
		var book = book_keys_tbl[book]
		var path = 'public/data/bible/' + book + '/' + chapter + '/references.json'
		var data

		try {
		    data = await fsp.readFile(path) }
		catch { data = '[]' }

		try {
		    if (data)  data     = JSON.parse(data)
		    else       data     = [] }
		catch {
		    console.log('error parsing json: ' + path)
		    return }
					 
		data.push({chapter, verse, source_code, source_chapter,
			   source_paragraph, folder, text, title, author})
	    
		await fsp.writeFile(path, JSON.stringify(data)) }
	    catch {
		console.log('failed writing reference to ' + path) }}

	var save_article = async (article) => {
	    var dest_folder = 'public/data/sources/' + folder + "/" + article.code

	    await async_each(article.chapters, async (i, chapter) => {
		await async_each(chapter.paragraphs, async (i, paragraph) => {
		    await async_each(paragraph.references, async (i, reference) => {
			await async_each(reference.bible_refs, async (i, bible_ref) => {
			    await async_each(bible_ref.verses, async (i, verse) => {
				await write_reference(bible_ref.book,
						      bible_ref.chapter,
						      verse,
						      article.code,
						      chapter.index,
						      paragraph.index,
						      paragraph.text)
				console.log('written') }) }) })  }) })

	    await mkdirp(dest_folder)
	    await fsp.writeFile(dest_folder + '/source.json', JSON.stringify(article), () => {}) }
	
	var fns           = {}
	var get_fn_file   = async (folder, fn) => {
	    var code = [folder, fn].join('-')

	    if (!fns[code]) {
	    	var data = await fsp.readFile('sources/www.tertullian.org/fathers2/'
					     + folder + '/footnote/fn' + fn + '.htm', 'utf8')
		fns[code] = data }

	    return fns[code] }
	
	var get_reference = async (folder, fn, code) => {
	    var fn_file    = await get_fn_file(folder, fn)
	    var fn$        = cheerio.load(fn_file)
	    var bible_refs = []
	    
	    var node       = fn$('a[name="' + code + '"]').parent()
	    $('sup', node).text('')
	    
	    var text       = node.text().trim()
	    if (text.match(/\[.*?\]/))
		text = text.match(/\[(.*?)\]/)[1]
	    texts          = text.split(';')
	    	    
            for (var i in texts) {
		var verses   = parse_refs(text)

		verses.map((v) => bible_refs.push(v)) }
		
	    return {fn, code, folder, text, bible_refs}}

	var process_paragraph = async (text, t2, index) => {
	    var references = []

	    await async_each($('a', text), async (i, a) => {
		a               = $(a)
		var footnote    = (a.attr('href') || '').match(/fn(\d+)\.htm#(.*)/)
		
		if (footnote) {
		    references.push(await get_reference(folder, footnote[1], footnote[2]))
		    a.text('[fn-' + footnote[1] + '-' + footnote[2] + ':' + a.text() + '-nf]') } })

	    text    = text.text()

	    return {text,
		    index,
		    references: references}}
	    
	for (var i in ps) {
	    var p       = ps[i]
	    var text    = $(p).text().trim()

	    if (text.trim().match('------')) {
		tracking = true
		continue }
	    
	    if (tracking) {
		if (text.match(/^Chapter /)) {
		    if (chapter.paragraphs.length > 0) {
			article.chapters.push(chapter)
			chapter = {name:        text,
				   index:       article.chapters.length + 1,
				   paragraphs: []} }
		    else
			chapter.name = text
		    continue }
		
		chapter.paragraphs.push(await process_paragraph($(p), text, i)) }}

	if (chapter.paragraphs.length > 0)
	    article.chapters.push(chapter)

	await save_article(article)
	console.log('*') } }	
		
async function get_files(filename) {
    var filename    = filename || 'sources/www.tertullian.org/fathers2/'

    var folders     = await fsp.readdir(filename)
    async_each(folders, async (i, folder) => {
	if (!folder.match('NF')) return
	var files = await fsp.readdir(filename + folder)
	if (!files) return

	async_each(files, async (i, file) => {
	    if (!file.match('nf')) return
	    console.log(filename + folder + "/" + file)
	    await parse_from_ttorg(filename + folder + '/' + file) }) }) }

get_files()
//parse_from_ttorg()

