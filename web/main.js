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

		       return __(BibleView, {book:          match.params.book || 'matthew',
					     chapter:       int(match.params.chapter) || 1,
					     verse:         int(match.params.verse),
					     translation:  'douay',
					     reference:     match.params.reference})}}),
	       
	       !window.location.hash && 
	       __(Redirect, {from: "/", to: "/bible"}))) }}

class BibleView extends Component {
    constructor(props) {
	super(props)
	this.state        = {books:  {}}}

    componentWillMount() {
	this.bible_data = new BibleData()
	this.load_data() }

    componentWillReceiveProps(props) {
	if (props.book          != this.props.book
	    || props.chapter    != this.props.chapter
	    || props.verse      != this.props.verse
	    || props.reference  != this.props.reference)
	    this.load_data() }

    load_data() {
	this.bible_data.get_chapter(
	    {book:        this.props.book,
	     chapter:     this.props.chapter,
	     verse:       this.props.verse,
	     reference:   this.props.reference},
	    (book) => {
		this.setState({books: Object.assign(
		    this.state.books,
		    {[this.props.book]:
		     {[this.props.chapter]: book}}) }) }) }		      

    get_references(book, chapter, verse) {
	var references      = deep_get(this.state.books,
				       [book, chapter, 'references'],
				       [])
	console.log({references, verse})
	return references.filter((x) => x.verse == verse) }
    
    render({book, chapter, verse, reference, translation}) {
	var verses      = deep_get(this.state.books,
				   [book, chapter, 'translations', translation, 'verses'],
				   [])

	return __(
	    'div', {},
	    __('div', {id: 'main-reader'},
	       __('h1', {}, book, " ", chapter),
	       
	       verses.map((verse, i) => __(
		   'div', {className: 'verse'},
		   __('div', {className: 'verse-number'},
		      i + 1),
		   __('div', {className: 'main-part'},
		      verse),
		   __('div', {className: 'annotations-part'},
		      this.get_references(book, chapter, i + 1)
		      .map((ref) => __('div', {className: 'annotation-link'},
				       ref.folder))))))) }}



render(
    __(Main),
    document.querySelector("#main"))

