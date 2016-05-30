import jscodeshift from 'jscodeshift';

// simulate the fileInfo parameter
export function fileInfo(path, source) {
	if (!source) {
		source = path;
		path = 'test.js';
	}

	return {
		path,
		source
	};
}

// simulate the jscodeshift api
export function api() {
	return {
		jscodeshift,
		stats: () => {}
	};
}

export function runPlugin(plugin, path, source) {
	return plugin(fileInfo(path, source), api());
}

export function wrapPlugin(plugin) {
	return (path, source) => runPlugin(plugin, path, source);
}
