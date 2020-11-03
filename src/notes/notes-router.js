const express = require("express");
const NotesService = require('./notes-service')
const xss = require('xss');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
.route("/")
.get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then((notes) => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, folder_id, date_modified } = req.body;
    const newNote = { title, content, folder_id, date_modified };

    for (const [key, value] of Object.entries(newNote))
    if (value == null)
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` }
      })

    NotesService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        res.status(201).location(`/notes/${note.id}`).json(note);
      })
      .catch(next);
  });

notesRouter
.route('/:note_id')
.get((req,res,next) => {
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance, req.params.note_id)
        .then((note) => {
            if(!note) {
                return res.status(404).json({
                    error: {message : 'Note does not exist'}
                })
            }
            res.json({
                id: note.id,
                title: xss(note.title),
                content: xss(note.content),
                date_modified: note.date_modified,
                folder_id: note.folder_id
            })
        })
        .catch(next)
})  
.delete((req,res,next) => {
    NotesService.deleteNote(
        req.app.get('db'),
        req.params.note_id
    )
    .then(() => {
        res.status(204).end()
    })
    .catch(next)
})



module.exports = notesRouter
    


