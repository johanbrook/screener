var Handlebars = require('handlebars'),
    csv2json =   require('csv2json'),
    fs =         require('fs'),
    path =       require('path'),
    json =       require('json-stream'),
    _ =          require('highland')

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

  var readFile = _.wrapCallback(fs.readFile)

  console.log("Reading from " + input)

  var jsonStream = readFile(input, 'utf8')
    .through(csv2json())
    .through(json())
    .map(transformData)
    .collect()

  jsonStream.observe().apply(function(applications) {
    console.log('Received ' + applications.length + ' applications')
  })

  jsonStream.map(template)
    .pipe(fs.createWriteStream(output))
    .on('finish', function() {
      console.log('Wrote to ' + output)
    })
}
