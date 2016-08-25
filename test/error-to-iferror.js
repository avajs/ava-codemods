import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/error-to-iferror';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('error >> ifError', 't.error(foo, bar)', 't.ifError(foo, bar)');
testUnchanged('unchanged ifError', 't.ifError(foo, bar)');
