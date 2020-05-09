const path = require("path")
const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")


const root = path.dirname(path.dirname(__dirname))
const database_path = path.join(root, "database", "database.json")
console.log(database_path)
const adapter = new FileSync(database_path)
const db = low(adapter)

 //init db
db.defaults({users: [], questions: [], arts: []})
    .write()

const add_art = (art_name, description="", img_src="") =>{ 
    const art_obj= {name: art_name, description: description, img_src: img_src}
    const past_art = db.get("arts")
                        .find({name: art_name})
                        .value()
    if (!past_art) {
        db.get("arts")
        .push(art_obj)
        .write()
    } else {
        console.log(`The art ${art_name} is already in database`)
    }            
}

const get_art_by_name = (art_name) => {
    const art_obj = db.get("arts")
                    .find({name: art_name})
                    .value()
    return art_obj
}
const remove_art = (art_name) => {
    const art = db.get("arts")
                    .find({name: art_name})
                    .value()
    if (art) {
        db.get("arts")
            .remove({name: art_name})
            .write()
    } else {
        console.log(`The art ${art_name} doesn't exist`)
    }
}

const remove_question = (question_id) => {
    const question_obj = db.get("questions")
                        .find({id: question_id})
                        .value()
    if (question_obj) {
        db.get("questions")
                .remove({id: question_id})
                .write()
    } else {
        console.log(`The question ${question} doesn't exist in art ${art_name}`)
    }
}

const remove_answer = (question_id, answer_id) => {
    const question_obj = db.get("questions")
                        .find({id: question_id})
                        .value()
    if (question_obj) {
        const answer = db.get("questions")
                            .find({id: question_id})
                            .get("answers")
                            .find({id: answer_id})
                            .value()
        if (answer) {
            db.get("questions")
                .find({id: question_id})
                .get("answers")
                .remove({id: answer_id})
                .write()
                
        } else {
            console.log(`Question ${question} found but no answser with id ${answer_id} `)
        }
        
    } else {
        console.log(`No question ${question} from art ${art_name}`)
    }
}
const add_question_to_art = (question, art_name, unique_id) => {
    const question_obj = {id: unique_id, art: art_name, question: question, answers: [], views: 0}
    if (db.get("arts").find({name: art_name}).value()) {
        if (!db.get("questions")
                .filter({art: art_name})
                .find({question: question})
                .value())
        db.get("questions")
            .push(question_obj)
            .write()
    } else {
        console.log("No such art")
    }
}

const add_answer_to_question = (answer_obj, question_id) => {
    const question = db.get("questions")
                        .find({id : question_id})
    if (question.value()) {
        console.log(question.value())
        question.get("answers")
                .push(answer_obj)
                .write()
    } else {
        console.log(`The question with id ${question_id} hasn't been found`)
    }
    
    
      

}

const add_answer_to_question_from_art = (answer, question, art_name) => {
    const question_obj = db.get("questions")
                        .find({question: question, art: art_name})
                        .value()
    if (question_obj) {
        question_obj.push(answer)
                    .write()
    } else {
        console.log(`The question ${question} doesn't exist in the ${art_name} art`)
    }
}

const get_arts = () => db.get("arts")
                            .value()
const get_questions= () => db.get("questions")
                            .value()
const get_questions_by_art = (art_name) => {
    const art = db.get("questions")
                    .filter({art: art_name})
                    .value()
    if (art) {
        return art
    } else {
        console.log(`There is no ${art_name} art `)
    }
}

const get_only_questions_id_and_views_by_art = (art_name) => {
    const questions = db.get("questions")
                    .filter({art: art_name})
                    .map("question")
                    .value()
    if (questions) {
        const ids = db.get("questions")
                        .filter({art: art_name})
                        .map("id")
                        .value()
        const views = db.get("questions")
                        .filter({art: art_name})
                        .map("views")
                        .value()
        let questions_ids_views = []
        for (let i=0; i<ids.length; i++) {
            questions_ids_views.push({question: questions[i], id: ids[i], views: views[i]})
        }
        return questions_ids_views
        
    } else {
        console.log(`There is no ${art_name} art `)
    }
}

const get_question_by_id = (id) => {
    const question = db.get("questions")
                        .find({id : id})
                        .value()
    if (question) {
        return question
    } else {
        console.log(`The question with id ${id} hasn't been found`)
    }
}
const get_question_by_name_and_art = (question, art_name) => {
    const question_obj = dn.get("questions")
                            .find({question: question, art: art_name })
                            .value()
    if (question_obj) {
        return question_obj
    } else {
        console.log(`No question ${question} in the ${art_name} art `)
    }
}
const get_answers_from_question_from_art = (question, art_name) => {
    const question_obj = db.get("questions")
                            .find({question: question, art: art_name})
                            .value()
    if (question_obj) {
        return question_obj.get("messages")
                    .value()
        
    } else {
        console.log(`No question ${question} in the ${art_name} art `)
    }
}

const modify_art = (art_name, key, value) => {
    const art_obj = db.get("arts")
        .find({name: art_name})
        .value()
    if (art_obj) {
        db.get("arts")
            .find({name: art_name})
            .set(key, value)
            .write()
    } else {
        console.log(`No art with name ${art_name}`)
    }
}

const add_1_view= (question_id) => {
    const question = db.get("questions")
                        .find({id: question_id})
                        .value()
    if (question) {
        db.get("questions")
            .find({id: question_id})
            .update("views", n => n+1)
            .write()
    } else {
        console.log(`No question with id ${question_id}`)
    }
    
}

const get_saved_user_by_email = (email) => {
    const saved_user = db.get("users")
                            .find({email: email})
                            .value()
    if (saved_user) {
        return saved_user
    } else {
        console.log(`The email ${email} isn't linked to a user`)
    }
}
const get_saved_user_by_username = (username) => {
    const saved_user = db.get("users")
                            .find({username: username})
                            .value()
    if (saved_user) {
        return saved_user
    } else {
        console.log(`The username ${username} isn't linked to a user`)
    }
}

const add_user = (username, email, password) => {
    const new_user = {
        username: username,
        email: email,
        password: password,
        status: "watcher"
    }
    db.get("users")
        .push(new_user)
        .write()
}
const update_relevance = (question_id, answer_id, delta) => {
    db.get("questions")
        .find({id: question_id})
        .get("answers")
        .find({id: answer_id})
        .update("relevance", n => n+delta)
        .write()
}

module.exports = Object.assign({
    add_art,
    add_question_to_art,
    add_answer_to_question_from_art,
    add_answer_to_question,
    
    add_1_view,
    
    modify_art,
    
    get_arts,
    get_art_by_name,
    get_questions,
    get_questions_by_art,
    get_only_questions_id_and_views_by_art,
    get_question_by_id,
    get_question_by_name_and_art,
    get_answers_from_question_from_art,
    
    remove_art,
    remove_question,
    remove_answer,
    
    //users
    get_saved_user_by_email,
    get_saved_user_by_username,
    add_user,
    //relevance
    update_relevance
    
})