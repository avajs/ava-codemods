import test from 'ava';
import plugin from '../lib/mocha';
import {wrapPlugin} from './_helpers';

const wrapped = wrapPlugin(plugin);

function tester(input, expected) {
	test(input, t => t.is(wrapped(input), expected));
}

tester('it(() => doSomething())', 'test(() => doSomething())');
tester('it("foo", () => doSomething())', 'test("foo", () => doSomething())');
tester('before(() => doSomething())', 'test.before(() => doSomething())');
tester('before(\'blah\', () => doSomething())', 'test.before(\'blah\', () => doSomething())');
tester('beforeEach(() => doSomething())', 'test.beforeEach(() => doSomething())');
tester('after(() => doSomething())', 'test.after(() => doSomething())');
tester('afterEach(() => doSomething())', 'test.afterEach(() => doSomething())');
