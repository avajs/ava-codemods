import {renameAssertion} from './utils';

export default function (file, api) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	renameAssertion('error', 'ifError', j, ast);

	return ast.toSource();
}
