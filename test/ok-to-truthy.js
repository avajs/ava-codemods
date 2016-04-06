import test from 'ava';
import plugin from '../lib/ok-to-truthy';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(input, expected) {
	test(input, t => t.is(wrapped(input), expected));
}

tester('t.ok(foo, bar)', 't.truthy(foo, bar)');
tester('t.notOk(foo, bar)', 't.falsy(foo, bar)');
