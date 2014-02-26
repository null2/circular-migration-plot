#!/usr/bin/env node

// Build migration flow data matrix.
// 
// Usage:
//   cmp-compile flows.csv
//   cmp-compile -
//   cat flows.csv | cmp-compile


var fs = require('fs');
var _ = require('highland');
var __ = require('underscore');
var parser = require('binary-csv');
var parseOptions = { json: true };
var usage = 'Usage:\n  cmp-compile flow.csv';


// Region sort order
var sortedRegions = ['North America', 'Africa', 'Europe', 'Fmr Soviet Union', 'West Asia', 'South Asia', 'East Asia', 'South-East Asia', 'Oceania', 'Latin America'];



// Input CSV has the form:
// 
//   originregion_id,originregion_name,destinationregion_id,destinationregion_name,regionflow_1990,regionflow_1995,regionflow_2000,regionflow_2005,xxx,origin_iso,origin_name,destination_iso,destination_name,countryflow_1990,countryflow_1995,countryflow_2000,countryflow_2005,origin_show,destination_show
//   1,North America,1,North America,57617,191071,84668,96102,,CAN,Canada,CAN,Canada,0,0,0,0,1,1
//   1,North America,1,North America,57617,191071,84668,96102,,CAN,Canada,USA,United States,1509,190436,238,28,1,1
//
// Note that the header row is not included in the output!
var inputCsvFilename = process.argv[2];
try {
  var input = (!process.stdin.isTTY || inputCsvFilename === '-') ? process.stdin : fs.createReadStream(inputCsvFilename);
} catch(e) {
  return console.error(usage);
}


// Open input stream and return CSV parse Highland Stream
function open(stream) {
  return _(stream.pipe(parser(parseOptions)));
}


var data = {
  years: {},
  migrations: {},
  regions: {}
};
var years;

function condense(memo, row) {
  // Get available years from headers
  if (!years) {
    years = [];
    Object.keys(row).filter(function(key) {
      return key.match(/flow_\d{4}$/);
    }).forEach(function(key) {
      var year = parseInt(key.replace(/^.*_/, ''), 10);

      if (years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    years.sort();

    years.forEach(function(year) {
      data.years[year] = {};
    });
  }

  // Collect region-country mappings
  memo.regions[row.originregion_name] = memo.regions[row.originregion_name] || [];
  if (memo.regions[row.originregion_name].indexOf(row.origin_name) === -1) {
    memo.regions[row.originregion_name].push(row.origin_name);
  }

  // Collect migration memo
  memo.migrations[row.origin_name] = memo.migrations[row.origin_name] || {};
  // country to country
  memo.migrations[row.origin_name][row.destination_name] = memo.migrations[row.origin_name][row.destination_name] || {};
  // country to region
  memo.migrations[row.origin_name][row.destinationregion_name] = memo.migrations[row.origin_name][row.destinationregion_name] || {};
  memo.migrations[row.originregion_name] = memo.migrations[row.originregion_name] || {};
  // region to country
  memo.migrations[row.originregion_name][row.destination_name] = memo.migrations[row.originregion_name][row.destination_name] || {};
  // region to region
  memo.migrations[row.originregion_name][row.destinationregion_name] = memo.migrations[row.originregion_name][row.destinationregion_name] || {};


  years.forEach(function(year) {
    var value = parseInt(row['countryflow_' + year], 10);

    // country to country
    memo.migrations[row.origin_name][row.destination_name][year] = value;
    // country to region
    memo.migrations[row.origin_name][row.destinationregion_name][year] = memo.migrations[row.origin_name][row.destinationregion_name][year] || 0;
    memo.migrations[row.origin_name][row.destinationregion_name][year] += value;
    // region to country
    memo.migrations[row.originregion_name][row.destination_name][year] = memo.migrations[row.originregion_name][row.destination_name][year] || 0;
    memo.migrations[row.originregion_name][row.destination_name][year] += value;
    // region to region
    memo.migrations[row.originregion_name][row.destinationregion_name][year] = memo.migrations[row.originregion_name][row.destinationregion_name][year] || 0;
    memo.migrations[row.originregion_name][row.destinationregion_name][year] += value;

  });
  
  return memo;
}


function label(data) {
  var keys = __.union(sortedRegions, Object.keys(data.regions)).reduce(function(memo, region) {
    memo.indices.push(memo.keys.length);
    memo.keys.push(region);
    memo.keys = memo.keys.concat(data.regions[region] && data.regions[region].sort());
    return memo;
  }, { indices: [], keys: [] });

  var matrix = {};
  years.forEach(function(year) {
    matrix[year] = keys.keys.map(function(source) {
      return keys.keys.map(function(destination) {
        return data.migrations[source] && data.migrations[source][destination] && data.migrations[source][destination][year];
      });
    });
  });

  return {
    names: keys.keys,
    regions: keys.indices,
    matrix: matrix
  };
}

open(input).reduce(data, condense).map(label).each(function(json) {
  // TODO: support -p --pretty flag:
  // console.log(JSON.stringify(json, '', '  '));

  console.log(JSON.stringify(json));
});
