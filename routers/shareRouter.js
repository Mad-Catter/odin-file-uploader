const { Router } = require('express');
const shareController = require('../controllers/shareController');
const shareRouter = Router();

shareRouter.post('/create-link', shareController.postCreateShareLink);
shareRouter.get('/:url', shareController.getSharedFolder);
shareRouter.get('/:url/:fileId', shareController.getSharedFile);
shareRouter.get('/:url/:fileId/download', shareController.downloadSharedFile);

module.exports = shareRouter;
