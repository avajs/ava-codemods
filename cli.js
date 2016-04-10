#!/usr/bin/env node
'use strict';

var arrify = require('arrify');
var pkgConf = require('pkg-conf');
var upgrader = require('lib-upgrader');
var pkg = require('./package.json');
var releases = require('./releases.json');

var defaultFiles = 'test.js test-*.js test/**/*.js';
var avaConf = pkgConf.sync('ava');
var filesFromConfig = avaConf.files && arrify(avaConf.files).join(' ');

upgrader({
	libraryName: 'AVA',
	files: filesFromConfig || defaultFiles,
	releases: releases,
	pkg: pkg,
	dirname: __dirname
});
