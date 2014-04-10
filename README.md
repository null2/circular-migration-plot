# Circular Migration Plot
Creating interactive circular migration plots for the web using D3,
like http://www.global-migration.info/

## Installation
Install globally with npm:
```shell
npm install circular-migration-plot -g
```

## Usage
### 1. Filtration (optional)
You may want to filter countries with small migration flows:
```shell
cmp-filter data/countries.csv data/flows.csv
```

### 2. Compilation
Build the matrix json processible by the library out of the csv input file:
```shell
cmp-compile data/flows.csv
```

### 3. Integration
```html
  <script src="dist/circular-migration-plot.js"></script>
  <div id=timeline></div>
  <div id=chart></div>
  <script>
    CircularMigrationPlot({
      data: 'json/sample.json',
      chart: '#chart',
      timeline: '#timeline'
    });
  </script>
```
See index.html.

## Lets get dirty
```shell
head -n30 data/flows.csv | cmp-filter data/countries.csv | cmp-compile > migration-flows.json
```

## Development
### Hint & Test
To run the unit tests:
```shell
npm test
```

For JShint:
```
npm run jshint
```

### Build
The JavaScript is build using [Browserify](http://browserify.org/)
and then compressed with [UglifyJS](http://lisperator.net/uglifyjs/):
```
npm run build
```
Packagued files land in `dist` folder.

### Server
A development server can be run with
```
npm start
```

License
-------
Copyright (c) 2014 null2 GmbH Berlin  
Licensed under the MIT license.
