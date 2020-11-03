const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const supertest = require("supertest");
const { makeNotesArray } = require("../test/notes.fixtures");
const { makeFoldersArray } = require("../test/folders.fixtures");
const { default: expectCt } = require("helmet/dist/middlewares/expect-ct");

describe.only("Notes endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );

  afterEach("cleanup", () =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE")
  );

  describe("GET /notes", () => {
    context("Given no notes in DB", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app).get("/notes").expect(200, []);
      });
    });

    context("Given there are notes in the DB", () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach("insert folders and notes", () => {
        return db
          .into("noteful_folders")
          .insert(testFolders)
          .then(() => {
            return db.into("noteful_notes").insert(testNotes);
          });
      });

      it("GET /notes respond with 200 and all notes", () => {
        return supertest(app).get("/notes").expect(200, testNotes);
      });
    });

    context("Given an XSS attack note", () => {
        const testFolders = makeFoldersArray();

      const maliciousNote = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folder_id: testFolders[2].id,
        date_modified: "2029-01-22T16:28:32.615Z",
      }

      beforeEach("insert folders and malicious note", () => {
        return db
            .into("noteful_folders")
            .insert(testFolders)
            .then(() => {
                return db
                    .into('noteful_notes')
                    .insert([maliciousNote])
            })
      });
      it('removes XSS attack note content', () => {
          return supertest(app)
            .get(`/notes/${maliciousNote.id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
            })
      })

    });
  });

  describe("GET /notes/:notes_id", () => {
    context("Given no notes in DB", () => {
      it("responds with 404", () => {
        const note_id = 123;
        return supertest(app)
          .get(`/notes/${note_id}`)
          .expect(404, {
            error: { message: "Note does not exist" },
          });
      });
    });
  });

  describe("POST /note", () => {
    context("given folders in the DB", () => {

      const testFolders = makeFoldersArray();

      beforeEach("insert folders and notes", () => {
        return db.into("noteful_folders").insert(testFolders);
      });

      it("Create a new note, responding with 204 and the new note", () => {
        const newNote = {
          title: " First Test Note ",
          content: "First Test content",
          folder_id: testFolders[2].id,
          date_modified: "2029-01-22T16:28:32.615Z",
        };
        return supertest(app)
          .post("/notes")
          .send(newNote)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).to.eql(newNote.title);
            expect(res.body.content).to.eql(newNote.content);
            expect(res.body.folder_id).to.eql(newNote.folder_id);
            expect(res.body.date_modified).to.eql(newNote.date_modified);
            expect(res.body).to.have.property("id");
            expect(res.headers.location).to.eql(`/notes/${res.body.id}`);
          })
          .then((postRes) =>
            supertest(app).get(`/notes/${postRes.body.id}`).expect(postRes.body)
          );
      });

      const requiredFields = ["title", "content", "folder_id", "date_modified"];

      requiredFields.forEach((field) => {
        const newNote = {
          title: " First Test Note ",
          content: "First Test content",
          folder_id: testFolders[2].id,
          date_modified: "2029-01-22T16:28:32.615Z",
        };
        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newNote[field];

          return supertest(app)
            .post("/notes")
            .send(newNote)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });
    });
  });

  describe.only('DELETE /notes/:note_id', () => {
      context('Given there are notes in the DB', () => {
          const testFolders = makeFoldersArray();
          const testNotes = makeNotesArray();

          beforeEach("insert folders and notes", () => {
            return db
              .into("noteful_folders")
              .insert(testFolders)
              .then(() => {
                return db.into("noteful_notes").insert(testNotes);
              });
          });

          it('responds with 204 and removes the note specified', () => {
              const idToDelete = 2
              const expectedNotes = testNotes.filter(note => note.id !== idToDelete)
              return supertest(app)
                .delete(`/notes/${idToDelete}`)
                .expect(204)
                .then(res => {
                    supertest(app)
                        .get('/notes')
                        .expect(expectedNotes)
                })
          })
      })
  })
});
