const express = require("express")
const mongoose = require("mongoose")
require('dotenv').config()
const jwt = require("jsonwebtoken")
const handlebars = require("express-handlebars")
const path = require('path')
const auth = require('./routes/auth')
const users = require('./routes/users')
const User = require("./models/User")
const cookieParser = require('cookie-parser');
const app = express();

//Config
    // Usando json
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    // Handlebars
    app.engine('handlebars', handlebars.engine({
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        }
    }))
    app.set('view engine', handlebars) 
    // Cookies
    app.use(cookieParser());
    // public
    app.use(express.static(path.join(__dirname, "public")))

//Rotas

    app.get('/user/:id', checkToken, async (req, res) =>{
        const id = req.params.id

        const user = await User.findById(id, '-password')

        if(!user){
            return res.status(404).json({error: "User not found"})
        }

        return res.status(200).json({user})

    })

    function checkToken(req, res, next) {

        const auth = req.headers['authorization']
        const token = auth && auth.split(' ')[1]

        console.log(auth)
        console.log(token)

        if (!token) {
            return res.status(401).json({error: "Access denied"})
        }

        
        try {
            const secret = process.env.SECRET;

            jwt.verify(token, secret)
            next()
        } catch (error) {
            console.log(error)
            res.status(500).json({text: "Invalid Token"})            
        }

    }


    app.get('/', (req, res) => {
        res.redirect('/auth/login')
    })

    app.use('/auth', auth)
    app.use('/users', users)

// Credenciais
const user = process.env.USER_NAME;
const password = process.env.USER_PASS;

const PORT = process.env.PORT || 3335

mongoose.connect(`mongodb+srv://italomonte:za8XrM9c9gUzD4O5@cluster0.ltd1xgy.mongodb.net/?retryWrites=true&w=majority`)
.then(
    app.listen(PORT, () => { console.log(`Server On. http://localhost:${PORT}`) })
)