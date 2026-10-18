const { Router } = require('express');
const fileController = require('../controllers/fileController');
const fileRouter = Router({ mergeParams: true });

fileRouter.get('/', fileController.getFile);
fileRouter.post('/upload', fileController.createFile);
fileRouter.delete('/delete', fileController.deleteFile);

module.exports = fileRouter;
