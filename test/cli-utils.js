import path from 'path';
import test from 'ava';
import {sortByVersion, getVersions, selectScripts} from '../cli-utils';

function resolve(files) {
	return files.map(file => path.resolve(__dirname, '..', file));
}

test('sortByVersion', t => {
	const array = [
		{version: '1.0.1'},
		{version: '88.0.1'},
		{version: '0.0.1'},
		{version: '1.0.0'},
		{version: '1.10.0'},
		{version: '1.2.0'}
	];

	t.deepEqual(array.sort(sortByVersion), [
		{version: '0.0.1'},
		{version: '1.0.0'},
		{version: '1.0.1'},
		{version: '1.2.0'},
		{version: '1.10.0'},
		{version: '88.0.1'}
	]);
});

test('getVersions', t => {
	const array = [
		{version: '1.0.1'},
		{version: '88.0.1'},
		{version: '0.0.1'},
		{version: '1.0.0'},
		{version: '1.10.0'},
		{version: '1.2.0'}
	];

	t.deepEqual(getVersions(array), [{
		name: 'older than 0.0.1',
		value: '0.0.0'
	},
	'0.0.1',
	'1.0.0',
	'1.0.1',
	'1.2.0',
	'1.10.0',
	'88.0.1',
	{
		name: 'latest',
		value: '9999.9999.9999'
	}]);
});

test('selectScripts', t => {
	const codemods = [{
		version: '0.14.0',
		scripts: [
			'lib/ok-to-truthy.js',
			'lib/same-to-deep-equal.js'
		]
	}, {
		version: '0.15.0',
		scripts: [
			'lib/script-0.15.0.js'
		]
	}, {
		version: '1.0.0',
		scripts: [
			'lib/script-1.0.0.js'
		]
	}, {
		version: '2.0.0',
		scripts: [
			'lib/script-2.0.0.js'
		]
	}];

	t.deepEqual(selectScripts(codemods, '0.14.0', '0.14.0'), []);

	t.deepEqual(selectScripts(codemods, '0.14.0', '1.0.0'), resolve([
		'lib/script-0.15.0.js',
		'lib/script-1.0.0.js'
	]));

	t.deepEqual(selectScripts(codemods, '0.0.0', '0.15.0'), resolve([
		'lib/ok-to-truthy.js',
		'lib/same-to-deep-equal.js',
		'lib/script-0.15.0.js'
	]));

	t.deepEqual(selectScripts(codemods, '0.0.0', '9999.9999.9999'), resolve([
		'lib/ok-to-truthy.js',
		'lib/same-to-deep-equal.js',
		'lib/script-0.15.0.js',
		'lib/script-1.0.0.js',
		'lib/script-2.0.0.js'
	]));
});
