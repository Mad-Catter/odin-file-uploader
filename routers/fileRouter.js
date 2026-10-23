const { Router } = require('express');
const fileController = require('../controllers/fileController');
const fileRouter = Router();

fileRouter.get('/upload-file', fileController.getCreateFile);
fileRouter.post('/upload-file', fileController.postCreateFile);
fileRouter.get('/:id', fileController.getFile);
fileRouter.get('/:id/download', fileController.downloadFile);
fileRouter.delete('/:id/delete-file', fileController.deleteFile);

module.exports = fileRouter;
