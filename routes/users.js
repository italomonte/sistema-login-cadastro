const router = require('express').Router()
const User = require("../models/User")
const jwt = require("jsonwebtoken")

router.get('/list',checkToken, async (req, res) => {

    const users = await User.find()

    res.render('users/users.handlebars', {users: users})
})

function checkToken(req, res, next) {

    const token = req.cookies.token;
    console.log("token: " + token)

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

module.exports = router