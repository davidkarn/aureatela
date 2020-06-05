var cheerio     = require('cheerio')
var fs          = require('fs')
var fsp         = require('fs').promises
var mkdirp      = require('mkdirp')

async function parse_toc(filename) {
    filename      = filename || './sources/www.tertullian.org/fathers2/ANF-01/TOC.htm'
    var folder    = filename.match(/fathers2\/(.*?)\//)[1]
    
    fs.readFile(filename, 'utf8', async (err, data) => {
	var $          = cheerio.load(data)
	var ps         = $('p')
	var heading    = false
	var heading2   = false
	var author     = false
	var contents   = []

	for (var i in ps) {
	    if (!ps[i] || ps[i].name != 'p') continue
	    
	    var p       = $(ps[i])
	    var font    = $('font', p)
	    var a       = $('a', p)

	    if (font.attr('size') == 5)  heading   = p.text().trim()
	    if (font.attr('size') == 4)  heading2  = p.text().trim()
	    if (font.attr('size') == 3)  author    = p.text().trim()

	    if (a) {
		var href     = (a.attr('href') || '').match(/.*\.htm/)
		var target   = (a.attr('href') || '').match(/.*\.htm#(.*)/)
		if (target) target = target[1].trim()
		if (href)   href   = href[0].trim()

		contents.push({href, target, heading,
			       heading2, author,
			       title: p.text().trim()}) }}

	console.log({contents})
	var toc = {contents,
		   folder,
		   filename}

	var dest_folder = 'data/sources/' + folder + "/"
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
