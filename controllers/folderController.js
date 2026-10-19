const getAllFolders = (req, res) => {
	res.render('all-folders-viewer', {
		title: `File Uploader | ${req.user}'s folders`,
	});
};

const createFolder = (req, res) => {};

const updateFolder = (req, res) => {};

const deleteFolder = (req, res) => {};

module.exports = {
	getAllFolders,
	createFolder,
	updateFolder,
	deleteFolder,
};
