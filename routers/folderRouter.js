const { Router } = require('express');
const folderController = require('../controllers/folderController');
const folderRouter = Router();

folderRouter.get('/', folderController.getAllFolders);
folderRouter.post('/create-folder', folderController.createFolder);
folderRouter.post('/update-folder/:folderId', folderController.updateFolder);
folderRouter.delete('/delete-folder/:folderId', folderController.deleteFolder);

module.exports = folderRouter;
