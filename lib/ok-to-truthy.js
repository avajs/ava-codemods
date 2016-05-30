import {renameAssertion} from './utils';

export default function (file, api) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	renameAssertion('ok', 'truthy', j, ast);
	renameAssertion('notOk', 'falsy', j, ast);

	return ast.toSource();
}
