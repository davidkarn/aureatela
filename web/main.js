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
					     reference:     match.params.reference,
					     ...props})}}),
	       
	       !window.location.hash && 
	       __(Redirect, {from: "/", to: "/bible"}))) }}

class BibleView extends Component {
    constructor(props) {
	super(props)
	this.state        = {books:  {},
			     toc:    {bible: {}}}}

    componentWillMount() {
	this.bible_data = new BibleData()
	this.bible_data.get_toc(
	    (toc) => this.setState({toc}) )
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

    get_references(book, chapter, verse) {
	var references      = deep_get(this.state.books,
				       [book, chapter, 'references'],
				       [])

	return references.filter((x) => x.verse == verse) }

    open_reference(ref, verse) {
	this.props.history.push('/bible/' + this.props.book + "/"
				+ this.props.chapter + "/" + this.props.verse + "/"
				+ ref.source_code + ":" + verse) }

    close_reference() {
	this.props.history.push('/bible/' + this.props.book + "/"
				+ this.props.chapter + "/" + this.props.verse) }	

    render_reference(ref) {
	return __(
	    'div', {className: 'open-reference'},
	    __('div', {className: 'close-btn',
		       onClick:   () => this.close_reference()},
	       "x"),
	    __('p', {className: 'ref-author-name'}, ref.author),
	    __('p', {}, ref.text),
	    __('p', {className: 'ref-title', style: {marginBottom: 0}},
	       ref.title)) }
    
    render({book, chapter, verse, reference, translation}) {
	var verses      = deep_get(this.state.books,
				   [book, chapter, 'translations', translation, 'verses'],
				   [])
	if (reference) reference = reference.split(':')

	return __(
	    'div', {},
	    __('div', {id: 'main-reader'},
	       __('h1', {}, book, " ", chapter),
	       __('div', {id: 'open-navigation'},
		  
		  __('i', {className: 'fa fa-book',
			   onClick:   () => this.setState({nav_open: !this.state.nav_open}),
			   id: 'open-button'})),
		  
	       this.state.nav_open && __(
		   'div', {id: 'navigation'},
		      
		   Object.keys(this.state.toc.bible).map((book) => __(
		       'div', {},
		       __('strong', {}, book),
			  
		       this.state.toc.bible[book].map((x, i) => __(
			   'div', {className: 'chapter-link',
				   onClick: () => {
				       this.setState({nav_open: false})
				       this.props.history.push(
					   "/bible/" + book + "/" + (i + 1)) }},
			   i + 1))))),
	       
	       verses.map((verse, i) => __(
		   'div', {className: 'verse'},
		   __('div', {className: 'verse-number'},
		      i + 1),
		   __('div', {className: 'main-part'},
		      verse),
		   __('div', {className: 'annotations-part'},
		      this.get_references(book, chapter, i + 1)
		      .map((ref) => [
			  reference
			      && reference[0] == ref.source_code
			      && reference[1] == i + 1
			      && this.render_reference(ref),

			  __('div', {className: 'annotation-link',
				     onClick: () => this.open_reference(ref, i + 1)},
			     ref.author || ref.folder)])))))) }}



render(
    __(Main),
    document.querySelector("#main"))

