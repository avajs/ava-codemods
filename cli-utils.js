var path = require('path');
var semver = require('semver');
var uniq = require('lodash.uniq');
var flatten = require('lodash.flatten');

function sortByVersion(a, b) {
	if (a.version === b.version) {
		return 0;
	}
	return semver.lt(a.version, b.version) ? -1 : +1;
}

function getVersions(codemods) {
	var versionsFromCodemods = codemods.sort(sortByVersion).map(function (codemod) {
		return codemod.version;
	});
	var uniqueVersions = uniq(versionsFromCodemods);
	var firstVersion = {
		name: 'older than ' + uniqueVersions.sort(sortByVersion)[0],
		value: '0.0.0'
	};
	var lastVersion = {
		name: 'latest',
		value: '9999.9999.9999'
	};
	return [firstVersion].concat(versionsFromCodemods).concat(lastVersion);
}

function selectScripts(codemods, currentVersion, nextVersion) {
	var semverToRespect = '>' + currentVersion + ' <=' + nextVersion;

	var scripts = codemods.filter(function (codemod) {
		return semver.satisfies(codemod.version, semverToRespect);
	}).map(function (codemod) {
		return codemod.scripts;
	});

	return flatten(scripts).map(function (script) {
		return path.join(__dirname, script);
	});
}

module.exports = {
	sortByVersion: sortByVersion,
	getVersions: getVersions,
	selectScripts: selectScripts
};
