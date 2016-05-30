import {renameAssertion} from './utils';

export default function (file, api) {
	const j = api.jscodeshift;
	const ast = j(file.source);

	renameAssertion('same', 'deepEqual', j, ast);
	renameAssertion('notSame', 'notDeepEqual', j, ast);

	return ast.toSource();
}
