import test from 'ava';
import plugin from '../lib/error-to-iferror';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(input, expected) {
	test(input, t => t.is(wrapped(input), expected));
}

tester('t.error(foo, bar)', 't.ifError(foo, bar)');
