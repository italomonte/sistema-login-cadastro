const express = require("express")
const mongoose = require("mongoose")
const bcryptjs = require("bcryptjs")
require('dotenv').config()
const jwt = require("jsonwebtoken")

const User = require("./models/User")

const app = express();

//config
    app.use(express.json())

//Rotas

    app.get('/users/:id', checkToken, async (req, res) =>{
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

    app.post("/users/register", async (req, res) => {

        const {username, email, password, passwordConfirmation} = req.body

        //Validations

        if(!username){
            return res.status(422).json({error: "Username is empty."})
        }
        if (!email) {
            return res.status(422).json({error: "Email is empty."})
        }
        if (!password || !passwordConfirmation) {
            return res.status(422).json({error: "Complete passwords fields."})
        }
        if(password != passwordConfirmation){
            return res.status(422).json({error: "Passwords don't match."})
        }

        //Verify if email already exists
        const userExists = await User.findOne({email: email})

        if (userExists) {
            return res.status(422).json({error: "Email already exists."})
        }

        // Hash password
        const salt = await bcryptjs.genSalt(12)
        const passwordHash = await bcryptjs.hash(password, salt)

        //Create User
        const user = new User({
            username,
            email, 
            password: passwordHash,
        })

        try {
            await user.save()
            res.status(201).json({text: "User created."})
        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Internal error" })
        }

    })

    app.post('/users/login', async (req, res) => {
        const {email, password} = req.body;

        // Validations
        if (!email) {
            return res.status(422).json({error: "Email is empty."})
        }
        if (!password){
            return res.status(422).json({error: "Password is empty"})
        }

        //Verify if user exists
        const user = await User.findOne({email: email})

        if(!user){
            return res.status(404).json({error: "User not found."})
        }

        const passwordValidator = await bcryptjs.compare(password, user.password)

        if(!passwordValidator){
            return res.status(422).json({error: "Password is incorrect!"})
        }

        try {
           const secret = process.env.SECRET 

           const token = jwt.sign({
            id: user._id
           },
            secret,
           )

           res.status(200).json({msg: "Autentication done successfully.", token})

        } catch (error) {
            console.log(error)
            res.status(500).json({error: "Internal error" })
        }
    })


// Credenciais
const user = process.env.USER_NAME;
const password = process.env.USER_PASS;

mongoose.connect(`mongodb+srv://${user}:${password}@cluster0.ltd1xgy.mongodb.net/?retryWrites=true&w=majority`)
.then(
    app.listen(3333, () => { console.log("Server On.") })
)