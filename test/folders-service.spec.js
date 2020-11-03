const { expect } = require("chai");
const knex = require("knex");
const FoldersService = require("../src/folders/folders-service");
const app = require("../src/app");

describe.only("Folders service object", function () {
  let db;

  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    //db('noteful_articles').truncate();
    //db.into('noteful_folders').insert(testFolders)
  });

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

  before(() =>
    db.raw("TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE"));


  afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))


  after(() => db.destroy())

  describe('getAllFolders()', () => {

    context("Given noteful_folders has data", () => {

        beforeEach(() => {
            return db
                .into("noteful_folders")
                .insert(testFolders);
          });


        it("getAllFolders() returns all folders from noteful_folders", () => {
          return FoldersService.getAllFolders(db).then((actual) => {
            expect(actual).to.eql(testFolders);
          });
        });
        it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
            const thirdId = 3
            const thirdTestFolder = testFolders[thirdId - 1]
            return FoldersService.getById(db, thirdId)
              .then(actual => {
                expect(actual).to.eql({
                  id: thirdId,
                  title: thirdTestFolder.title,
                })
              })
          })
    });

    context("Given noteful_folders has no data", () => {
        it("getAllFolders() resolves an empty array", () => {
            return FoldersService.getAllFolders(db)
            .then((actual) => {
              expect(actual).to.eql([]);
            });
        });

        it('insertFolder() inserts a new folder and gives it an id', () => {
            const newFolder = {
                title: 'New Test Folder'
            }
            return FoldersService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        title: newFolder.title
                    })
                })
        })
    })
  })
});
