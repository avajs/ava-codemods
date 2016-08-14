import test from 'ava';
import plugin from '../lib/error-to-iferror';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(t, input, expected) {
	t.is(wrapped(input), expected);
}

test('error >> ifError', tester, 't.error(foo, bar)', 't.ifError(foo, bar)');
