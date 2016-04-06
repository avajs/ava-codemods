import test from 'ava';
import plugin from '../lib/same-to-deep-equal';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(input, expected) {
	test(input, t => t.is(wrapped(input), expected));
}

tester('t.same(foo, bar)', 't.deepEqual(foo, bar)');
tester('t.notSame(foo, bar)', 't.notDeepEqual(foo, bar)');
