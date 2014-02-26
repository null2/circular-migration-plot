#!/usr/bin/env node

// Filter a migrations CSV.
// 
// Usage:
//   cmp-filter countries.csv flows.csv
//   cmp-filter countries.csv -
//   cat flows.csv | cmp-filter countries.csv
//   head flows.csv | cmp-filter countries.csv


var fs = require('fs');
var _ = require('highland');
var parser = require('binary-csv');
var parseOptions = { json: true };
var usage = 'Usage:\n  cmp-filter countries.csv flow.csv';



// Open input stream and return CSV parse Highland Stream
function open(stream) {
  return _(stream.pipe(parser(parseOptions)));
}


// Countries by iso code
function mapCountries(memo, row) {
  // jshint -W116
  memo[row.iso] = row.show == 1;

  return memo;
}

// Filter rows by origin_iso and destination_iso
function filterByIso(countriesMap) {
  return function(row) {
    return countriesMap[0][row.origin_iso] && countriesMap[0][row.destination_iso];
  };
}

// Write a row in CSV format to stdout.
// First row gets headers prepended.
var headersWritten = false;
function writeCsv(row) {
  if (!headersWritten) {
    _.keys(row).toArray(function(a) {
      console.log(a.join(','));
    });
    headersWritten = true;
  }

  _.values(row).toArray(function(a) {
    console.log(a.join(','));
  });
}


// Countries CSV look like:
//
//   iso,show
//   ABW,0
//   AFG,1
// 
// Must have the headers iso and show.
var countriesCsvFilename = process.argv[2];
try {
  var countries = fs.createReadStream(countriesCsvFilename);
} catch(e) {
  return console.error(usage);
}


// Input CSV has the form:
// 
//   origin_iso,destination_iso
//   CAN,CAN
//   CAN,USA
// 
// Must the headers origin_iso and destination_iso.
var inputCsvFilename = process.argv[3];
try {
  var input = (!process.stdin.isTTY || inputCsvFilename === '-') ? process.stdin : fs.createReadStream(inputCsvFilename);
} catch(e) {
  return console.error(usage);
}


open(countries).reduce({}, mapCountries).toArray(function(f) {
  open(input).filter(filterByIso(f)).each(writeCsv);
});

