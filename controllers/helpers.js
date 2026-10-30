const prisma = require('../lib/prisma');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

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

const deleteFilePrismaNSupabase = async (file) => {
	const { error } = await supabase.storage.from('file-uploader').remove([file.fileLink]);

	if (error) {
		console.error(error);
		throw Error(error);
	}

	await prisma.file.delete({
		where: { id: file.id },
	});
};
const validateURL = async (url) => {
	const match = await prisma.share.findUnique({
		where: { url },
		include: {
			folder: {
				include: {
					files: true,
				},
			},
		},
	});
	if (!match) {
		return false;
	}
	if (match.deleteTimestamp < Date.now()) {
		await prisma.share.delete({
			where: { url },
		});
		return false;
	}
	return match.folder;
};
module.exports = { addNumberExtension, deleteFilePrismaNSupabase, validateURL };
