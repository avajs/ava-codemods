'use strict';
const path = require('path');
const semver = require('semver');
const uniq = require('lodash.uniq');
const flatten = require('lodash.flatten');

function sortByVersion(a, b) {
	if (a.version === b.version) {
		return 0;
	}

	return semver.lt(a.version, b.version) ? -1 : +1;
}

function getVersions(codemods) {
	const versionsFromCodemods = codemods.sort(sortByVersion).map(codemod => codemod.version);
	const uniqueVersions = uniq(versionsFromCodemods);
	const firstVersion = {
		name: `older than ${uniqueVersions.sort(sortByVersion)[0]}`,
		value: '0.0.0'
	};
	const lastVersion = {
		name: 'latest',
		value: '9999.9999.9999'
	};

	return [firstVersion].concat(versionsFromCodemods).concat(lastVersion);
}

function selectScripts(codemods, currentVersion, nextVersion) {
	const semverToRespect = `>${currentVersion} <=${nextVersion}`;

	const scripts = codemods
	.filter(codemod => semver.satisfies(codemod.version, semverToRespect))
	.map(codemod => codemod.scripts);

	return flatten(scripts).map(script => path.join(__dirname, script));
}

module.exports = {
	sortByVersion,
	getVersions,
	selectScripts
};
