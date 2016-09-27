const path = require('path');
const semver = require('semver');
const uniq = require('lodash.uniq');
const flatten = require('lodash.flatten');
const isGitClean = require('is-git-clean');

export function sortByVersion(a, b) {
	if (a.version === b.version) {
		return 0;
	}

	return semver.lt(a.version, b.version) ? -1 : 1;
}

export function getVersions(codemods) {
	const versionsFromCodemods = codemods.sort(sortByVersion).map(codemod => codemod.version);
	const uniqueVersions = uniq(versionsFromCodemods);
	const firstVersion = {
		name: `older than ${uniqueVersions.sort(sortByVersion)[0]}`,
		value: '0.0.0'
	};
	const lastVersion = {
		name: 'latest',
		value: '9999.9999.9999'
	};

	return [firstVersion].concat(versionsFromCodemods).concat(lastVersion);
}

export function selectScripts(codemods, currentVersion, nextVersion) {
	const semverToRespect = `>${currentVersion} <=${nextVersion}`;

	const scripts = codemods
	.filter(codemod => semver.satisfies(codemod.version, semverToRespect))
	.map(codemod => codemod.scripts);

	return flatten(scripts).map(script => path.join(__dirname, script));
}

export function checkGitStatus(force) {
	let clean = false;
	let errorMessage = 'Unable to determine if git directory is clean';
	try {
		clean = isGitClean.sync(process.cwd(), {files: ['!package.json']});
		errorMessage = 'Git directory is not clean';
	} catch (err) {}

	const ENSURE_BACKUP_MESSAGE = 'Ensure you have a backup of your tests or commit the latest changes before continuing.';

	if (!clean) {
		if (force) {
			console.log(`WARNING: ${errorMessage}. Forcibly continuing.`, ENSURE_BACKUP_MESSAGE);
		} else {
			console.log(
				`ERROR: ${errorMessage}. Refusing to continue.`,
				ENSURE_BACKUP_MESSAGE,
				'You may use the --force flag to override this safety check.'
			);
			return false;
		}
	}

	return true;
}
