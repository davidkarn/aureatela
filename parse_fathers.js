var cheerio     = require('cheerio')
var fsp         = require('fs').promises
var fs          = require('fs')
var mkdirp      = require('mkdirp')
var util        = require('util')
var readfile    = util.promisify(fs.readFile)

var book_keys_tbl = {
    "genesis": "genesis",
    "exodus": "exodus",
    "leviticus": "leviticus",
    "numbers": "numbers",
    "deuteronomy": "deuteronomy",
    "joshua": "joshua",
    "judges": "judges",
    "ruth": "ruth",
    "1 samuel": "1 samuel",
    "2 samuel": "2 samuel",
    "1 kings": "1 kings",
    "2 kings": "2 kings",
    "1 chronicles": "1 chronicles",
    "2 chronicles": "2 chronicles",
    "ezra": "ezra",
    "nehemiah": "nehemiah",
    "esther": "esther",
    "job": "job",
    "psalms": "psalms",
    "proverbs": "proverbs",
    "ecclesiastes": "ecclesiastes",
    "song of solomon": "song of solomon",
    "isaiah": "isaias",
    "jeremiah": "jeremiah",
    "lamentations": "lamentations",
    "ezekiel": "ezechiel",
    "daniel": "daniel",
    "hosea": "hosea",
    "joel": "joel",
    "amos": "amos",
    "obadiah": "obadiah",
    "jonah": "jonah",
    "micah": "micah",
    "nahum": "nahum",
    "habakkuk": "habakkuk",
    "zephaniah": "zephaniah",
    "haggai": "haggai",
    "zechariah": "zechariah",
    "malachi": "malachias",
    "matthew": "matthew",
    "mark": "mark",
    "luke": "luke",
    "john": "john",
    "the acts": "acts",
    "romans": "romans",
    "1 corinthians": "1 corinthians",
    "2 corinthians": "2 corinthians",
    "galatians": "galatians",
    "ephesians": "ephesians",
    "philippians": "philippians",
    "colossians": "colossians",
    "1 thessalonians": "1 thessalonians",
    "2 thessalonians": "2 thessalonians",
    "1 timothy": "1 timothy",
    "2 timothy": "2 timothy",
    "titus": "titus",
    "philemon": "philemon",
    "hebrews": "hebrews",
    "james": "james",
    "1 peter": "1 peter",
    "2 peter": "2 peter",
    "1 john": "1 john",
    "2 john": "2 john",
    "3 john": "3 john",
    "jude": "jude",
    "revelation": "apocalypse",
    "esther (greek)": "esther (greek)",
    "judith": "judith",
    "tobit": "tobit",
    "1 maccabees": "1 maccabees",
    "2 maccabees": "2 maccabees",
    "3 maccabees": "3 maccabees",
    "4 maccabees": "4 maccabees",
    "wisdom": "wisdom",
    "sirach": "sirach",
    "baruch": "baruch",
    "letter of jeremiah": "letter of jeremiah",
    "prayer of azariah / song of the three young men": "prayer of azariah / song of the three young men",
    "susanna": "susanna",
    "bel and the dragon": "bel and the dragon",
    "prayer of manasseh": "prayer of manasseh",
    "1 esdras": "1 esdras",
    "2 esdras": "2 esdras",
    "psalm 151": "psalm 151",
    "epistle to laodiceans": "epistle to laodiceans",
    "psalterium iuxta hebraeos": "psalterium iuxta hebraeos"}

var books_tbl   = [
    ["Genesis","1 Mz","1 Mojz","Gen","Gn","Ge","Post","Has","Geneza","1 Mojzes","Genesis","1 Mose"],
    ["Exodus","2 Mz","2 Mojz","Exo","Ex","Exod","Izl","Ir","Eksodus","2 Mojzes","Exodus","2 Mose"],
    ["Leviticus","3 Mz","3 Mojz","Lev","L�v","Lv","Lb","Leu","Levitik","3 Mojzes","Leviticus","3 Mose"],
    ["Numbers","4 Mz","4 Mojz","Num","Nm","Nu","Nb","Nomb","Br","Zen","Numeri","4 Mojzes","Numbers","4 Mose"],
    ["Deuteronomy","5 Mz","5 Mojz","Deu","Dt","Deut","Pnz","Devteronomij","5 Mojzes","Deuteronomium","Deuteronomy","5 Mose","Deuteronomio"],
    ["Joshua","Joz","Jos","Josh","Ios","J�","Jozue","Joshua","Jozua","Josua"],
    ["Judges","Sod","Sodn","Jdg","Judg","Jg","Jug","Jdc","Jue","Jt","Idc","Re","Ri","Richt","Epa","Sodniki","Judges","Rechters","Richteren","Richter","Jueces"],
     ["Ruth","Rut","Ru","Rth","Rt","Ruth","Ruta"],
     ["1 Samuel","1 Sam","1 Sa","1 S","1 Sm","1 Rg","1 Regn","1 Samuel"],
     ["2 Samuel","2 Sam","2 Sa","2 S","2 Sm","2 Rg","2 Regn","2 Samuel"],
     ["1 Kings","1 Kr","1 Kra","1 Kralj","1 Ki","1 Kgs","1 R","1 Re","3 Rg","3 Regn","1 Kon","1 Erg","1 Rois","1 Kings","1 Kralji","1 Koningen","1 Reyes"],
     ["2 Kings","2 Kr","2 Kra","2 Kralj","2 Ki","2 Kgs","2 R","2 Re","4 Rg","4 Regn","2 Kon","2 Erg","2 Rois","2 Kings","2 Kralji","2 Koningen","2 Reyes"],
     ["1 Chronicles","1 Krn","1 Kron","1 Let","1 Ljet","1 Ch","1 Cr","1 Cro","1 Kro","1 Chron","1 Chr","1 Letopisi","1 Chronicles","1 Kronieken","1 Chronik"],
     ["2 Chronicles","2 Krn","2 Kron","2 Let","2 Ljet","2 Ch","2 Cr","2 Cro","2 Kro","2 Chron","2 Chr","2 Letopisi","2 Chronicles","2 Kronieken","2 Chronik"],
     ["Ezra","Ezr","Ezdr","Ezra","Esra","Esr","Esd","1 Ezr","1 Esr","Ezdra","Esdras"],
     ["Nehemiah","Neh","Ne","2 Ezr","2 Esr","Nehemija","Nehemiah","Nehemia"],
     ["Esther","Est","Ester","Esth","Esther","Estera"],
     ["Job","Job","Hi","Jb","Iob","Hiob","Ijob"],
     ["Psalms","Ps","Psa","PsG","Sal","Sl","Psalm","Psalmi","Psalms","Psalmen","Salmos"],
     ["Proverbs","Prg","Preg","Pro","Prov","Pr","Prv","Prou","Spr","Izr","EsZ","Pregovori","Proverbs","Spreuken"],
     ["Ecclesiastes","Prd","Prid","Prop","Ec","Ecc","Eccl","Ecl","Qo","Qoh","Coh","Koh","Pred","Pridigar","Ecclesiastes","Prediker","Prediger","Qoheleth"],
     ["Song of Solomon","Vp","Sng","Song","Sgs","SS","Cant","Cnt","Ct","Kt","Hoogl","Hl","Hld","Pj","VisokaPesem","VisokaP","Canticles","Hooglied","Hoheslied","Cantares"],
     ["Isaiah","Iz","Izai","Izaija","Isa","Is","Jes","Js","Es","�s","Isaiah","Jesaja"],
     ["Jeremiah","Jerr","Jr","Ier","Jeremija","Jeremiah","Jeremia"],
     ["Lamentations","Lam","La","Lm","Thr","Klaagl","Kl","Klgl","Klgld","Nk","�alostinke","Lamentations","Klaagliederen","Klagelieder","Lamentaciones"],
     ["Ezekiel","Ezk","Ez","Eze","Ezec","Ezek","Hes","Ezekiel","Ezekijel","Ezechiel","Hesekiel","Ezequiel"],
     ["Daniel","Dan","Da","Dn","Daniel","Danijel"],
     ["Hosea","Oz","Ozea","Hos","Ho","Os","Ozej","Hosea","Osee","Oseas"],
     ["Joel","Jl","Jol","Joel","Ioel"],
     ["Amos","Am","Amo","Amos"],
     ["Obadiah","Abd","Ab","Oba","Obd","Obad","Ob","Abdija","Obadija","Obadiah","Obadja"],
     ["Jonah","Jon","Jnh","Ion","Jona","Jonah"],
     ["Micah","Mih","Mic","Mi","Mch","Mich","Miq","Mihej","Miha","Micah","Micha","Miqueas"],
     ["Nahum","Nah","Nam","Na","Nahum"],
     ["Habakkuk","Hab","Ha","Habakuk","Habakkuk","Habacuc"],
     ["Zephaniah","Sof","Zep","Zeph","Zef","Sef","So","Soph","Sofonija","Zefanija","Zephaniah","Sefanja","Zephanja","Zefanja"],
     ["Haggai","Ag","Hag","Hagg","Hgg","Hg","Agg","Agej","Hagaj","Haggai","Hageo"],
     ["Zechariah","Zah","Zec","Zech","Zch","Za","Zac","Zach","Sach","Zaharija","Zechariah","Zacharia","Sacharja"],
     ["Malachi","Mal","Ml","Malahija","Malachi","Maleachi"],
     ["Matthew","Mt","Mat","Matt","Matej","Matthew","Matteus","Mateo","Matth"],
     ["Mark","Mr","Mar","Mrk","Mk","Mc","Marko","Mark","Marcus","Markus","Marc","Marcos"],
     ["Luke","Lk","Luk","Lc","Luc","Lu","L","Luka","Luke","Lucas","Lukas","Lucas"],
     ["John","Jn","Jan","Jhn","Joh","Jo","J","Io","Iv","Janez","John","Johannes","Jean","Juan"],
     ["The Acts","Apd","Dej","DejAp","Act","Ac","Hand","Hnd","Apg","Dj","Hch","Eg","Acts","Dela","Dejanja","Handelingen","Apostelgeschichte","Hechos"],
     ["Romans","Rim","Rimlj","Rom","Ro","Rm","R","Erm","Rimljanom","Romans","Romeinen","Romanos"],
     ["1 Corinthians","1 Kor","1 Cor","1 Co","1 Ko","1 K","1 Korin�anom","1 Corinthians","1 Korintiers","1 Korinthe","1 Korinther","1 Corintios"],
     ["2 Corinthians","2 Kor","2 Cor","2 Co","2 Ko","2 K","2 Corinthians","2 Korintiers","2 Korinthe","2 Korinther","2 Corintios"],
     ["Galatians","Gal","Ga","Gl","G","Gala�anom","Galatians","Galaten","Galater"],
     ["Ephesians","Ef","Efez","Eph","Ep","E","Ephesians","Efeziers","Efeze","Epheser","Efesios"],
     ["Philippians","Flp","Filip","Filipp","Fil","Fl","Php","Ph","Phil","Phili","Filipljanom","Philippians","Filippenzen","Philipper","Filipenses"],
     ["Colossians","Kol","Col","Colossians","Kolossenzen","Kolosser","Colosenses"],
     ["1 Thessalonians","1 Tes","1 Sol","1 Th","1 Ts","1 Te","1 Tess","1 Thes","1 Thess","1 Thessalonians","1 Tessalonicenzen","1 Thessalonicher","1 Tesalonicenses"],
     ["2 Thessalonians","2 Tes","2 Sol","2 Th","2 Ts","2 Te","2 Tess","2 Thes","2 Thess","2 Thessalonians","2 Tessalonicenzen","2 Thessalonicher","2 Tesalonicenses"],
     ["1 Timothy","1 Tim","1 Ti","1 Tm","1 T","1 Timoteju","1 Timothy","1 Timoteus","1 Timotheus","1 Timoteo"],
     ["2 Timothy","2 Tim","2 Ti","2 Tm","2 T","2 Timoteju","2 Timothy","2 Timoteus","2 Timoteus","2 Timotheus","2 Timoteo"],
     ["Titus","Tit","Tt","Titus","Titu","Tite","Tito"],
     ["Philemon","Flm","Filem","Film","Phm","Phlm","Phile","Philem","Filemonu","Philemon","Filemon"],
     ["Hebrews","Heb","Hebr","H�br","Hbr","Hb","He","H","Hebrejcem","Hebrews","Hebreeers","Hebreeen","Hebreos"],
     ["James","Jak","Jas","Jam","Jm","Ja","Jc","Jac","Jacq","Iac","Stg","St","Jakob","James","Jakobus","Santiago"],
     ["1 Peter","1 Pt","1 Pet","1 Petr","1 Pe","1 Pi","1 P","1 Peter","1 Petrus","1 Pedro"],
     ["2 Peter","2 Pt","2 Pet","2 Petr","2 Pe","2 Pi","2 P","2 Peter","2 Petrus","2 Pedro"],
     ["1 John","1 Jn","1 Jan","1 Joh","1 Jo","1 J","1 Io","1 Iv","1 John","1 Janez","1 Johannes","1 Jean","1 Juan"],
     ["2 John","2 Jn","2 Jan","2 Joh","2 Jo","2 J","2 Io","2 Iv","2 John","2 Janez","2 Johannes","2 Jean","2 Juan"],
     ["3 John","3 Jn","3 Jan","3 Joh","3 Jo","3 J","3 Io","3 Iv","3 John","3 Janez","3 Johannes","3 Jean","3 Juan"],
     ["Jude","Jud","Juda","Jude","Jd","Ju","Iud","Judas"],
     ["Revelation","Raz","Rev","Ap","Apc","Apoc","Apok","Apk","Op","Openb","Offb","Otk","Razodetje","Apokalipsa","Revelation","Openbaring","Apokalyps","Offenbarung","Apocalipsis"],
     ["Esther (Greek)","EstG","EsG","EstGr","EsthGr","EstGrec","EstD","EstDC","GkEst","AddEsth","StEst","Estera(gr)","Esther(gr)","Esther(Greek)","Ester(griechisch)","Ester(Griego)","Ester_(Grieks)"],
     ["Judith","Jdt","Jdth","Idt","Judita","Judith","Judit"],
     ["Tobit","Tob","Tb","Tobit","Tobija"],
     ["1 Maccabees","1 Mkb","1 Mak","1 Makk","1 Mc","1 Mac","1 Macc","1 Mcc","1 Ma","1 M","1 Makabejci","1 Maccabees","1 Makkabeeen","1 Makkabeeers","1 Macabeos"],
     ["2 Maccabees","2 Mkb","2 Mak","2 Makk","2 Mc","2 Mac","2 Macc","2 Mcc","2 Ma","2 M","2 Makabejci","2 Maccabees","2 Makkabeeen","2 Makkabeeers","2 Macabeos"],
     ["3 Maccabees","3 Mkb","3 Mak","3 Makk","3 Mc","3 Mac","3 Macc","3 Mcc","3 Ma","3 M","3 Makabejci","3 Maccabees","3 Makkabeeen","3 Makkabeeers","3 Macabeos"],
     ["4 Maccabees","4 Mkb","4 Mak","4 Makk","4 Mc","4 Mac","4 Macc","4 Mcc","4 Ma","4 M","4 Makabejci","4 Maccabees","4 Makkabeeen","4 Makkabeeers","4 Macabeos"],
     ["Wisdom","Mdr","Modr","Wis","Wisd","Weish","Wijsh","W","Sg","Sag","Sap","Sb","Sab","Sv","Mudr","Jkd","Modrost","Wisdom","Wijsheid","Weisheit"],
     ["Sirach","Sir","Si","Sirah","Sirach","Eclo","Ecclesiasticus","Ecclesiastique"],
     ["Baruch","Bar","Ba","Baruh","Baruch","Baruc"],
     ["Letter of Jeremiah","JerP","LJe","LJer","LtJr","LetJer","LettreJer","EpJer","EpJr","EpistJer","BrJer","CtJ","JrGt","JeremijevoP","JeremijevoPismo","BriefJeremias","BrfJer","Brief_van_Jeremia"],
     ["Prayer of Azariah / Song of the Three Young Men","DanD","AddDan","DanAdd","StDan","DanZ","DnGrec","DanGrec","DnDC","DnGr","PrAzar","Az","S3Y","SofThr","SongThr","Daniel(dodatki)","Daniel(Additions)","ToevDan","DanGr","Toevoegingen_aan_Dan"],
     ["Susanna","Suz","Sus","Suzana","Susanna","Susana"],
     ["Bel and the Dragon","Bel","BelDr","Zmaj","Dragon"],
     ["Prayer of Manasseh","Man","PrMan","OrMan","GebMan","Manase","Manasse","Manasses","PrManasses"],
     ["1 Esdras","1 Esd","3 Esr","3 Ezr","3 Ezra","1 Esdras","1 Ezdra","3 Esdras"],
     ["2 Esdras","2 Esd","4 Esr","4 Ezr","4 Ezra","2 Esdras","2 Ezdra","4 Esdras"],
     ["Psalm 151","Ps151","Sal151","Sl151","Psalm151","Salmo151","PsCLI"],
     ["Epistle to Laodiceans","Lao","Laod","Laodikejcem","Laodiceans"],
    ["Psalterium iuxta Hebraeos","PsH","PsHeb","SIH","PsalmH"]]
    .map((list) => list.map((item) => item.toLowerCase()))

function member(a, i) {
    return a.indexOf(i) > -1 }

function parse_roman(str1) {
    if(str1 == null)         return -1
    if (str1.match(/^\d+$/)) return Number.parseInt(str1)
    
    var num = char_to_int(str1.charAt(0))
    var pre, curr

    for (var i = 1; i < str1.length; i++){
	curr     = char_to_int(str1.charAt(i))
	pre      = char_to_int(str1.charAt(i-1))
	
	if(curr <= pre)
	    num   += curr
	else 
	    num    = num - (pre * 2) + curr }
	
    return num }

function char_to_int(c){
    switch (c.toUpperCase()) {
    case 'I': return 1
    case 'V': return 5
    case 'X': return 10
    case 'L': return 50
    case 'C': return 100
    case 'D': return 500
    case 'M': return 1000
    default: return 0 }}

async function async_each(array, callback) {
    for (let index = 0; index < array.length; index++) 
	await callback(index, array[index], array) }

async function parse_from_ttorg(filename) {
    filename    = filename || 'sources/www.tertullian.org/fathers2/ANF-01/anf01-05.htm'
    var folder  = filename.match(/fathers2\/(.*?)\//)[1]
    fs.readFile(filename, 'utf8', async (err, data) => {
	var $             = cheerio.load(data)
	var collection    = $('title').text().trim()
	var as            = Object.values($('a'))
	var ps            = Object.values($('p'))
	var tracking      = false
	var title
	
	for (var i in as) 
	    if ($(as[i]).text().length > 3) {
		var el  = $(as[i])
		el.children().each((i, x) => $(x).text(''))
		title = el.text().trim()
		break }

	var code          = title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
	var article       = {title, code, chapters: []}
	var chapter       = {name:       '',
			     index:       1,
			     paragraphs: []}

	var write_reference = async (book, chapter, verse, source_code, source_chapter, source_paragraph) => {
	    var book = book_keys_tbl[book]
	    var data = await fsp.readFile('data/bible/' + book + '/' + chapter + '/douay.json')
	    data     = JSON.parse(data)

	    if (!data.references) data.references = []

	    data.references.push({chapter, verse, source_code, source_chapter, source_paragraph}) }
	
	
	var save_article = async (article) => {
	    var folder = 'data/sources/' + article.code
	    console.log(folder)
	    article.chapters.map((chapter) => {
		chapter.paragraphs.map((paragraph) => {
		    paragraph.references.map((reference) => {
			reference.bible_refs.map((bible_ref) => {
			    bible_ref.verses.map((chapter) => {
				var verse = chapter.verses[0]
				write_reference(bible_ref.book,
						chapter.chapter,
						verse,
						article.code,
						chapter.index,
						paragraph.index) }) }) })  }) })
	    
	    mkdirp(folder).then((m, e) => {
		fs.writeFile(folder + '/source.json', JSON.stringify(article), () => {}) }) }

	
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

	    var node       = fn$('a[name="' + code + '"]').parent()
	    $('sup', node).text('')
	    var text       = node.text().trim()
	    if (text.match(/\[.*?\]/))
		text = text.match(/\[(.*?)\]/)[1]
	    texts          = text.split(';')
	    var bible_refs = []
            for (var i in texts) {
		var text       = texts[i].trim().replace(', etc', '').replace('. etc', '')
		var parsed     = text.toLowerCase().match(/(^(Comp. )?[a-zA-Z 0-9]+?)\.? (([0-9ivxlcdmIVXLCDM]+[.,] )?(\d+(-\d+)?(, \d+)?)[,.] ?)+$/)
		var verse      = false
		
		if (parsed) {
		    var book = parsed[1]
		    if (parsed[1].slice(0, 6) == "Comp. ")
			book = parsed[1].slice(6).replace(/[^a-z0-9 ]/g, '')
		
		    for (var i in books_tbl) {
			if (member(books_tbl[i], book)) {
			    var rest     = text
				.slice(parsed[1].length)
				.replace(/(\d+), (\d+[.;])/g, '$1-$2')
				.replace(/^\. /, '')
				.split(',')
				.map((x) => x.trim())
			    var verses   = rest.map(
				(x) => {
				    var parts    = x.split('.');
				    var chapter  = parse_roman(parts[0])
				    if (!parts[1]) parts[1] = '1'
				    var _verses  = parts[1]
					.split('-')
					.map((n) => parse_roman(n))
				    var verses   = []
				    
				    if (_verses.length > 1)
					for (var i = _verses[0]; i <= _verses[1]; i++)
					    verses.push(i)
				    else
					verses = _verses
				
				    return {chapter, verses}})

			    verse        = {book:      books_tbl[i][0],
					    verses}
			    bible_refs.push(verse) }}}}


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

	console.log(article) }) }
		

parse_from_ttorg().then((f) => console.log(f))
