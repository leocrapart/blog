const express = require("express")
const body_parser = require("body-parser")
const session = require("express-session")
const formidable = require("formidable")

const path = require("path")
const root = path.dirname(__dirname)

const time = require(__dirname + "/modules/time.js")
const unique_id = require(__dirname + "/modules/unique_id.js")

const app = express()
app.set("view engine", "pug")
app.set("views", path.join(root, "views"))
app.use(express.static(path.join(root, "public")))
app.use(body_parser.urlencoded({extended: true}))


// SESSION



app.use(session({
    secret: 'ougzgrz54gze4gze8',
    resave: true,
    saveUninitialized: true
}));
app.use((req,res,next) => {
    res.locals.session = req.session;
    next();
});

app.get("/settings", (req, res) => {
    res.render("log/settings")
})

app.post("/log-out", (req,res) => {
    req.session.destroy()
    res.redirect("/")
})

app.get("/sign-in", (req, res) => {
    res.render("log/sign-in")
})

app.post("/sign-in", (req, res) => {
    const email = req.body.email
    const password = req.body.password
    let error_msg = ""
    const saved_user = db.get_saved_user_by_email(email)   
    if (saved_user) {
        const db_email = saved_user.email
        const db_password = saved_user.password
        if (db_email == email && db_password == password) {
            req.session.loggedIn = true
            req.session.email = email
            req.session.password = password
            req.session.status = saved_user.status
            req.session.username = saved_user.username

            res.redirect("/")
        } else {
            error_msg = "Incorrect email and/or password"
            res.render("log/sign-in", {
            alert : {msg : error_msg,
                        status: "error"},
                        data : { email : email}
            })
        }
        
    } else {
        error_msg = "This account doesn't exist"
        res.render("log/sign-in", {
            alert : {msg : error_msg,
                     status: "error"},
            data : { email : email}
        })
    }
    
    
    
    
    
})

app.get("/sign-up", (req, res) => {
    res.render("log/sign-up")
})




app.post("/sign-up", (req, res) => {
    let error_msg = ""
    const success_msg = "Successfully registered"
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const password_check = req.body.password_check
    
    const saved_email = db.get_saved_user_by_email(email)
    if (saved_email) {
        error_msg += " Email already registered"
    }
    const saved_username = db.get_saved_user_by_username(username)
    if (saved_username) {
        error_msg += " Username already registered"
    }
    
    if (password != password_check) {
        error_msg += " The two password are different "
    }
    if (error_msg != "") {
        res.render("log/sign-up", {
            alert : {msg : error_msg,
                     status : "error"}
        })
    } else {
        db.add_user(username, email, password)
        
        // redirect + msg in session 
        res.render("log/sign-in", {
            alert : {msg : success_msg,
                     status : "success"},
            data : { email : email}
        })
    }
})


const db = require(__dirname + "/modules/database.js")


// DB METHODS

//    add_art,
//    add_question_to_art,
//    add_answer_to_question_from_art,
    
//    get_arts,
//    get_questions,
 //   get_questions_by_art,
 //   get_answers_from_question_from_art,
    
 //   remove_art,
 //   remove_question_from_art,
//    remove_answer_from_question_from_art

const create_answer_object = (text, author) => {
    const id = unique_id()
    const now = time.get_time()
    const answer = {
        id: id,
        text: text,
        date: now,
        author: author,
        relevance: 0
    }
    return answer
}



// GET


app.get("/", (req, res) => {
    res.render("home", {
        arts: db.get_arts()
    })
})

app.get("/questions", (req, res) => {
    res.render("questions", {
        questions: db.get_questions()
    })
})

app.get("/art", (req, res) => {
    const art_name = req.query.name
    const art = db.get_art_by_name(art_name)
    const questions = db.get_questions_by_art(art_name)
    res.render("art", {
        art: art,
        questions: questions
    })
})

app.get("/question", (req, res) => {
    const art_name = req.query.art
    const art = db.get_art_by_name(art_name)
    const question_name = req.query.question
    const question = db.get_question_by_name_and_art()
    res.render("question", {
        art: art_name,
        question: question,
        answers: question.answers
    })
})

app.get("/upload", (req, res) => {
    res.render("upload", {
        arts: db.get_arts()
    })
})

// POST


app.post("/add_art", (req, res) => {
    const art_name = req.body.art_name
    db.add_art(art_name)
    res.redirect("/upload")
})

app.post("/modify_art", (req, res) => {
    const name = req.body.art_name
    const new_name = req.body.new_name
    const description = req.body.description
    const img_src = req.body.img_src
    if (new_name) {
        db.modify_art(name, "name", new_name)
    }
    if (description) {
        db.modify_art(name, "description", description)
    }
    if (img_src) {
        db.modify_art(name, "img_src", img_src)
    }
    
    res.redirect("/")
})

app.post("/ask_question", (req,res) => {
    const art_name= req.body.art
    const question= req.body.question
    
    db.add_question_to_art(question, art_name, unique_id())
    res.redirect(`/art?name=${art_name}`)
})

app.post("/post_answer", (req,res) => {
    const text = req.body.text
    const author = req.body.author
    const question_id = req.body.question_id
    const answer = create_answer_object(text, author)
    db.add_answer_to_question(answer, question_id)
    res.redirect(`/${question_id}`)
})

app.post("/remove_art", (req, res) => {
    db.remove_art(req.body.art_name)
    res.redirect("/")
})

app.get("/remove", (req, res) => {
    res.render("remove", {
        questions: db.get_questions()
    })
})
// questions
app.get("/:id", (req, res) => {
    const id = req.params.id
    const question = db.get_question_by_id(id)
    const art_name = question.art
    const art_obj = db.get_art_by_name(art_name)
    // add 1 view to question
    db.add_1_view(id)
    const related_questions = db.get_only_questions_id_and_views_by_art(art_name)
    res.render("question", {
        question: question,
        art: art_obj,
        related_questions: related_questions
    })
})

app.post("/remove_question", (req, res) => {
    const question_id = req.body.question_id
    const art_name = req.body.art_name
    db.remove_question(question_id)
    //res.redirect(`/art?name=${art_name}`)
    res.redirect("/remove")
})

app.post("/up_relevance", (req, res) => {
    const answer_id = req.body.answer_id
    const question_id = req.body.question_id
    db.update_relevance(question_id, answer_id, 1)
    res.redirect(`/${question_id}`)
})

app.post("/down_relevance", (req, res) => {
    const answer_id = req.body.answer_id
    const question_id = req.body.question_id
    db.update_relevance(question_id, answer_id, -1)
    res.redirect(`/${question_id}`)
})

app.post("/remove_answer", (req, res) => {
    const answer_id = req.body.answer_id
    const question_id = req.body.question_id
    db.remove_answer(question_id, answer_id)
    res.redirect(`/${question_id}`)
})



app.post('/upload_img', function (req, res){
    //IMG
    const form = new formidable.IncomingForm();
    const MB = 1024 * 1024
    form.maxFileSize = 10 * MB
    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = path.join(root, "public", "img", file.name)
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name)
    });
    //IMG
    res.redirect("/upload");
})



const port = 8080
app.listen(port, () => {
    console.log("Blog started on port "+port)
})