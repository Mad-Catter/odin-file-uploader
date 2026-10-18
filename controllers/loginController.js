const getLogin = (req, res) => {
	res.render('index', {
		title: 'File Uploader | Login',
	});
};

const postLogin = (req, res) => {};

const getCreateAccount = (req, res) => {};

const postCreateAccount = (req, res) => {};

const getLogout = (req, res) => {};

module.exports = {
	getLogin,
	postLogin,
	getCreateAccount,
	postCreateAccount,
	getLogout,
};
