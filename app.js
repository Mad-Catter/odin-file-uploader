const express = require('express');
const folderRouter = require('./routers/folderRouter');
const loginRouter = require('./routers/loginRouter');
const port = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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
