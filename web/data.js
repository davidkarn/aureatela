import axios      from 'axios'

export default class BibleData {
    bible     = {}
    sources   = {}

    get_toc(next) {
	axios.get('data/toc.json')
	    .catch(do_nothing)
	    .then((response) => {
		next(response.data) }) }

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
		deep_set(this.bible,
			 [book, chapter, 'translations', translation],
			 response.data)
		next(this.bible[book][chapter])
		
		axios.get('data/bible/' + book + '/' + chapter + '/references.json')
		    .catch(do_nothing)
		    .then((response, err) => {
			if (!response) response = {data: []}

			deep_set(this.bible,
				 [book, chapter, 'references'],
				 response.data)
			console.log('set refs', {book, chapter, response}, this.bible)
			next(this.bible[book][chapter]) }) }) }}
		
