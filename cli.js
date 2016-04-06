#!/usr/bin/env node
'use strict';

var childProcess = require('child_process');
var meow = require('meow');
var globby = require('globby');
var inquirer = require('inquirer');
var assign = require('lodash.assign');
var npmRunPath = require('npm-run-path');
var utils = require('./cli-utils');
var codemods = require('./codemods.json');

function runScripts(scripts, files) {
	var spawnOptions = {
		env: assign({}, process.env, {PATH: npmRunPath()}),
		stdio: 'inherit'
	};

	var result;
	scripts.forEach(function (script) {
		result = childProcess.spawnSync('jscodeshift', ['-t', script].concat(files), spawnOptions);
		if (result.error) {
			throw result.error;
		}
	});
}

meow(`
		Usage
			$ ava-codemods

		Available upgrades
			- 0.13.x → 0.14.x
`);

codemods.sort(utils.sortByVersion);

var versions = utils.getVersions(codemods);

var questions = [{
	type: 'list',
	name: 'currentVersion',
	message: 'What version of AVA are you currently using?',
	choices: versions.slice(0, -1)
}, {
	type: 'list',
	name: 'nextVersion',
	message: 'What version of AVA are you moving to?',
	choices: versions.slice(1)
}, {
	type: 'input',
	name: 'files',
	message: 'On which files should the codemods be applied?'
}];

console.log('Ensure you have a backup of your tests or commit the latest changes before continuing.');
inquirer.prompt(questions, function (answers) {
	if (!answers.files) {
		return;
	}

	var scripts = utils.selectScripts(codemods, answers.currentVersion, answers.nextVersion);

	runScripts(scripts, globby.sync(answers.files.split(/\s+/)));
});
