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
        folder_id: 2,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 2,
        title: ' Second Test Note ',
        content: 'Second Test content',
        folder_id: 1,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 3,
        title: ' Third Test Note ',
        content: 'Third Test content',
        folder_id: 4,
        date_modified: '2029-01-22T16:28:32.615Z',
      },
      {
        id : 4,
        title: ' Fourth Test Note ',
        content: 'Fourth Test content',
        folder_id: 2,
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
});
