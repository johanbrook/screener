var Handlebars = require('handlebars'),
    fs =         require('fs'),
    path =       require('path'),
    csv =        require('csv-parser'),
    _ =          require('highland'),
    linkify =    require('html-linkify')

Handlebars.registerHelper('twitterLink', function(input) {
  input = Handlebars.Utils.escapeExpression(input)

  var buildLink = function(username) {
    return new Handlebars.SafeString('<a href="http://twitter.com/'+username+'">@'+username+'</a>')
  }

  var username = input.match(/^https?:\/\/twitter\.com\/(\w+)/)
  if(username && username[1]) {
    return buildLink(username[1])
  }
  else if(input.indexOf('@') === 0) {
    return buildLink(input.slice(1))
  }
  return buildLink(input)
})

Handlebars.registerHelper('linkify', function(input) {
  return new Handlebars.SafeString(linkify(input))
})

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

  return jsonStream
}
