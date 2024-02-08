const router = require('express').Router()
const User = require("../models/User")
const bcryptjs = require("bcryptjs")
const jwt= require("jsonwebtoken")

// Register
router.get('/register', async (req, res) => {
    res.render('auth/register.handlebars')
})

router.post("/register", async (req, res) => {

    const {username, email, password, passwordConfirmation} = req.body

    console.log(req.body)
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

    console.log(user)

    try {
        await user.save()
        res.redirect('/auth/login')
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal error" }.send(error))
    }

})

// Login
router.get('/login', async (req, res) => {
    res.render('auth/login.handlebars')
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    console.log(req.body)

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

       res.cookie('token', token);

       res.redirect('/users/list')

    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal error" })
    }
})

module.exports = router