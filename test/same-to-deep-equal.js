import test from 'ava';
import plugin from '../lib/same-to-deep-equal';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(t, input, expected) {
	t.is(wrapped(input), expected);
}

test('same >> deepEqual', tester, 't.same(foo, bar)', 't.deepEqual(foo, bar)');
test('notSame >> notDeepEqual', tester, 't.notSame(foo, bar)', 't.notDeepEqual(foo, bar)');
test('full test expression with same >> deepEqual', tester, `
test(t => {
		t.same(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`, `
test(t => {
		t.deepEqual(fn.sync('1.tmp', {cwd: t.context.tmp}), [path.join(t.context.tmp, '1.tmp')]);
});
`);
