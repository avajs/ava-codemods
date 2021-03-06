#!/usr/bin/env node
'use strict';
const execa = require('execa');
const meow = require('meow');
const updateNotifier = require('update-notifier');
const arrify = require('arrify');
const globby = require('globby');
const pkgConf = require('pkg-conf');
const inquirer = require('inquirer');
const npmRunPath = require('npm-run-path');
const utils = require('./cli-utils');
const codemods = require('./codemods');

function runScripts(scripts, files) {
	const spawnOptions = {
		env: Object.assign({}, process.env, {PATH: npmRunPath({cwd: __dirname})}),
		stdio: 'inherit'
	};

	scripts.forEach(script => {
		const result = execa.sync(require.resolve('.bin/jscodeshift'), ['-t', script].concat(files), spawnOptions);

		if (result.error) {
			throw result.error;
		}
	});
}

const cli = meow(`
	Usage
	  $ ava-codemods [<file|glob> ...]

	Options
	  --force, -f    Bypass safety checks and forcibly run codemods

	Available upgrades
	  - 0.16.x → 0.17.x
	  - 0.13.x → 0.14.x
`, {
	boolean: ['force'],
	string: ['_'],
	alias: {
		f: 'force',
		h: 'help'
	}
});

updateNotifier({pkg: cli.pkg}).notify();

if (!utils.checkGitStatus(cli.flags.force)) {
	process.exit(1);
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
	filter: files => files.trim().split(/\s+/).filter(v => v)
}];

inquirer.prompt(questions, answers => {
	const files = answers.files || cli.input;

	if (!files.length) {
		return;
	}

	const scripts = utils.selectScripts(codemods, answers.currentVersion, answers.nextVersion);

	runScripts(scripts, globby.sync(files));
});
