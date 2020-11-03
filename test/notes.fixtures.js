function makeNotesArray() {
    return [
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
}

module.exports = {
    makeNotesArray,
}