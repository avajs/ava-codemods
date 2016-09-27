/**
 * Codemod for transforming Tape tests into AVA.
 */

const tapeToAvaAsserts = {
	fail: 'fail',
	pass: 'pass',

	ok: 'truthy',
	true: 'truthy',
	assert: 'truthy',

	notOk: 'falsy',
	false: 'falsy',
	notok: 'falsy',

	error: 'ifError',
	ifErr: 'ifError',
	iferror: 'ifError',

	equal: 'is',
	equals: 'is',
	isEqual: 'is',
	strictEqual: 'is',
	strictEquals: 'is',

	notEqual: 'not',
	notStrictEqual: 'not',
	notStrictEquals: 'not',
	isNotEqual: 'not',
	doesNotEqual: 'not',
	isInequal: 'not',

	deepEqual: 'deepEqual',
	isEquivalent: 'deepEqual',
	same: 'deepEqual',

	notDeepEqual: 'notDeepEqual',
	notEquivalent: 'notDeepEqual',
	notDeeply: 'notDeepEqual',
	notSame: 'notDeepEqual',
	isNotDeepEqual: 'notDeepEqual',
	isNotEquivalent: 'notDeepEqual',
	isInequivalent: 'notDeepEqual',

	skip: 'skip',
	throws: 'throws',
	doesNotThrow: 'notThrows'
};

const unsupportedTestFunctions = new Set([
	// No equivalent in AVA:
	'timeoutAfter',

	// t.deepEqual is more strict but might be used in some cases:
	'deepLooseEqual',
	'looseEqual',
	'looseEquals',
	'notDeepLooseEqual',
	'notLooseEqual',
	'notLooseEquals'
]);

function detectQuoteStyle(j, ast) {
	let detectedQuoting = null;

	ast.find(j.Literal, {
		value: v => typeof v === 'string',
		raw: v => typeof v === 'string'
	})
	.forEach(p => {
		// The raw value is from the original babel source
		if (p.value.raw[0] === '\'') {
			detectedQuoting = 'single';
		}

		if (p.value.raw[0] === '"') {
			detectedQuoting = 'double';
		}
	});

	return detectedQuoting;
}

/**
 * Updates CommonJS and import statements from Tape to AVA
 * @return string with test function name if transformations were made
 */
function updateTapeRequireAndImport(j, ast) {
	let testFunctionName = null;
	ast.find(j.CallExpression, {
		callee: {name: 'require'},
		arguments: arg => arg[0].value === 'tape'
	})
	.filter(p => p.value.arguments.length === 1)
	.forEach(p => {
		p.node.arguments[0].value = 'ava';
		testFunctionName = p.parentPath.value.id.name;
	});

	ast.find(j.ImportDeclaration, {
		source: {
			type: 'Literal',
			value: 'tape'
		}
	})
	.forEach(p => {
		p.node.source.value = 'ava';
		testFunctionName = p.value.specifiers[0].local.name;
	});

	return testFunctionName;
}

export default function tapeToAva(fileInfo, api) {
	const j = api.jscodeshift;
	const ast = j(fileInfo.source);

	const testFunctionName = updateTapeRequireAndImport(j, ast);

	if (!testFunctionName) {
		// No Tape require/import were found
		return fileInfo.source;
	}

	const warnings = new Set();
	function logWarning(msg, node) {
		if (warnings.has(msg)) {
			return;
		}
		console.warn(`tape-to-ava warning: (${fileInfo.path} line ${node.value.loc.start.line}) ${msg}`);
		warnings.add(msg);
	}

	const transforms = [
		function detectUnsupportedNaming() {
			// Currently we only support "t" as the test argument name
			const validateTestArgument = p => {
				const lastArg = p.value.arguments[p.value.arguments.length - 1];
				if (lastArg && lastArg.params && lastArg.params[0]) {
					const lastArgName = lastArg.params[0].name;
					if (lastArgName !== 't') {
						logWarning(`argument to test function should be named "t" not "${lastArgName}"`, p);
					}
				}
			};

			ast.find(j.CallExpression, {
				callee: {
					object: {name: testFunctionName}
				}
			})
			.forEach(validateTestArgument);

			ast.find(j.CallExpression, {
				callee: {name: testFunctionName}
			})
			.forEach(validateTestArgument);
		},

		function detectUnsupportedFeatures() {
			ast.find(j.CallExpression, {
				callee: {
					object: {name: 't'},
					property: ({name}) => unsupportedTestFunctions.has(name)
				}
			})
			.forEach(p => {
				const propertyName = p.value.callee.property.name;
				if (propertyName.toLowerCase().indexOf('looseequal') >= 0) {
					logWarning(`"${propertyName}" is not supported. Try the stricter "deepEqual" or "notDeepEqual"`, p);
				} else {
					logWarning(`"${propertyName}" is not supported`, p);
				}
			});

			ast.find(j.CallExpression, {
				callee: {
					object: {name: testFunctionName},
					property: {name: 'createStream'}
				}
			})
			.forEach(p => {
				logWarning('"createStream" is not supported', p);
			});
		},

		function updateAssertions() {
			ast.find(j.CallExpression, {
				callee: {
					object: {name: 't'},
					property: ({name}) => Object.keys(tapeToAvaAsserts).indexOf(name) >= 0
				}
			})
			.forEach(p => {
				const {property} = p.node.callee;
				property.name = tapeToAvaAsserts[property.name];
			});
		},

		function testOptionArgument() {
			// Convert Tape option parameters, test([name], [opts], cb)
			ast.find(j.CallExpression, {
				callee: {name: testFunctionName}
			}).forEach(p => {
				p.value.arguments.forEach(a => {
					if (a.type === 'ObjectExpression') {
						a.properties.forEach(tapeOption => {
							const tapeOptionKey = tapeOption.key.name;
							const tapeOptionValue = tapeOption.value.value;
							if (tapeOptionKey === 'skip' && tapeOptionValue === true) {
								p.value.callee.name += '.cb.serial.skip';
							}

							if (tapeOptionKey === 'timeout') {
								logWarning('"timeout" option is not supported', p);
							}
						});

						p.value.arguments = p.value.arguments.filter(pa => pa.type !== 'ObjectExpression');
					}
				});
			});
		},

		function updateTapeComments() {
			ast.find(j.CallExpression, {
				callee: {
					object: {name: 't'},
					property: {name: 'comment'}
				}
			})
			.forEach(p => {
				p.node.callee = 'console.log';
			});
		},

		function updateThrows() {
			// The semantics of t.throws(fn, expected, msg) is different.
			// - Tape: if `expected` is a string, it is set to msg
			// - AVA: if `expected` is a string it is transformed to a function
			ast.find(j.CallExpression, {
				callee: {
					object: {name: 't'},
					property: {name: 'throws'}
				},
				arguments: arg => arg.length === 2 && arg[1].type === 'Literal' && typeof arg[1].value === 'string'
			})
			.forEach(p => {
				const [fn, msg] = p.node.arguments;
				p.node.arguments = [fn, j.literal(null), msg];
			});
		},

		function updateTapeOnFinish() {
			ast.find(j.CallExpression, {
				callee: {
					object: {name: testFunctionName},
					property: {name: 'onFinish'}
				}
			})
			.forEach(p => {
				p.node.callee.property.name = 'after.always';
			});
		},

		function rewriteTestCallExpression() {
			// To be on the safe side we rewrite the test(...) function to
			// either test.cb.serial(...) or test.serial(...)
			//
			// - .serial as Tape runs all tests serially
			// - .cb for tests containing t.end, as we cannot detect if the
			//   test have any asynchronicity.
			ast.find(j.CallExpression, {
				callee: {name: 'test'}
			}).forEach(p => {
				// TODO: if t.end is in the scope of the test function we could
				// remove it and not use cb style.
				const containsEndFunction = j(p).find(j.CallExpression, {
					callee: {
						object: {name: 't'},
						property: {name: 'end'}
					}
				}).size() > 0;

				const newTestFunction = containsEndFunction ? 'cb.serial' : 'serial';

				p.node.callee = j.memberExpression(
					j.identifier('test'),
					j.identifier(newTestFunction)
				);
			});
		}
	];

	transforms.forEach(t => t());

	// As Recast is not preserving original quoting, we try to detect it,
	// and default to something sane.
	// See https://github.com/benjamn/recast/issues/171
	// and https://github.com/facebook/jscodeshift/issues/143
	const quote = detectQuoteStyle(j, ast) || 'single';
	return ast.toSource({quote});
}
