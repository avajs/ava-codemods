#!/usr/bin/env node
'use strict';
global.Promise = require('pinkie-promise');
const childProcess = require('child_process');
const meow = require('meow');
const updateNotifier = require('update-notifier');
const arrify = require('arrify');
const globby = require('globby');
const pkgConf = require('pkg-conf');
const inquirer = require('inquirer');
const assign = require('lodash.assign');
const npmRunPath = require('npm-run-path');
const isGitClean = require('is-git-clean');
const utils = require('./cli-utils');
const codemods = require('./codemods.json');

function runScripts(scripts, files) {
	const spawnOptions = {
		env: assign({}, process.env, {PATH: npmRunPath({cwd: __dirname})}),
		stdio: 'inherit'
	};

	let result;

	scripts.forEach(script => {
		result = childProcess.spawnSync('jscodeshift', ['-t', script].concat(files), spawnOptions);

		if (result.error) {
			throw result.error;
		}
	});
}

const cli = meow([
	'Usage',
	'  $ ava-codemods [<file|glob> ...]',
	'',
	'Options',
	'  --force, -f    Bypass safety checks and forcibly run codemods',
	'',
	'Available upgrades',
	'  - 0.13.x → 0.14.x'
], {
	boolean: ['force'],
	string: ['_'],
	alias: {
		f: 'force',
		h: 'help'
	}
});

updateNotifier({pkg: cli.pkg}).notify();

let clean = false;
let errorMessage = 'Unable to determine if git directory is clean';
try {
	clean = isGitClean.sync();
	errorMessage = 'Git directory is not clean';
} catch (e) {
}

const ENSURE_BACKUP_MESSAGE = 'Ensure you have a backup of your tests or commit the latest changes before continuing.';

if (!clean) {
	if (cli.flags.force) {
		console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
		console.log(ENSURE_BACKUP_MESSAGE);
	} else {
		console.log(`ERROR: ${errorMessage}. Refusing to continue.`);
		console.log(ENSURE_BACKUP_MESSAGE);
		console.log('You may use the --force flag to override this safety check.');
		process.exit(1);
	}
}

codemods.sort(utils.sortByVersion);

const versions = utils.getVersions(codemods);

const avaConf = pkgConf.sync('ava');
const defaultFiles = 'test.js test-*.js test/**/*.js **/__tests__/**/*.js **/*.test.js';

const questions = [{
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
	message: 'On which files should the codemods be applied?',
	default: (avaConf.files && arrify(avaConf.files).join(' ')) || defaultFiles,
	when: !cli.input.length,
	filter: files => {
		return files.trim().split(/\s+/).filter(v => v);
	}
}];

inquirer.prompt(questions, answers => {
	const files = answers.files || cli.input;

	if (!files.length) {
		return;
	}

	const scripts = utils.selectScripts(codemods, answers.currentVersion, answers.nextVersion);

	runScripts(scripts, globby.sync(files));
});
