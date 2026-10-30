const prisma = require('../lib/prisma');
const { body, matchedData, validationResult } = require('express-validator');
const { validateURL } = require('./helpers');
// Using nanoid instead of cryptoUUID for a slighly nicer looking url
const { nanoid } = require('nanoid');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

const postCreateShareLink = [
	[
		body('folderId').custom(async (folderId, { req }) => {
			const folder = await prisma.folder.findUnique({
				where: { id: Number(folderId) },
			});
			if (!folder) {
				throw Error('Folder not found');
			}
			if (folder.userId !== req.user.id) {
				throw Error('Invalid user for folder');
			}
			return true;
		}),
		body('duration').isInt({ min: 1, max: 31 }).withMessage('Invalid duration'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).send(errors.array());
		}
		const { folderId, duration } = matchedData(req);
		let randomUrl = 0;
		// To avoid any duplicate urls
		while (true) {
			randomUrl = nanoid();
			const match = await prisma.share.findFirst({ where: { url: randomUrl } });
			if (!match) {
				break;
			}
		}

		const deleteTimestamp = new Date();
		deleteTimestamp.setDate(deleteTimestamp.getDate() + Number(duration));
		const result = await prisma.share.create({
			data: {
				url: randomUrl,
				deleteTimestamp,
				folderId: Number(folderId),
			},
		});
		res.json({ url: randomUrl });
	},
];

const getSharedFolder = async (req, res) => {
	const url = req.params.url;
	const folder = await validateURL(url);
	if (!folder) {
		return res.render('single-folder-viewer', {
			title: 'File Uploader || Shared Folder',
			invalid: true,
		});
	}
	res.render('single-folder-viewer', {
		title: 'File Uploader || Shared Folder',
		folder: folder,
		url,
	});
};

const getSharedFile = async (req, res) => {
	const folder = await validateURL(req.params.url);
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.fileId) },
		include: {
			folder: true,
		},
	});
	if (!file) {
		throw new Error('file not found');
	}
	if (!folder || file.folderId !== folder.id) {
		return res.render('file-viewer', {
			title: 'File Uploader || Could not view file',
			invalid: true,
		});
	}
	const size = (() => {
		if (file.size === 0) {
			return '0.00 B';
		}
		let e = Math.floor(Math.log(file.size) / Math.log(1024));
		return (file.size / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
	})();
	res.render('file-viewer', {
		title: `File Uploader || ${file.originalName}}`,
		file,
		size,
		shared: true,
	});
};

const downloadSharedFile = async (req, res) => {
	const folder = await validateURL(req.params.url);
	const file = await prisma.file.findUnique({
		where: { id: Number(req.params.fileId) },
		include: {
			folder: true,
		},
	});

	if (!file) {
		return res.status(404).render('404');
	}

	if (!folder || file.folderId !== folder.id) {
		throw new Error('Could not download file');
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

module.exports = { postCreateShareLink, getSharedFolder, getSharedFile, downloadSharedFile };
