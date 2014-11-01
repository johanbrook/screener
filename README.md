# Screener

A tool for reading in CSV data and applying it as JSON to a Handlebars template. Makes it easier to screen.

# Usage

From the command line:

```bash
cd screener
./bin/screen input [template]
```

`input` is a path to a CSV file. `template` defaults to `template.html`. Outputs a HTML file in the same directory.

From a script:

```javascript
var screener = require('../index')

screener('somefile.csv', './template.html')
```

From the `gulpfile.js`:

```bash
gulp template
```

# License

MIT.
