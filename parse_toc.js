var cheerio     = require('cheerio')
var fs          = require('fs')
var fsp         = require('fs').promises
var mkdirp      = require('mkdirp')
var authors     = require('./utils').authors
var to_code     = require('./utils').to_code
var all_headers = {}

async function parse_toc(filename) {
    filename      = filename || './sources/www.tertullian.org/fathers2/ANF-01/TOC.htm'
    var folder    = filename.match(/fathers2\/(.*?)\//)[1]
    
    fs.readFile(filename, 'utf8', async (err, data) => {
	var $          = cheerio.load(data)
	var ps         = $('p')
	var heading    = false
	var heading2   = false
	var heading3   = false
	var author     = false
	var contents   = {}

	for (var i in ps) {
	    if (!ps[i] || ps[i].name != 'p') continue
	    
	    var p       = $(ps[i])
	    var font    = $('font', p)
	    var a       = $('a', p)

	    if (font.attr('size') == 5)  heading   = p.text().trim()
	    if (font.attr('size') == 4)  heading2  = p.text().trim()
	    if (font.attr('size') == 3)  heading3  = p.text().trim()

	    if (authors[heading])  author = authors[heading]
	    if (authors[heading2]) author = authors[heading2]
	    if (authors[heading3]) author = authors[heading3]

	    if (a) {
		$('sup', p).text('')
		var href     = (a.attr('href') || '').match(/.*\.htm/)
		var target   = (a.attr('href') || '').match(/.*\.htm#(.*)/)
		var title    = p.text().trim()
		
		if (target) target = target[1].trim()
		if (href)   href   = href[0].trim()

		var code     = to_code(folder + "_" + (href || '').replace('.htm', ''), title)
		contents[code] = {href, target, heading,
				  heading2, author,
				  code, title} }}

	var toc = {contents,
		   folder,
		   filename}

	var dest_folder = 'public/data/sources/' + folder + "/"
	await mkdirp(dest_folder)
	await fsp.writeFile(dest_folder + '/toc.json',
			    JSON.stringify(toc),
			    () => {}) }) }

function get_tocs() {
    var filename    = filename || 'sources/www.tertullian.org/fathers2/'

    fs.readdir(filename, async (err, folders) => {
	folders.map(async (folder) => {
	    if (!folder.match('NF')) return
	    fs.readdir(filename + folder,  async (err, files) => {
		if (!files) return
		files.map(async (file) => {
		    if (!file.match('TOC.htm')) return
		    await parse_toc(filename + folder + '/' + file) }) }) }) }) }

get_tocs()

