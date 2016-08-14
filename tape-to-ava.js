#!/usr/bin/env node
import path from 'path';
import execa from 'execa';
import meow from 'meow';
import updateNotifier from 'update-notifier';
import * as utils from './cli-utils';

const PATH_TRANFORMER = path.join(__dirname, 'lib', 'tape.js');

function executeTransformation(files, flags) {
	const spawnOptions = {
		stdio: 'inherit',
		stripEof: false
	};

	const args = ['-t', PATH_TRANFORMER].concat(files);
	if (flags.dry) {
		args.push('--dry');
	}
	if (['babel', 'babylon', 'flow'].indexOf(flags.parser) >= 0) {
		args.push('--parser', flags.parser);
	}

	console.log(`Executing command: jscodeshift ${args.join(' ')}`);

	const result = execa.sync('jscodeshift', args, spawnOptions);
	if (result.error) {
		throw result.error;
	}
}

const cli = meow(
	{
		description: 'Codemod to change test runner from Tape to AVA',
		help: `
	Usage
	  $ tape-to-ava <path> [options]

	path	Files or directory to transform. Can be a glob like src/**.test.js

	Options
	  --force, -f	Bypass Git safety checks and forcibly run codemods
	  --dry, -d	Dry run (no changes are made to files)
	  --parser	The parser to use for parsing your source files (babel | babylon | flow)  [babel]
	`
	},
	{
		boolean: ['force', 'dry'],
		string: ['_'],
		alias: {
			f: 'force',
			h: 'help',
			d: 'dry'
		}
	}
);

updateNotifier({pkg: cli.pkg}).notify();

const files = cli.input;
if (files.length === 0) {
	cli.showHelp();
} else {
	if (!utils.checkGitStatus(cli.flags.force)) {
		process.exit(1);
	}
	executeTransformation(files, cli.flags);
}
