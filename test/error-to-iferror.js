import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/error-to-iferror';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('t.error(foo, bar)', 't.ifError(foo, bar)');
testUnchanged('t.ifError(foo, bar)');
