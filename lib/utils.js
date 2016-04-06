'use strict';

exports.renameAssertion = function (name, newName, j, ast) {
	ast.find(j.CallExpression, {
		callee: {
			object: {name: 't'},
			property: {name: name}
		}
	})
		.replaceWith(function (p) {
			return j.callExpression(
				j.memberExpression(
					j.identifier('t'),
					j.identifier(newName)
				),
				p.node.arguments
			);
		});
};
