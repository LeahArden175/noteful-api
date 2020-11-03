const express = require("express");
const FoldersService = require("./folders-service");
const xss = require('xss');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getAllFolders(knexInstance)
      .then((folders) => {
        res.json(folders);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const newFolder = { title };

    if(title ===  '') {
        return res.status(400).json({
            error: {message: 'Title cannot be empty'}
        })
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        res.status(201).location(`/folders/${folder.id}`).json(folder);
      })
      .catch(next);
  });

foldersRouter
  .route("/:folder_id")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getById(knexInstance, req.params.folder_id)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: "Folder does not exist" },
          });
        }
        res.json({
            id: folder.id,
            title:xss(folder.title)
        })
      })
      .catch(next);
  })

  module.exports = foldersRouter
