'use strict';
const utils = require('./utils');

module.exports = function transformer(file, api) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	utils.renameAssertion('ok', 'truthy', j, ast);
	utils.renameAssertion('notOk', 'falsy', j, ast);

	return ast.toSource();
};
