const express = require('express');
require('./config/passport');
const folderRouter = require('./routers/folderRouter');
const loginRouter = require('./routers/loginRouter');
const port = process.env.PORT || 3000;
const app = express();
const passport = require('passport');
const session = require('express-session');
const prisma = require('./lib/prisma');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const store = new PrismaSessionStore(prisma, {
	checkPeriod: 2 * 60 * 1000, //ms
	dbRecordIdIsSessionId: true,
	dbRecordIdFunction: undefined,
});
app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store,
	}),
);
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});

app.use('/folder', folderRouter);
app.use('/', loginRouter);

app.use((req, res) => {
	res.status(404).render('404', {
		title: 'Club | 404',
	});
});

app.use((err, req, res, next) => {
	console.log(err);
	res.status(404).render('404', {
		title: 'Club | 404',
	});
});

app.listen(port, () => {
	console.log('Listening on port:', port);
});
