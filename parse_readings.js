var cheerio     = require('cheerio')
var fsprom      = require('fs').promises
var mkdirp      = require('mkdirp')
var util        = require('util')
const fs        = require('fs')

const {parse_uccsb_refs}     = require('./utils')

async function read_day(date) {
    var day       = date.getDate()
    var month     = date.getMonth() + 1
    var year      = date.getYear() - 100

    day           = day   < 10 ? '0' + day.toString()   : day.toString()
    month         = month < 10 ? '0' + month.toString() : month.toString()
    year          = year  < 10 ? '0' + year.toString()  : year.toString()

    var data      = await fs.readFileSync("sources/readings/" + month + day + year + ".htm", "utf8")
    
    var $             = cheerio.load(data)
    var collection    = $('title').text().trim()
    var h4s           = $('h4')
    var h3            = $('.contentarea h3').text()

    var readings      = h4s.map((i, h4) => parse_uccsb_refs($(h4).text())).toArray()
    var page          = {day: day, year: year, month: month, title: h3, readings}
    return page }

async function get_all() {
    var days = []
    var day  = new Date("01-01-2020")
    for (; day < new Date("01-01-2021"); day = new Date(day - 1 + 2 + 24 * 60 * 60 * 1000)) {
	var response = await read_day(day)
	days.push(response) }

    fs.writeFileSync("public/data/readings.json", JSON.stringify(days))
    console.log(days) }

get_all()
