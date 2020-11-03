const NotesService = {
    getAllNotes(knex){
        return knex
        .select('*')
        .from('noteful_notes')
    }
}

module.exports =  NotesService;