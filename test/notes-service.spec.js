const { expect } = require("chai");
const knex = require("knex");
const NotesService = require("../src/notes/notes-service");

describe("Notes Service object", () => {
  let db;

  let testNotes = [
      {
        id : 1,
        title: ' First Test Note ',
        content: 'First Test content',
        folder_id: 1,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 2,
        title: ' Second Test Note ',
        content: 'Second Test content',
        folder_id: 2,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 3,
        title: ' Third Test Note ',
        content: 'Third Test content',
        folder_id: 3,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 4,
        title: ' Fourth Test Note ',
        content: 'Fourth Test content',
        folder_id: 4,
        date_modified: '2029-01-22T16:28:32.615Z',
      }
  ]

  let testFolders = [
    {
      id: 1,
      title: "First Test Folder",
    },
    {
      id: 2,
      title: "Second Test Folder",
    },
    {
      id: 3,
      title: "Third Test Folder",
    },
    {
      id: 4,
      title: "Fourth Test Folder",
    },
  ];

  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
  });

  before(() =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );

  after(() => db.destroy());

  describe('getAllNotes()', () => {

    context("Given noteful_notes has data", () => {

        beforeEach(() => {
            return db
                .into("noteful_folders")
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('noteful_notes')
                        .insert(testNotes)
                })
          });


        it("getAllNotes() returns all notes from noteful_notes", () => {
          return NotesService.getAllNotes(db).then((actual) => {
            const jsonNotes =  JSON.stringify(actual) //this turns it into json(string)
            const arrayNotes = JSON.parse(jsonNotes) //turns it back in JS(object) this is what would  
            expect(arrayNotes).to.eql(testNotes);
          });
        });


        it(`getById() resolves an note by id from 'blogful_notes' table`, () => {
            const thirdId = 3
            const thirdTestNote = testNotes[thirdId - 1]
            const thirdTestFolder= testFolders[thirdId -1]
            return NotesService.getById(db, thirdId)
              .then(actual => {
                  const jsonNote = JSON.stringify(actual)
                  const noteObject = JSON.parse(jsonNote)
                expect(noteObject).to.eql({
                  id: thirdId,
                  title: thirdTestNote.title,
                  content: thirdTestNote.content,
                  date_modified: thirdTestNote.date_modified,
                  folder_id: thirdTestFolder.id,
              })
          })
        })

        it('deleteNote() removes a note by specified ID from noteful_notes', () => {
            const noteId = 3
            return NotesService.deleteNote(db, noteId)
                .then(() => NotesService.getAllNotes(db))
                .then(allNotes => {
                    const jsonNote = JSON.stringify(allNotes)
                    const noteObject = JSON.parse(jsonNote)
                    const expected = testNotes.filter(note => note.id !== noteId)
                    expect(noteObject).to.eql(expected)
                })
        })
    });

    context("Given noteful_Notes has no data", () => {

        beforeEach(() => {
            return db
                .into("noteful_folders")
                .insert(testFolders)
        })


        it("getAllNotes() resolves an empty array", () => {
            return NotesService.getAllNotes(db)
            .then((actual) => {
                const jsonNotes =  JSON.stringify(actual) //this turns it into json(string)
                const arrayNotes = JSON.parse(jsonNotes) //turns it back in JS(object) this is what would  
                expect(arrayNotes).to.eql([]);
            });
        });

        it('insertNote() inserts a new note and gives it an id', () => {
            const newNote = {
                        title: 'Test Title',
                        content: 'Test Content',
                        date_modified: '2029-01-22T16:28:32.615Z',
                        folder_id: testFolders[0].id,
            }
            return NotesService.insertNote(db, newNote)
                .then(actual => {
                    const jsonNote =  JSON.stringify(actual) //this turns it into json(string)
                    const parsedNewNote = JSON.parse(jsonNote)
                    expect(parsedNewNote).to.eql({
                        id: 1,
                        title: newNote.title,
                        content: newNote.content,
                        date_modified: newNote.date_modified,
                        folder_id: newNote.folder_id,
                    })
                })
        })
    })
  })
});
