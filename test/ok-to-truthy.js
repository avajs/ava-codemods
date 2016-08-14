import test from 'ava';
import plugin from '../lib/ok-to-truthy';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(t, input, expected) {
	t.is(wrapped(input), expected);
}

test('ok >> truthy', tester, 't.ok(foo, bar)', 't.truthy(foo, bar)');
test('notOk >> falsy', tester, 't.notOk(foo, bar)', 't.falsy(foo, bar)');
