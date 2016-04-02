function rename(name, newName, j, ast) {
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
}

module.exports = function transformer(file, api) {
	var j = api.jscodeshift;
	var ast = j(file.source);
	rename('same', 'deepEqual', j, ast);
	rename('notSame', 'notDeepEqual', j, ast);
	return ast.toSource();
};
