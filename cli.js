#!/usr/bin/env node
'use strict';

var path = require('path');
var childProcess = require('child_process');
var globby = require('globby');
var inquirer = require('inquirer');
var assign = require('lodash.assign');
var utils = require('./cli-utils');
var codemods = require('./codemods.json');

function runScripts(scripts, files) {
	var binPath = require.resolve('jscodeshift/bin/jscodeshift.sh');
	var spawnOptions = {
		env: assign({}, process.env, {PATH: path.resolve('node_modules/.bin') + ':' + process.env.PATH}),
		stdio: 'inherit'
	};

	var result;
	scripts.forEach(function (script) {
		result = childProcess.spawnSync(binPath, ['-t', script].concat(files.split(' ')), spawnOptions);
		if (result.error) {
			throw result.error;
		}
	});
}

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

inquirer.prompt(questions, function (answers) {
	if (!answers.files) {
		return;
	}

	var scripts = utils.selectScripts(codemods, answers.currentVersion, answers.nextVersion);

	runScripts(scripts, globby.sync(answers.files.split(/\s+/)));
});
