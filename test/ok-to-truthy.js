import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/ok-to-truthy';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('t.ok(foo, bar)', 't.truthy(foo, bar)');
testChanged('t.notOk(foo, bar)', 't.falsy(foo, bar)');
testUnchanged('t.truthy(foo, bar)');
testUnchanged('t.falsy(foo, bar)');
