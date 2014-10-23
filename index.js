var Handlebars = require('handlebars'),
    csv2json =   require('csv2json'),
    fs =         require('fs'),
    path =       require('path'),
    Promise =    require('bluebird')

Promise.promisifyAll(fs)

var writeToJSON = function(pathToCSV, name, cb) {
  return fs.createReadStream(pathToCSV)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(name).on('finish', cb))
}

var transformData = function(json) {
  var rename = function(key, newKey) {
    this[newKey] = this[key]
    delete this[key]
    return this
  }.bind(json)

  rename('Timestamp', 'createdAt')
  rename('Full name', 'name')
  rename('Twitter', 'twitter')
  rename('Email', 'email')
  rename('Github', 'github')
  rename('Link to further reading', 'link')
  rename('School', 'school')
  rename('How can you contribute to the team?', 'skills')
  rename('Gender', 'gender')
  rename('Phone number', 'phone')
  rename('What song best describes you, and why?', 'song')
  rename('Study programme', 'education')

  return json
}

module.exports = function(input, templatePath) {

  var template = Handlebars.compile(fs.readFileSync(templatePath, 'utf8')),
      output = path.basename(input).split('.')[0] + '.html'

  writeToJSON(input, 'data.json', function(path) {
    fs.readFileAsync('data.json', 'utf8')
      .then(JSON.parse)
      .then(function(json) {
        return json.map(transformData)
      })
      .then(template)
      .then(function(html) {
        return fs.writeFileAsync(output, html)
      })
      .catch(function(err) {
        console.error('Something went wrong.')
        console.error(err)
      })
      .done(function() {
        console.log('Done! Result is in '+output)
      })
  })
}
