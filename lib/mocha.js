function mochaUtils(j) {
	j.registerMethods({
		findCalls(name) {
			return this.find(j.CallExpression, {callee: {name}});
		}
	});

	j.registerMethods({
		convertToAvaTest(name) {
			this.forEach(p => {
				p.get('callee').replace(j.identifier(name));

				const testFunc = p.get('arguments', p.value.arguments.length - 1);
				const testFuncScope = testFunc.get('body').scope;

				const numArgs = testFunc.value.params.length;
				let needsT = false;

				if (numArgs > 0) {
					p.get('callee').replace(j.identifier(name + '.cb'));
					needsT = true;
					const param = testFunc.get('params', numArgs - 1);
					const paramName = param.value.name;

					j(testFunc.get('body'))
						.find(j.Identifier, {name: paramName})
						.filter(p => p.scope.lookup(paramName) === testFuncScope)
						.replaceWith(() => j.identifier('t.end'));

					param.replace();
				}

				if (needsT) {
					testFunc.get('params').push(j.identifier('t'));
				}
			});
		}
	}, j.CallExpression);
}

function mochaToAva(file, {jscodeshift: j}) {
	if (typeof j.use === 'function') {
		j.use(mochaUtils);
	} else {
		mochaUtils(j); // get rid of this once ASTExplorer upgrades jscodeshift
	}

	const root = j(file.source);

	root.findCalls('it').convertToAvaTest('test');
	root.findCalls('before').convertToAvaTest('test.before');
	root.findCalls('beforeEach').convertToAvaTest('test.beforeEach');
	root.findCalls('afterEach').convertToAvaTest('test.afterEach');
	root.findCalls('after').convertToAvaTest('test.after');

	return root.toSource();
}

export default mochaToAva;
