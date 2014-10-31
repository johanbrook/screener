var Handlebars = require('handlebars'),
    fs =         require('fs'),
    path =       require('path'),
    csv =        require('csv-parser'),
    _ =          require('highland')

var log = function(msg) {
  return function(arg) {
    if(msg.indexOf('%l') && arg && arg.length) {
      console.log('   ~ ' + msg.replace('%l', arg.length))
    }
    else {
      console.log('   ~ ' + msg)
    }
    return arg
  }
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

  var readFile = _.wrapCallback(fs.readFile)

  log("Reading from " + input)()

  var jsonStream = readFile(input)
    .through(csv())
    .map(transformData)
    .collect()
    .map(log('Read %l applications in total'))

  jsonStream.map(template)
    .pipe(fs.createWriteStream(output))
    .on('finish', log('Wrote to ' + output))
}
