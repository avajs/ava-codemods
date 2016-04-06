'use strict';
var utils = require('./utils');

module.exports = function transformer(file, api) {
	var j = api.jscodeshift;
	var ast = j(file.source);

	utils.renameAssertion('same', 'deepEqual', j, ast);
	utils.renameAssertion('notSame', 'notDeepEqual', j, ast);

	return ast.toSource();
};
