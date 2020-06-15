import axios      from 'axios'

export default class BibleData {
    bible     = {}
    sources   = {}
    readings  = false

    get_toc(next) {
	axios.get('data/toc.json')
	    .catch(do_nothing)
	    .then((response) => {
		next(response.data) }) }

    get_lectionary(year, month, day, translation, on_readings, on_bible) {
	var do_get_lectionary = () => {
	    var reading
	    
	    for (var i in this.readings) {
		reading = this.readings[i]
		if (Number.parseInt(reading.day) == day
		    && Number.parseInt(reading.month) == month
		    && Number.parseInt(reading.year) == year)
		    break; }

	    on_readings(reading)
	    var chapters = {}
	    reading.readings.map((r) => {
		var book = r.book
		r.verses.map((v) => {
		    var key = [book, v.chapter].join('-')
		    if (!chapters[key])
			chapters[key] = {book, chapter: v.chapter}}) })

	    Object.values(chapters).map((item) => {
		this.get_chapter({book: item.book, chapter: item.chapter, translation},
			    on_bible) }) }
	
	if (this.readings) 
	    do_get_lectionary()
	else
	    axios.get('data/readings.json')
	    .catch(do_nothing)
	    .then((response) => {
		this.readings = response.data
		do_get_lectionary() }) }

    
    get_chapter(options, next) {
	var {book, chapter, verse, reference, translation} = options
	translation     = translation  || 'douay'
	book            = book         || 'matthew'
	chapter         = chapter      || 1
	var existing    = deep_get(this.bible, [book, chapter])

	if (existing && existing.translations[translation]) 
	    next(this.bible[book][chapter])
	
	axios.get('data/bible/' + book + '/' + chapter + '/' + translation + '.json')
	    .catch(do_nothing)
	    .then((response) => {
		var data = response.data
		if (chapter == 147) {
		    var newdata = {verses: {}}
		    for (var i in data.verses) newdata.verses[Number.parseInt(i) + 11] = data.verses[i]
		    data = newdata
		    console.log(147, newdata, data) }
		
		deep_set(this.bible,
			 [book, chapter, 'translations', translation],
			 data)
		next(this.bible[book][chapter], book, chapter)
		
		axios.get('data/bible/' + book + '/' + chapter + '/references.json')
		    .catch(do_nothing)
		    .then((response, err) => {
			if (!response) response = {data: []}

			deep_set(this.bible,
				 [book, chapter, 'references'],
				 response.data)

			next(this.bible[book][chapter], book, chapter) }) }) }}
		
