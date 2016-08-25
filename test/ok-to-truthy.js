import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/ok-to-truthy';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('ok >> truthy', 't.ok(foo, bar)', 't.truthy(foo, bar)');
testChanged('notOk >> falsy', 't.notOk(foo, bar)', 't.falsy(foo, bar)');
testUnchanged('unchanged truthy', 't.truthy(foo, bar)');
testUnchanged('unchanged falsy', 't.falsy(foo, bar)');
