const prisma = require('../lib/prisma');
const multer = require('multer');
const { body, matchedData, validationResult } = require('express-validator');
const { addNumberExtension, deleteFilePrismaNSupabase } = require('./helpers');
const { createClient } = require('@supabase/supabase-js');
const upload = multer({
	storage: multer.memoryStorage(),
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const getFile = async (req, res) => {
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.id) },
		include: {
			folder: true,
		},
	});
	// This will need to be changed for the share function
	if (!req.user) {
		throw new Error('you must be logged in to see this file');
	}
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
	res.render('upload-file', {
		title: 'File Uploader | Upload File',
		folders,
	});
};
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
		body('file')
			.custom((value, { req }) => {
				if (!req.file) {
					throw new Error('You must upload a file');
				}
				return true;
			})
			.withMessage('You must upload a file'),
		body('file')
			.custom((value, { req }) => {
				// 5 mb limit
				if (req.file.size > 5242880) {
					throw new Error('File too large');
				}
				return true;
			})
			.withMessage('File too large'),
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
		// This ia all claude and I should look closer at this
		const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
		const path = `uploads/${Date.now()}-${safeName}`;
		const { data, error } = await supabase.storage.from('file-uploader').upload(path, req.file.buffer, {
			contentType: req.file.mimetype,
			upsert: false,
		});
		if (error) {
			console.error(error);
			return res.status(500).send('Upload failed');
		}
		// This is all claude ^^

		const result = await prisma.file.create({
			data: {
				fileLink: data.path,
				fileName: safeName,
				originalName: originalName,
				size: req.file.size,
				folderId: Number(folderId),
			},
		});
		res.redirect(`/file/${result.id}`);
	},
];

const downloadFile = async (req, res) => {
	if (!req.user) {
		throw new Error('You must be logged in to download this file');
	}

	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.id) },
		include: {
			folder: true,
		},
	});
	if (file.folder.userId !== req.user.id) {
		throw new Error('Incorrect user for file');
	}

	if (!file) {
		return res.status(404).send('File not found');
	}

	const { data, error } = await supabase.storage.from('file-uploader').download(file.fileLink);

	if (error) {
		console.error(error);
		return res.status(500).send('Download failed');
	}

	const buffer = Buffer.from(await data.arrayBuffer());
	res.setHeader('Content-Type', data.type || 'application/octet-stream');
	res.attachment(file.originalName); // sets Content-Disposition with a safe filename
	res.send(buffer);
};

const deleteFile = async (req, res) => {
	// Again currently no safety measures.  That is out of scope currently but could be useful
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.id) },
	});
	if (!file) {
		return res.redirect('/404');
	}
	try {
		await deleteFilePrismaNSupabase(file);
	} catch (error) {
		// I should maybe change this to a better response handler.
		return res.status(500).send('Could not delete file from storage');
	}
	return res.sendStatus(204);
};

module.exports = {
	getFile,
	getCreateFile,
	postCreateFile,
	downloadFile,
	deleteFile,
};
