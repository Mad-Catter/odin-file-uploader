const { Router } = require('express');
const loginController = require('../controllers/loginController');
const loginRouter = Router();

loginRouter.get('/', loginController.getLogin);
loginRouter.post('/', loginController.postLogin);

loginRouter.get('/create-account', loginController.getCreateAccount);
loginRouter.post('/create-account', loginController.postCreateAccount);
loginRouter.get('/logout', loginController.getLogout);

module.exports = loginRouter;
