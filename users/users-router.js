const express = require("express")
const bcrypt = require("bcryptjs")
const Users = require("./users-model")

const usersMiddleware = require("./users-middleware")

const router = express.Router()

router.get("/api/users", usersMiddleware.restrict(), async (req, res, next) => {
    try {
        res.json(await Users.find())
    } catch(err) {
        next(err)
    }
})

router.post("/api/register", async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await Users.findBy({ username }).first()

        if (user) {
            return res.status(409).json({
                message: "Username is already taken",
            })
        }

        const newUser = await Users.add({
            username,
            // hash the password with a time complexity of ten
            password: await bcrypt.hash(password, 14),
        })
        console.log(newUser)
        await res.status(201).json({
            'username': username , 'password': newUser.password})
    } catch(err) {
        next(err)
    }
})

router.post("/api/login", async (req, res, next) => {
    try {
        const { username, password } = req.body
        const user = await Users.findBy({ username }).first()

        if (!user) {
            return res.status(401).json({
                message: "Invalid Credentials",
            })
        }

        //compare the plain text password from the request body to the hash
        //we have stored in the database. returns true/false
        const passwordValid = await bcrypt.compare(password, user.password)
        // check if hash of request body password matches the hash we already have
        if(!passwordValid){
            return res.status(401).json({
                message: "Invalid Credentials",
            })
        }
        req.session.user = user
        res.json({
            message: "Logged in",
            cookie: req.session.user.id
        })
    } catch(err) {
        next(err)
    }
})

router.get('/api/logout', usersMiddleware.restrict(), async (req, res, next) =>{
    try{
        req.session.destroy((err)=>{
            if(err){
                next(err)
            }else{
                res.status(204).end()
            }
        })
    }catch (err) {
        next(err)
    }
})

module.exports = router
