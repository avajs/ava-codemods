var utils = require('./utils');

module.exports = function transformer(file, api) {
	var j = api.jscodeshift;
	var ast = j(file.source);
	utils.renameAssertion('ok', 'truthy', j, ast);
	utils.renameAssertion('notOk', 'falsy', j, ast);
	return ast.toSource();
};
