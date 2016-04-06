#!/usr/bin/env node
'use strict';
global.Promise = require('pinkie-promise');
var childProcess = require('child_process');
var meow = require('meow');
var globby = require('globby');
var inquirer = require('inquirer');
var assign = require('lodash.assign');
var npmRunPath = require('npm-run-path');
var isGitClean = require('is-git-clean');
var utils = require('./cli-utils');
var codemods = require('./codemods.json');

function runScripts(scripts, files) {
	var spawnOptions = {
		env: assign({}, process.env, {PATH: npmRunPath({cwd: __dirname})}),
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

var cli = meow([
	'Usage',
	'  $ ava-codemods',
	'',
	'Options',
	'  --force, -f    Bypass safety checks and forcibly run codemods',
	'',
	'Available upgrades',
	'  - 0.13.x → 0.14.x'
], {
	boolean: ['force'],
	alias: {
		f: 'force',
		h: 'help'
	}
});

var clean = false;
var errorMessage = 'Unable to determine if git directory is clean';
try {
	clean = isGitClean.sync();
	errorMessage = 'Git directory is not clean';
} catch (e) {
}

var ENSURE_BACKUP_MESSAGE = 'Ensure you have a backup of your tests or commit the latest changes before continuing.';

if (!clean) {
	if (cli.flags.force) {
		console.log('WARNING: ' + errorMessage + '. Forcibly continuing.');
		console.log(ENSURE_BACKUP_MESSAGE);
	} else {
		console.log('ERROR: ' + errorMessage + '. Refusing to continue.');
		console.log(ENSURE_BACKUP_MESSAGE);
		console.log('You may use the --force flag to override this safety check.');
		process.exit(1);
	}
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
