const prisma = require('../lib/prisma');
const multer = require('multer');
const upload = multer({ dest: './public/uploads' });
const { body, matchedData, validationResult } = require('express-validator');
const { addNumberExtension } = require('./helpers');

const getFile = async (req, res) => {
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.id) },
		include: {
			folder: true,
		},
	});
	// This will need to be changed for the share function
	if (file.folder.userId !== req.user.id) {
		throw new Error('incorrect user for file');
	}
	// I copied this off of geeksforgeeks.org
	const size = (() => {
		if (file.size === 0) {
			return '0.00 B';
		}
		let e = Math.floor(Math.log(file.size) / Math.log(1024));
		return (file.size / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
	})();
	res.render('file-viewer', {
		title: `File Viewer || ${file.originalName}`,
		file,
		size,
	});
};

const getCreateFile = async (req, res) => {
	const folders = (
		await prisma.user.findUnique({
			where: { id: req.user.id },
			select: {
				folders: true,
			},
		})
	)?.folders;
	console.log(folders);
	res.render('upload-file', {
		title: 'File Uploader | Upload File',
		folders,
	});
};
// Currently if there is an error the item is still downloaded.  I need to delete that later, but since cloud if the final goal I am not going to put in the work yet
const postCreateFile = [
	upload.single('file'),
	[
		body('folderId')
			.isInt()
			.custom(async (folderId, { req }) => {
				const folder = await prisma.folder.findUnique({
					where: { id: Number(folderId) },
				});
				if (!folder || folder.userId !== req.user.id) {
					throw new Error('Folder is invalid');
				}
				return true;
			})
			.withMessage('Invalid folder'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const folders = (
				await prisma.user.findUnique({
					where: { id: req.user.id },
					select: {
						folders: true,
					},
				})
			)?.folders;
			return res.render('upload-file', {
				title: 'File Uploader | Upload File',
				folders,
				errors: errors.array(),
			});
		}
		const { folderId } = matchedData(req);
		const originalName = await addNumberExtension(req.file.originalname, req);
		const result = await prisma.file.create({
			// This will need to be changed later when I change to uploading a file to the cloud
			data: {
				fileLink: req.file.path,
				fileName: req.file.filename,
				originalName: originalName,
				size: req.file.size,
				folderId: Number(folderId),
			},
		});
		res.redirect(`/file/${result.id}`);
	},
];

const downloadFile = async (req, res) => {
	// There is currently no safety measures on if a user is allowed to download this file or not.
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.id) },
	});
	console.log(file.fileLink);
	res.download(file.fileLink, file.originalName);
};

const deleteFile = async (req, res) => {
	// Again currently no safety measures.  That is out of scope currently but could be useful
	const file = await prisma.file.delete({
		where: { id: Number(req.params.id) },
	});
	return res.sendStatus(204);
};

module.exports = {
	getFile,
	getCreateFile,
	postCreateFile,
	downloadFile,
	deleteFile,
};
