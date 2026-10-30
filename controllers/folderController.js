const prisma = require('../lib/prisma');
const { body, matchedData, validationResult } = require('express-validator');
const { addNumberExtension, deleteFilePrismaNSupabase } = require('./helpers');

const getAllFolders = async (req, res) => {
	const folders = (
		await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				folders: {
					include: {
						files: true,
					},
				},
			},
		})
	)?.folders;
	res.render('all-folders-viewer', {
		title: `File Uploader | ${req.user.username}'s folders`,
		folders,
	});
};

const createFolder = [
	[body('folderName').trim().isLength({ min: 1 }).withMessage('Folder must have a non-empty name')],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty) {
			res.status(400).render('all-folders-viewer', {
				title: `File Uploader | ${req.user}'s folders`,
				errors: errors.array(),
			});
		}
		let { folderName } = matchedData(req);
		folderName = await addNumberExtension(folderName, req);
		const newFolder = await prisma.folder.create({
			data: {
				name: folderName,
				userId: req.user.id,
			},
		});
		return res.redirect('/');
	},
];

const updateFolder = [
	[body('newFolderName').trim().isLength({ min: 1 }).withMessage('Invalid new name'), body('folderId').isInt()],
	body('oldFolderName').trim(),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty) {
			res.status(400).render('all-folders-viewer', {
				title: `File Uploader | ${req.user}'s folders`,
				errors: errors.array(),
			});
		}
		let { newFolderName, folderId, oldFolderName } = matchedData(req);
		// This is to prevent a bug with addNumberExtension where renaming to its own name would still add an extenstion
		// I could also add a security check here to make sure the user's id matches the folder's user id.  However that would be another query that would add time and the security is out of scope right now.
		if (oldFolderName === newFolderName) return res.redirect('/');

		newFolderName = await addNumberExtension(newFolderName, req);
		// I could return the object the folder gives to the site and have it change the user's page based off of the object instead of the user reloading.
		await prisma.folder.update({
			where: {
				id: Number(folderId),
			},
			data: {
				name: newFolderName,
			},
		});
		return res.redirect('/');
	},
];

const deleteFolder = async (req, res) => {
	const folder = await prisma.folder.findUnique({
		where: {
			id: Number(req.params.folderId),
		},
		include: {
			files: true,
		},
	});
	try {
		for (file of folder.files) {
			await deleteFilePrismaNSupabase(file);
		}
	} catch (error) {
		return res.status(500).send('Could not delete file from storage');
	}
	await prisma.folder.delete({
		where: { id: folder.id },
	});
	return res.sendStatus(204);
};

module.exports = {
	getAllFolders,
	createFolder,
	updateFolder,
	deleteFolder,
};
