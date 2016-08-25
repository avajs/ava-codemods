import test from 'ava';
import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';
import plugin from '../lib/same-to-deep-equal';

const {testChanged, testUnchanged} = testPlugin(jscodeshift, test, plugin);

testChanged('same >> deepEqual', 't.same(foo, bar)', 't.deepEqual(foo, bar)');
testChanged('notSame >> notDeepEqual', 't.notSame(foo, bar)', 't.notDeepEqual(foo, bar)');
testChanged('full test expression with same >> deepEqual', `
test(t => {
		t.same(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`, `
test(t => {
		t.deepEqual(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`);

testUnchanged('unchanged deepEqual', 't.deepEqual(foo, bar)');
testUnchanged('unchanged notDeepEqual', 't.notDeepEqual(foo, bar)');
testUnchanged('unchanged full test expression with deepEqual', `
test(t => {
		t.deepEqual(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`);
