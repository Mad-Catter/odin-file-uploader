const prisma = require('../lib/prisma');

async function addNumberExtension(folderName, req) {
	// This is to make sure there will be no repeat names.  Attempting to add a repeat name should add (x) where x is how many repeats to the end of the name.
	// example, example(1), example(2), etc.
	const currentFolders = (
		await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				folders: true,
			},
		})
	)?.folders;

	if (currentFolders.some((currentFolder) => currentFolder.name === folderName)) {
		let i = 1;
		while (true) {
			if (currentFolders.some((currentFolder) => currentFolder.name === folderName + `(${i})`)) {
				i++;
			} else {
				return folderName + `(${i})`;
			}
		}
	}
	return folderName;
}

module.exports = { addNumberExtension };
