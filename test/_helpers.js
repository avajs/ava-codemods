'use strict';
const jscodeshift = require('jscodeshift');

function noop() {}

// simulate the fileInfo parameter
function fileInfo(path, source) {
	if (!source) {
		source = path;
		path = 'test.js';
	}

	return {
		path,
		source
	};
}

// simulate the jscodeshift api
function api() {
	return {
		jscodeshift,
		stats: noop
	};
}

function runPlugin(plugin, path, source) {
	return plugin(fileInfo(path, source), api());
}

function wrapPlugin(plugin) {
	return function (path, source) {
		return runPlugin(plugin, path, source);
	};
}

module.exports.fileInfo = fileInfo;
module.exports.api = api;
module.exports.runPlugin = runPlugin;
module.exports.wrapPlugin = wrapPlugin;
