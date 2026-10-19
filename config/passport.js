const LocalStrategy = require('passport-local').Strategy;
const bycrypt = require('bcryptjs');
const passport = require('passport');
const prisma = require('../lib/prisma');
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await prisma.user.findUnique({
				where: { username },
			});
			if (!user) {
				return done(null, false, { message: 'Invalid username or password' });
			}
			const match = await bycrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: 'Invalid username or password' });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	}),
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (err) {
		done(err);
	}
});
