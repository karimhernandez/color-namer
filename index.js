"use strict";

var distance = require('euclidean-distance');
var chroma = require('chroma-js');
var color;
var key;

// These `require` statements are all explicit
// to keep the browserify build from breaking
var lists = {
  basic: require('./lib/colors/basic'),
  html: require('./lib/colors/html'),
  ntc: require('./lib/colors/ntc'),
  pantone: require('./lib/colors/pantone'),
  roygbiv: require('./lib/colors/roygbiv'),
  x11: require('./lib/colors/x11')
};

var getResults = function(color) {
  color = chroma(color);
  var results = {};
  for (key in lists) {
    results[key] = lists[key]
      .map (function(name) {
        name.distance = distance(color.lab(), chroma(name.hex).lab());
        return name;
      })
      .sort (function(a, b) {
        return a.distance - b.distance;
      })
  }
  return results;
};

var pluckNearest = function(color) {
  var i, len, keys, match, result, results, shortest = 30;

	//color dictionaries in order of preference.
  // TODO: expose list as option.
	keys = ['basic', 'html', 'pantone', 'ntc', 'x11']; // 'roygbiv'
  color = chroma(color);
  results = getResults(color);

	for (i = 0, len = keys.length; i < len; i++) {
		match = results[keys[i]][0];
		if (shortest > match.distance) {
			shortest = match.distance;
			result = match;
			result.list = keys[i];
		}
	}

	return result;
};

var namer = pluckNearest;
namer.getResults = getResults;
namer.chroma = chroma;
namer.lists = lists;

module.exports = namer;
