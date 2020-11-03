const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const supertest = require("supertest");
const { makeFoldersArray } = require("./folders.fixtures");
const { get } = require("../src/app");


describe("Folders Endpoints", function () {
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

  describe("GET /folders", () => {

    context('Given no folders', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/folders')
                .expect(200, [])
        })
    })

    context("Given there are articles in database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("noteful_folders").insert(testFolders);
      });

      it("GET /folders responds with 200 and all folders", () => {
        return supertest(app).get("/folders").expect(200, testFolders);
      });
    });
  });

  describe("GET /folders/:folder_id", () => {
    context('Given no Folders', () => {
        it('responds with 404', () => {
            const folder_id = 123
            return supertest(app)
                .get(`/folders/${folder_id}`)
                .expect(404, {
                    error: { message : 'Folder does not exist'}
                })
        })
    })


    context("Given there are articles in database", () => {
      const testFolders = makeFoldersArray();

      beforeEach("insert folders", () => {
        return db.into("noteful_folders").insert(testFolders);
      });

      it("GET /folders/:folder_id responds with 200 and specified folder", () => {
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];
        return supertest(app)
          .get(`/folders/${folderId}`)
          .expect(200, expectedFolder);
      });
    });

    context('Given an XSS attack folder', () => {
        const maliciousFolder = {
            id: 911,
            title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        }

        beforeEach('insert Malicious folder', () => {
            return db
                .into('noteful_folders')
                .insert([maliciousFolder])
        })

        it('Removes malicious XSS attack content', () => {
            return supertest(app)
                .get(`/folders/${maliciousFolder.id}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
                })
        })
    })

  });

  describe("POST /folder", () => {
      it('Creates a new folder, responding with 201 and the new folder', () => {
          const newFolder = {
              title: 'New test folder'
          }
        return supertest(app)
            .post('/folders')
            .send(newFolder)
            .expect(201)
            .expect(res => {
                expect(res.body.title).to.eql(newFolder.title)
                expect(res.body).to.have.property('id')
                expect(res.headers.location).to.eql(`/folders/${res.body.id}`)
            })
            .then(postRes => 
                supertest(app)
                    .get(`/folders/${postRes.body.id}`)
                    .expect(postRes.body)
                )
      })

      it('responds with 400 and an error message when the title is empty', () => {
          return supertest(app)
            .post('/folders')
            .send({
                title: ''
            })
            .expect(400, {
                error: {message: 'Title cannot be empty'}
            })
      })
  })
});
