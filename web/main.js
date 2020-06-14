import {render}           from 'inferno'
import __                from './jsml-i.js'
import Component         from 'inferno-component'
import {HashRouter, withRouter, Route, matchPath, 
	Link, Redirect}  from 'inferno-router'
import BibleData         from './data.js'

class Main extends Component {
    constructor(props) {
	super(props)

	this.state        = {}}

    componentWillMount() {}
    
    render() {
	return __(
	    'div', {},
	    __(HashRouter, {hashType: 'slash',
			    baseName: '/'},
	       __(Route,
		  {path: ["/bible/:book/:chapter/:verse/:reference",
			  "/bible/:book/:chapter/:verse",
			  "/bible/:book/:chapter",
			  "/bible/:book",
			  "/bible"],
			  
		   exact:  true,
		   render: props => {
		       var match = false
		       props.match.path.map((path) => {
			   match = match || matchPath(props.location.pathname,
						      {path, exact: true, strict: false}) })

		       return __(MainPage, {viewing:      'bible',
					    bible_params: {
						book:          match.params.book || 'matthew',
						chapter:       int(match.params.chapter || 1),
						verse:         int(match.params.verse || 1)},
					    translation:  'douay',
					    reference:     match.params.reference,
					    ...props})}}),
	       __(Route,
		  {path: ["/lectionary/:year/:month/:day/:reference",
			  "/lectionary/:year/:month/:day",
			  "/lectionary/today"],
			  
		   exact:  true,
		   render: props => {
		       var match  = false
		       props.match.path.map((path) => {
			   match = match || matchPath(props.location.pathname,
						      {path, exact: true, strict: false}) })
		       var year, month, day
		       
		       if (props.location.pathname == '/lectionary/todaay') {
			   var date   = new Date()
			   day        = date.getDate()
			   month      = date.getMonth() + 1
			   year       = date.getYear() - 100 }
		       else {
			   year       = int(match.params.year)
		           month      = int(match.params.month)
		           day        = int(match.params.day) }

		       return __(MainPage, {viewing:      'lectionary',
					    lectionary_params: {
						year, month, day},
					    translation:  'douay',
					    reference:     match.params.reference,
					    ...props})}}),
	       
	       !window.location.hash && 
	       __(Redirect, {from: "/", to: "/bible"}))) }}



class MainPage extends Component {
    constructor(props) {
	super(props)
	this.state        = {toc:    {bible: {}}}}


    componentWillMount() {
	this.bible_data = new BibleData()
	this.bible_data.get_toc(
	    (toc) => this.setState({toc}) )}
    
    open_reference(ref, verse) {
	if (!verse) verse = ref.verse
	this.props.history.push('/bible/' + ref.book + "/"
				+ ref.chapter + "/" + ref.verse + "/"
				+ ref.source_code + ":" + verse) }

    close_reference() {
	this.props.history.push('/bible/' + ref.book + "/"
				+ ref.chapter + "/" + ref.verse) }	

    get_references(book, chapter, verse) {
	return get_references(book, chapter, verse, this.state.books) }
    
    go_to_next_reference(ref, refs) {
	var found     = false
	
	for (var i in refs) {
	    var r = refs[i]
	    console.log({r, ref}, r == ref)
	    if (found)      return this.open_reference(r)
	    if (r == ref)   found = true }}

    go_to_previous_reference(ref, refs) {
	var last      = false
	
	for (var i in refs) {
	    var r = refs[i]
	    if (last && r == ref)
		return this.open_reference(last)
	    last  = r }}

	
    render({bible_params, viewing, lectionary_params, reference, translation}) {
	var actions = {
	    open_reference:             this.open_reference.bind(this),
	    close_reference:            this.close_reference.bind(this),
	    go_to_next_reference:       this.go_to_next_reference.bind(this),
	    go_to_previous_reference:   this.go_to_previous_reference.bind(this)}
	
	return __(
	    'div', {},
	    __('div', {id: 'main-reader'},
	       __(Navigation, {nav_open: this.state.nav_open,
			       toc:      this.state.toc,
			       actions: {
				   open_chapter: (book, verse) => {
				       this.setState({nav_open: false})
				       this.props.history.push(
					   "/bible/" + book + "/" + verse) },
				   open_nav: () => {
				       this.setState({nav_open:       !this.state.nav_open,
						      lect_nav_open:   false}) }}}),

	       __(LectionaryNavigation, {
		   nav_open: this.state.lect_nav_open,
		   date:     this.props.lectionary_params
		       ? new Date("20" + this.props.lectionary_params.year + "-"
				  + this.props.lectionary_params.month + "-"
				  + this.props.lectionary_params.day)
		       : new Date(),
		   actions: {
		       open_day: (year, month, day) => {
			   this.setState({lect_nav_open: false})
			   this.props.history.push(
			       "/lectionary/" + year + "/" + month + "/" + day) },
		       open_today: () => {
			   this.setState({lect_nav_open: false})
			   this.props.history.push("/lectionary/today") },
		       open_nav: () => {
			   this.setState({lect_nav_open: !this.state.lect_nav_open,
					  nav_open:       false}) }}}),

	       viewing == 'lectionary' && 
	       __(Lectionary, {
		   day:         lectionary_params.day,
		   year:        lectionary_params.year,
		   month:       lectionary_params.month,
		   bible_data:  this.bible_data,
		   reference:   reference,
		   translation: translation,
		   actions}),
	       
	       viewing == 'bible' &&
	       __(BibleChapter, {
		   book:        bible_params.book,
		   chapter:     bible_params.chapter,
		   verse:       bible_params.verse,
		   bible_data:  this.bible_data,
		   reference:   reference,
		   translation: translation,
		   actions}))) }}


class BibleChapter extends Component {
    constructor(props) {
	super(props)
	this.state        = {books:  {},
			     toc:    {bible: {}}}}

    componentWillMount() {
	this.bible_data = this.props.bible_data
	this.load_data(this.props) }

    componentWillReceiveProps(props) {
	if (props.book          != this.props.book
	    || props.chapter    != this.props.chapter
	    || props.verse      != this.props.verse
	    || props.reference  != this.props.reference)
	    this.load_data(props) }

    load_data(props) {
	this.bible_data.get_chapter(
	    {book:        props.book,
	     chapter:     props.chapter,
	     verse:       props.verse,
	     reference:   props.reference},
	    (book) => {
		this.setState({books: Object.assign(
		    this.state.books,
		    {[props.book]:
		     {[props.chapter]: book}}) }) }) }

    render({book, chapter, verse, reference, translation, actions}) {
	var verses      = deep_get(this.state.books,
				   [book, chapter, 'translations', translation, 'verses'],
				   [])
	if (reference) reference = reference.split(':')

	return __(
	    'div', {className: 'bible-book'},
	    __('h1', {}, book, " ", chapter),

	    __(Verses, {verses, books: this.state.books,
			book, chapter, reference, actions})) }}


class Lectionary extends Component {
    constructor(props) {
	super(props)
	this.state        = {books:  {}} }

    componentWillMount() {
	this.bible_data = this.props.bible_data
	this.load_data(this.props) }

    componentWillReceiveProps(props) {
	if (props.day          != this.props.day
	    || props.month     != this.props.month
	    || props.year      != this.props.year)
	    this.load_data(props) }

    load_data(props) {
	this.bible_data.get_lectionary(
	    props.year,
	    props.month,
	    props.day,
	    props.translation,
	    (readings) => {
		this.setState({readings}) },
	    (book, book_name, book_chapter) => {
		this.setState({books: Object.assign(
		    this.state.books,
		    {[book_name]:
		     {[book_chapter]: book}}) }) }) }

    get_verses(book, chapter, verses) {
	var response    = {}

	verses.map((verse) => {
	    response[verse - 1] = deep_get(this.state.books,
					   [book,
					    chapter,
					    'translations',
					    this.props.translation,
					    'verses',
					    (verse - 1)],
					   '') })
	return response }

    render({day, month, year, reference, translation, actions}) {
	var readings    = this.state.readings || {title: '', readings: []}
	if (reference) reference = reference.split(':')

	return __(
	    'div', {className: 'bible-lectionary'},
	    readings.readings.map((reading) => {
		var chapters = {}
		reading.verses.map((verse) => {
		    if (!chapters[verse.chapter])
			chapters[verse.chapter] = []
		    chapters[verse.chapter].push(verse.verse) })

		return __(
		    'div', {},
		    Object.keys(chapters).map((chapter) => __(
			'span', {},
			__('h1', {}, reading.label + " - " + reading.book, " ", chapter),

			__(Verses, {verses:   this.get_verses(reading.book, chapter, chapters[chapter]),
				    books:    this.state.books,
				    book:     reading.book,
				    chapter,
				    reference,
				    actions})))) })) }}

function LectionaryNavigation({actions, date, nav_open}) {
    return __(
	'div', {},
	__('div', {id: 'open-lectionary-navigation'},
	   __('i', {className: 'fa fa-calendar',
		    onClick:   () => actions.open_nav(), 
		    id: 'open-lectionary-button'})),
		  
	nav_open && __(
	    'div', {id: 'lectionary-navigation'},
	    __('button', {className: 'btn',
			  onClick:   () => actions.open_today()},
	       "todays readings"),
	    __('br'),
	    __('input', {className: 'form-control',
			 type:      'date',
			 value:      date,
			 onInput:   (e) => {
			     actions.open_day(e.target.value.slice(2, 4),
					      e.target.value.slice(5, 7),
					      e.target.value.slice(8, 10))}}))) }

function Navigation({actions, nav_open, toc}) {
    return __(
	'div', {},
	__('div', {id: 'open-navigation'},
	   __('i', {className: 'fa fa-book',
		    onClick:   () => actions.open_nav(), 
		    id: 'open-button'})),
		  
	nav_open && __(
	    'div', {id: 'navigation'},
		      
	    Object.keys(toc.bible).map((book) => __(
		'div', {},
		__('strong', {}, book),
			  
		toc.bible[book].map((x, i) => __(
		    'div', {className: 'chapter-link',
			    onClick:   () => actions.open_chapter(book, i + 1)},
		    i + 1)))))) }

function get_references(book, chapter, verse, books) {
    var references      = deep_get(books,
				   [book, chapter, 'references'],
				   [])
    var uniq            = {}
    for (var i in references)
	uniq[references[i].text] = references[i]
    references          = Object.values(uniq)
    references.map((r) => r.book = book)
    
    if (!verse)  return references
    else         return references.filter((x) => x.verse == verse) }

function sort_references(a, b) {
    if (a.verse > b.verse)       return 1
    else if (b.verse > a.verse)  return -1
    else {
	if (a.source_code + a.source_paragraph > b.source_code + b.source_paragraph)
	    return 1
	else return -1 }}
    

function Verses({verses, books, book, chapter, reference, actions}) {
    var all_references = get_references(book, chapter, false, books)
	.sort(sort_references)
    return __(
	'div', {className: 'verses'},
	Object.keys(verses)
	    .map((v) => Number.parseInt(v))
	    .sort((a, b) => a > b ? 1 : -1).map((i) => {
	    var verse = verses[i]
	    return __(
		'div', {className: 'verse'},
		__('div', {className: 'verse-number'},
		   i + 1),
		__('div', {className: 'main-part'},
		   verse),
		__('div', {className: 'annotations-part'},
		   all_references
		   .filter((r) => r.verse == i+ 1)
		   .map((ref) => [
		       reference
			   && reference[0] == ref.source_code
			   && reference[1] == i + 1
			   && __(Reference, {reference: ref, actions, all_references}), 
	       
		       __('div', {className: 'annotation-link',
				  onClick: () => actions.open_reference(ref, i + 1)},
			  ref.author || ref.folder)]))) })) }

function Reference({reference, all_references, actions}) {
    return __(
	'div', {className: 'open-reference'},
	__('div', {className: 'next-btn fa fa-chevron-right',
		   onClick:   () => actions.go_to_next_reference(reference, all_references)}),
	__('div', {className: 'prev-btn fa fa-chevron-left',
		   onClick:   () => actions.go_to_previous_reference(reference, all_references)}),
	__('div', {className: 'close-btn',
		   onClick:   () => actions.close_reference()},
	   "x"),
	__('p', {className: 'reference-author-name'}, reference.author),
	__('p', {}, reference.text.replace(/\[fn-.*?-nf\]/g, '*')),
	__('p', {className: 'reference-title', style: {marginBottom: 0}},
	   reference.title)) }


render(
    __(Main),
    document.querySelector("#main"))

