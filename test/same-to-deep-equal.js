import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/same-to-deep-equal';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('t.same(foo, bar)', 't.deepEqual(foo, bar)');
testChanged('t.notSame(foo, bar)', 't.notDeepEqual(foo, bar)');
testChanged(`
test(t => {
		t.same(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`, `
test(t => {
		t.deepEqual(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`);

testUnchanged('t.deepEqual(foo, bar)');
testUnchanged('t.notDeepEqual(foo, bar)');
testUnchanged(`
test(t => {
		t.deepEqual(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`);
