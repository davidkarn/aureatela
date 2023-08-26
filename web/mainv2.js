import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import __ from './jsml';
import axios from 'axios'

const Editors = () => {
    const [openEditors, setOpenEditors] = useState([]);
    const [language, setLanguage]       = useState("eng");

    const addOpenEditor = (config) => {
        setOpenEditors([...openEditors, config]);
    }

    return __('div', {id: 'main-ui'},
              __(Toc, {openEditor: (config) => setOpenEditors([config])}),
              openEditors.map(config => __(Editor, {...config, language}))); }

const Editor = ({author, book, volume, language}) => {
    const [currentVolume, setCurrentVolume] = useState(volume);
    const [volumes, setVolumes]             = useState({});

    const contents = volumes[currentVolume];
    const isV1     = contents && contents.volume_title;
    const isV2     = contents && contents.heading;
    
    useEffect(
        () => {
            if (!volumes[currentVolume]) {
                axios.get(volume.replace(/$./, ''))
                    .then(r => {
                        setVolumes({...volumes, [volume]: r.data}); }); }},
        [currentVolume]);

    if (!contents) {
        return __('div', {}); }

    else if (isV1) {
        return __(
            'div', {}, 
            __('strong', {className: 'volume-title'}, contents.volume_title), __('br'),
            __('div', {className: 'volume-body'},
               contents.sections.map(section => __(
                   'div', {className: 'section'},
                   section.name && __('strong', {}, section.name),
                   section.paragraphs.map(para => __(
                       'div', {className: 'paragraph'}, 
                       __('div', {className: 'text-part'},
                          para.text),
                       __('div', {className: 'ref-part'},
                          JSON.stringify(para.references) ))))))); }

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
