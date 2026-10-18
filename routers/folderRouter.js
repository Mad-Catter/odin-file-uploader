const { Router } = require('express');
const folderController = require('../controllers/folderController');
const fileRouter = require('./fileRouter');
const folderRouter = Router();

folderRouter.get('/', folderController.getAllFolders);
folderRouter.post('/create-folder', folderController.createFolder);
folderRouter.patch('update-folder/:folderId', folderController.updateFolder);
folderRouter.delete('/delte-folder/:folderId', folderController.deleteFolder);
folderRouter.use('/:folderId/:fileId', fileRouter);

module.exports = folderRouter;
