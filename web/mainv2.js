import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import __ from './jsml';
import axios from 'axios'

const Editors = () => {
    const [openEditors, setOpenEditors] = useState([]);
    const [language, setLanguage]       = useState("eng");

    const addEditor = (config) => {
        setOpenEditors([...openEditors, config]);
    }

    const openEditor = (config) => setOpenEditors([config]);

    return __('div', {id: 'main-ui'},
              __(Toc, {openEditor}),
              openEditors.map(config => __(Editor, {...config, language, openEditor, addEditor}))); }

const Editor = ({author, book, volume, language, openEditor, addEditor}) => {
    const [currentVolume, setCurrentVolume] = useState(volume);
    const [volumes, setVolumes]             = useState({});
    const [refsList, setRefsList]           = useState({});

    const contents = volumes[currentVolume];
    const refs     = Object.values(refsList[currentVolume] || {});
    const isV1     = contents && contents.volume_title;
    const isV2     = contents && contents.heading;
    
    useEffect(
        () => {
            if (!volumes[currentVolume]) {
                axios.get(volume.replace(/$./, ''))
                    .then(r => {
                        setVolumes({...volumes, [volume]: r.data}); }); }

            if (!refsList[currentVolume]) {
                axios.get(volume.replace(/$./, '').replace('.json', '_refs.json'))
                    .then(r => {
                        setRefsList({...refsList, [volume]: r.data}); }); }},
        [currentVolume]);

    const linkFootnotes = (text) => {
        const groups   = text.split(/\[fn-[-0-9a-zA-Z_:]+\]/g);
        const content  = [];
        let fn         = 1;

        groups.forEach((g, i) => {
            if (i > 0) {
                content.push(__('sup', {}, fn));
                fn++; }

            content.push(g); });

        return content; }

    const getFootnotes = para => {
        return para.references.map((footnote, i) => {
            return __('div', {className: 'footnote'}, 
                      i, ". ", 
                      footnote.bible_refs
                      ? [__('a', {onClick: () => openEditor({author: 'bible',
                                                             book:   'bible',
                                                             volume: footnote.bible_refs})},
                            footnote.text), 
                         ' ',
                         __('a', {onClick: () => addEditor({author: 'bible',
                                                            book:   'bible',
                                                            volume: footnote.bible_refs})},
                            '>>')]
                      : footnote.text); }); };

    const getReferences = (para, sec_ind, para_ind) => {
        return refs
            .filter(ref => ref.section_index = sec_ind && ref.paragraph_index == para_ind)
            .map(ref => __(
                'div', {className: 'external-reference'},
                __('a', {onClick: () => openEditor({author:  ref.author,
                                                    section: ref.section,
                                                    book:    ref.title,
                                                    volume:  ref.volume})},
                   ref.author, ' ', ref.title),
                ' ',
                __('a', {onClick: () => addEditor({author:  ref.author,
                                                   book:    ref.title,
                                                   section: ref.section,
                                                   volume:  ref.volume})},
                   '>>'),
                __('br'),
                ref.paragraph[language] || ref.paragraph[eng] || ref.paragraph.lat)); };
                

    if (!contents) {
        return __('div', {}); }

    else if (isV1) {
        return __(
            'div', {}, 
            __('strong', {className: 'volume-title'}, contents.volume_title), __('br'),
            __('div', {className: 'volume-body'},
               contents.sections.map((section, sec_ind) => __(
                   'div', {className: 'section'},
                   section.name && __('strong', {}, section.name),
                   section.paragraphs.map((para, para_ind) => __(
                       'div', {className: 'paragraph'}, 
                       __('div', {className: 'text-part'},
                          linkFootnotes(para.text)),
                       __('div', {className: 'ref-part'},
                          getFootnotes(para),
                          getReferences(para, sec_ind, para_ind) ))))))); }
    
    else if (isV2) {
        return __(
            'div', {}, 
            __('div', {className: 'volume-body'},
               contents.parts.map(section => __(
                   'div', {className: 'section'},
                   section.header && __('strong', {}, section.header[language] || section.header.eng),
                   section.paragraphs.map(para => __(
                       'div', {className: 'paragraph'}, 
                       __('div', {className: 'text-part'},
                          para[language] || para.eng),
                       __('div', {className: 'ref-part'},
                         JSON.stringify(para.refs) ))))))); }}

const Toc = ({openEditor}) => {
    const [contents, setContents] = useState([]);
    
    useEffect(
        () => {
            console.log('loading');
            axios.get('/data/toc.json')
                .then(r => {
                    console.log({r});
                    setContents(r.data); }); },
        []);
    
    return __(
        'div', {className: 'toc'},
        contents.map(author => __(
            'div', {className: 'author'},
            __('strong', {}, author.author),
            __('br'),
            author.books.map(book => __(
                'div', {className: 'book',
                        onClick:   () => openEditor({author:  author.author,
                                                     book:    book,
                                                     volume:  book.volumes[0].path})},
                __('a', {}, book.title), __('br'))), 
            __('br')))); };

document.body.innerHTML = '<div id="app"></div>';
console.log('ffff');
const root = createRoot(document.getElementById('app'));
const Main = (() => {
    return __('div', {},
              __(Editors),
              __('h1', {}, "Hello, world"));

});

root.render(__(Main));
