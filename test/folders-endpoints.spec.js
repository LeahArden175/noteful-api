const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')

describe('Folders Endpoints', function() {

    let db

    before('make knex instance', () => {
        db = knex({
            client : 'pg',
            connection : process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    context('Given there are articles in database', () => {
        const testFolders = [
            {
                id: 1,
                title: 'First Test Folder'
            },
            {
                id: 2,
                title: 'Second Test Folder'
            },
            {
                id: 3,
                title: 'Third Test Folder'
            },
            {
                id: 4,
                title: 'Fourth Test Folder'
            }
        ]

        beforeEach('insert folders', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })

        it('GET /folders responds with 200 and all folders', () => {
            return supertest(app)
                .get('/folders')
                .expect(200, testFolders)
        })

        it('GET /folders/:folder_id responds with 200 and specified folder', () => {
            const folderId = 2
            const expectedFolder = testFolders[folderId -1]
            return supertest(app)
                .get(`/folders/${folderId}`)
                .expect(200, expectedFolder)
        })
    })

})