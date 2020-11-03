require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const { json } = require("express");
const foldersRouter = require('./folders/folders-router')
const notesRouter = require('./notes/notes-router')

const app = express();
const jsonParser = express.json();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


app.use('/folders', foldersRouter)
app.use('/notes', notesRouter)


app.get("/", (req, res) => {
  res.send("Hello, boilerplate!");
});

// app.get("/folders", (req, res, next) => {
//   const knexInstance = req.app.get("db");
//   FoldersService.getAllFolders(knexInstance)
//     .then((folders) => {
//       res.json(folders);
//     })
//     .catch(next);
// });

// app.get("/folders/:folder_id", (req, res, next) => {
//   const knexInstance = req.app.get("db");
//   FoldersService.getById(knexInstance, req.params.folder_id)
//     .then((folder) => {
//       if (!folder) {
//         return res.status(404).json({
//           error: { message: "Folder does not exist" },
//         });
//       }
//       res.json(folder);
//     })
//     .catch(next);
// });

// app.post("/folders", jsonParser, (req, res, next) => {
//   const { title } = req.body;
//   const newFolder = { title };
//   FoldersService.insertFolder(req.app.get("db"), newFolder)
//     .then((folder) => {
//       res.status(201).location(`/folders/${folder.id}`).json(folder);
//     })
//     .catch(next);
// });

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
