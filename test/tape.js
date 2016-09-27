import test from 'ava';

import jscodeshift from 'jscodeshift';
import testPlugin from 'jscodeshift-ava-tester';

import plugin from '../lib/tape';
import {wrapPlugin} from './_helpers';

const {testChanged} = testPlugin(jscodeshift, test, plugin);
const wrapped = wrapPlugin(plugin);

test.beforeEach(t => {
	t.context.originalConsoleWarn = console.warn;
	t.context.consoleWarnings = [];
	console.warn = v => t.context.consoleWarnings.push(v);
});

test.afterEach(t => {
	console.warn = t.context.originalConsoleWarn;
});

testChanged('does not touch code without tape require/import',
`
const test = require("testlib");
test(t => {
	t.notOk(1);
});`,
`
const test = require("testlib");
test(t => {
	t.notOk(1);
});`
);

testChanged('CommonJs requires',
`const test = require('tape');`,
`const test = require('ava');`
);

testChanged('ES2015 imports',
`import test from 'tape';`,
`import test from 'ava';`
);

testChanged('maps assertions and comments',
`
import test from 'tape';
test(t => {
	t.fail('msg');
	t.pass('msg');
	t.ok(1, 'msg');
	t.true(1, 'msg');
	t.assert(1, 2, 'msg');
	t.notOk(1, 'msg');
	t.false(1, 'msg');
	t.notok(1, 'msg');
	t.error(1, 'msg');
	t.ifErr(1, 'msg');
	t.iferror(1, 'msg');
	t.equal(1, 2, 'msg');
	t.equals(1, 2, 'msg');
	t.isEqual(1, 2, 'msg');
	t.strictEqual(1, 2, 'msg');
	t.strictEquals(1, 2, 'msg');
	t.notEqual(1, 2, 'msg');
	t.notStrictEqual(1, 2, 'msg');
	t.notStrictEquals(1, 2, 'msg');
	t.isNotEqual(1, 2, 'msg');
	t.doesNotEqual(1, 2, 'msg');
	t.isInequal(1, 2, 'msg');
	t.deepEqual(1, 2, 'msg');
	t.isEquivalent(1, 2, 'msg');
	t.same(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notEquivalent(1, 2, 'msg');
	t.notDeeply(1, 2, 'msg');
	t.notSame(1, 2, 'msg');
	t.isNotDeepEqual(1, 2, 'msg');
	t.isNotEquivalent(1, 2, 'msg');
	t.isInequivalent(1, 2, 'msg');
	t.skip('msg');
	t.throws(1, 'msg');
	t.doesNotThrow(1, 'msg');
	t.comment('this is a comment...');
});
`,
`
import test from 'ava';
test.serial(t => {
	t.fail('msg');
	t.pass('msg');
	t.truthy(1, 'msg');
	t.truthy(1, 'msg');
	t.truthy(1, 2, 'msg');
	t.falsy(1, 'msg');
	t.falsy(1, 'msg');
	t.falsy(1, 'msg');
	t.ifError(1, 'msg');
	t.ifError(1, 'msg');
	t.ifError(1, 'msg');
	t.is(1, 2, 'msg');
	t.is(1, 2, 'msg');
	t.is(1, 2, 'msg');
	t.is(1, 2, 'msg');
	t.is(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.not(1, 2, 'msg');
	t.deepEqual(1, 2, 'msg');
	t.deepEqual(1, 2, 'msg');
	t.deepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.notDeepEqual(1, 2, 'msg');
	t.skip('msg');
	t.throws(1, null, 'msg');
	t.notThrows(1, 'msg');
	console.log('this is a comment...');
});
`);

testChanged('preserves quote style',
`
import test from "tape";
test("mytest", t => {
	t.pass("msg");
});
`,
`
import test from "ava";
test.serial("mytest", t => {
	t.pass("msg");
});
`
);

testChanged('test options: removes',
`
import test from 'tape';
test('mytest', {objectPrintDepth: 4, skip: false}, t => {
	t.pass('msg');
});
`,
`
import test from 'ava';
test.serial('mytest', t => {
	t.pass('msg');
});
`
);

testChanged('test options: skip',
`
import test from 'tape';
test('mytest', {objectPrintDepth: 4, skip: true}, t => {
	t.pass('msg');
});
`,
`
import test from 'ava';
test.cb.serial.skip('mytest', t => {
	t.pass('msg');
});
`
);

testChanged('t.end converts to callback test',
`
import test from 'tape';
test('mytest', t => {
	t.equal(1, 1);
	setTimeout(() => {
		t.end();
	}, 500);
});
`,
`
import test from 'ava';
test.cb.serial('mytest', t => {
	t.is(1, 1);
	setTimeout(() => {
		t.end();
	}, 500);
});
`
);

testChanged('test.onFinish',
`
import myTestFunc from 'tape';
myTestFunc.onFinish(() => {});
`,
`
import myTestFunc from 'ava';
myTestFunc.after.always(() => {});
`);

testChanged('t.throws',
`
import test from 'tape';
test(t => {
	t.throws(myfunc, 'should not throw');
	t.throws(myfunc, 'xxx', 'should not throw');
	t.throws(myfunc, /err_reg_exp/i);
	t.throws(myfunc, /err_reg_exp/i, 'should not throw');
});
`,
`
import test from 'ava';
test.serial(t => {
	t.throws(myfunc, null, 'should not throw');
	t.throws(myfunc, 'xxx', 'should not throw');
	t.throws(myfunc, /err_reg_exp/i);
	t.throws(myfunc, /err_reg_exp/i, 'should not throw');
});
`
);

test.serial('not supported warnings', t => {
	wrapped(`
		import test from 'tape';
		test.createStream(() => {});
		test.createStream(() => {}); // only logs once
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 3) "createStream" is not supported',
	);
});

test.serial('not supported: timeoutAfter', t => {
	wrapped(`
		import test from 'tape';
		test(t => {
			t.timeoutAfter(100);
		});
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 4) "timeoutAfter" is not supported',
	);
});

test.serial('not supported: looseEquals', t => {
	wrapped(`
		import test from 'tape';
		test(t => {
			t.looseEquals({}, {});
		});
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 4) "looseEquals" is not supported. Try the stricter "deepEqual" or "notDeepEqual"',
	);
});

test.serial('not supported: timeout option', t => {
	wrapped(`
		import test from 'tape';
		test({timeout: 42}, t => {
			t.pass();
		});
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 3) "timeout" option is not supported'
	);
});

test.serial('not supported: non standard argument for test', t => {
	wrapped(`
		import test from 'tape';
		test(x => {
			x.pass();
		});
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 3) argument to test function should be named "t" not "x"'
	);
});

test.serial('not supported: non standard argument for test.skip', t => {
	wrapped(`
		import test from 'tape';
		test.skip(function(y) {
			y.pass();
		});
	`);
	t.is(t.context.consoleWarnings.length, 1, 'one warnings logged');
	t.is(
		t.context.consoleWarnings[0],
		'tape-to-ava warning: (test.js line 3) argument to test function should be named "t" not "y"'
	);
});
