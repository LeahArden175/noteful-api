const { expect } = require("chai")
const FolderService = require('../src/folders/folders-service')
const knex = require('knex')
const FoldersService = require("../src/folders/folders-service")

describe.only('Folders service object', function() {
    let db
    let testFolders = [
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

    before(() =>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    describe('getAllFolders ()', () => {
        it('returns all folders from noteful_folders', () => {
            return FoldersService.getAllFolders()
            .then(actual => {
                expect(actual).to.eql(testFolders)
            })
        })
    })
})