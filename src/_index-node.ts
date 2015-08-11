

/// <reference path="d.ts/bluebird.d.ts"/>
/// <reference path="d.ts/node.d.ts"/>

/// <reference path="common/_index.ts"/>



// global requires
global.Promise = require('bluebird');

var uuid = require('uuid');
var obs = require('observe-js');
var ObjectObserver = obs.ObjectObserver;
var ArrayObserver = obs.ArrayObserver;


// export the root domain names (modules)
module.exports.common = bwk.common;
