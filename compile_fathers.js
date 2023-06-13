const fs            = require('fs')
const { execSync }  = require('node:child_process')

function get_source_data(path) {
    try {
        const full_path = "public/data/sources/"
              + path[0].split("_").slice(0, 2).join("-").toUpperCase()
              + "/" + path[0] + "/source.json";

        const data =  JSON.parse(fs.readFileSync(full_path));
        
        return {key:          path[0],
                volume_title: data.title,
                sections:     data.chapters}; }
    
    catch (e) {
        console.error(e);
        return null; }}
    
function process_volume(details) {
    const sources = details.paths
          .filter(path => typeof path !== "string")
          .map(path => get_source_data(path));

    const data = {author:    details.author.replace(/ +/g, ' '),
                  title:     details.title,
                  key:       details.key.replace(/^[0-9]+_/, '').replace(/[^a-z_0-9]/g, '_')}
    const author_code = data.author
          .toLowerCase()
          .replace(/[^a-z]/g, '_')
          .replace(/_+/g, '_');

    execSync("mkdir -p data/books/" + author_code + "/" + data.key);
    fs.writeFileSync("data/books/" + author_code + "/" + data.key + "/book.json",
                     JSON.stringify(data));

    sources.forEach(
        (volume, i) => fs.writeFileSync("data/books/" + author_code
                                        + "/" + data.key
                                        + "/volume_" + i + ".json",
                                        JSON.stringify(volume))); }

function process_works() {
    const works = JSON.parse(fs.readFileSync("fathers_works2.json"));
    works.map(process_volume); }

process_works();
