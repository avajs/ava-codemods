'use strict';
const utils = require('./utils');

module.exports = function transformer(file, api) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	utils.renameAssertion('same', 'deepEqual', j, ast);
	utils.renameAssertion('notSame', 'notDeepEqual', j, ast);

	return ast.toSource();
};
