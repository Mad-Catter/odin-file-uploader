const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { body, matchedData, validationResult } = require('express-validator');

const getLogin = (req, res) => {
	const errors = req.session.messages && req.session.messages.length !== 0 ? true : null;
	// For some reason this does not clear until you successfully login.  However this means an error will remain if the user clicks off login then clicks back on later.
	// So I am manually clearing it.
	req.session.messages = [];
	if (req.user) {
		return res.redirect('/folder');
	}
	res.render('index', {
		title: 'File Uploader | Login',
		errors,
	});
};

const postLogin = passport.authenticate('local', {
	successRedirect: '/folder',
	failureRedirect: '/',
	failureMessage: true,
});

const getCreateAccount = (req, res) => {
	if (req.user) {
		return res.redirect('/folder');
	}
	res.render('create-account', {
		title: 'File Uploader | Account Creation',
	});
};

const postCreateAccount = [
	[
		body('username')
			.trim()
			.custom(async (username) => {
				const user = await prisma.user.findUnique({ where: { username } });
				if (user) {
					throw new Error('Username already in use');
				}
			})
			.withMessage('Username already in use'),
		body('username').trim().isLength({ min: 1 }).withMessage('Invalid username length'),
		body('password').trim().isLength({ min: 1 }).withMessage('Invalid password length'),
		body('confirmPassword')
			.trim()
			.custom((confirmPassword, { req }) => confirmPassword === req.body.password.trim())
			.withMessage('Password and confirm password do not match'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render('create-account', {
				title: 'File Uploader | Account Creation',
				errors: errors.array(),
			});
		}
		const { username, password } = matchedData(req);
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: { username, password: hashedPassword },
		});
		res.redirect('/');
	},
];

const getLogout = (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
};

module.exports = {
	getLogin,
	postLogin,
	getCreateAccount,
	postCreateAccount,
	getLogout,
};
