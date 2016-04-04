import ava from 'ava';
import {wrapPlugin} from './_helpers';
import plugin from '../lib/ok-to-truthy';

const wrapped = wrapPlugin(plugin);

function test(input, expected) {
	ava(input, t => t.is(wrapped(input), expected));
}

test('t.ok(foo, bar)', 't.truthy(foo, bar)');
test('t.notOk(foo, bar)', 't.falsy(foo, bar)');
