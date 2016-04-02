import ava from 'ava';
import {wrapPlugin} from './_helpers';
import plugin from '../lib/same-to-deep-equal';

const wrapped = wrapPlugin(plugin);

function test(input, expected) {
	ava(input, t => t.is(wrapped(input), expected));
}

test('t.same(foo, bar)', 't.deepEqual(foo, bar)');
test('t.notSame(foo, bar)', 't.notDeepEqual(foo, bar)');
