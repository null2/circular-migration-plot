var test = require('tap').test;
var countrymerge = require('../lib/countrymerge.js');

test('no country', function(t) {
  var regions = [0,2,4];
  t.deepEqual(countrymerge({ regions: regions }, []), regions, 'should return regions');
  t.end();
});


test('first country', function(t) {
  var regions = [0,2,4];
  var names = [0,1,2,3,4,5];
  t.deepEqual(countrymerge({ regions: regions, names: names }, [0]), [1,2,4], 'should open first region');
  t.end();
});

test('second country', function(t) {
  var regions = [0,2,4];
  var names = [0,1,2,3,4,5];
  t.deepEqual(countrymerge({ regions: regions, names: names }, [2]), [0,3,4], 'should open second region');
  t.end();
});

test('third country', function(t) {
  var regions = [0,2,4];
  var names = [0,1,2,3,4,5];
  t.deepEqual(countrymerge({ regions: regions, names: names }, [4]), [0,2,5], 'should open third region');
  t.end();
});

test('two countries', function(t) {
  var regions = [0,2,4];
  var names = [0,1,2,3,4,5];

  t.deepEqual(countrymerge({ regions: regions, names: names }, [0,2]), [1,3,4], 'should return regions');
  t.end();
});
