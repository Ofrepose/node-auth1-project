const express = require("express");
const db = require("./data/db");

const server = express();

const port = 5000;
const bcrypt = require("bcryptjs");

const session = require("express-session");

async function protected(req,res,next){
    console.log(`inside protected the req.session.username is ${req.session.user} and the req.session is ${req.session}`)
    if(req.session && req.session.user){
        next();
    }else{
        res.status(401).json({message:'You shall not pass!'})
    }
}

server.use(
    session({
        name: 'notsession',
        secret:'nobody tosses a dwarf!',
        cookie: {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: true,
        },
        httpOnly: true,
        resave: false,
        saveUninitialized: false,
    })
);


server.use(express.json())

server.listen(port, ()=>{
    console.log('The server is running on port 5000');
})

server.post('/api/register', (req,res)=>{
    const credentials = req.body;
    const hash = bcrypt.hashSync(credentials.password, 14);
    credentials.password = hash;
    db.createUser(credentials)
        .then(x=>{
            res.status(200).json({message:"User created"})
        })
        .catch(err=>{res.status(500).json({message: err})});
})

server.post('/api/login', (req, res)=>{
    let {username, password} = req.body;
    console.log({username});
    console.log({password});
    db.findByUsername({username})
        .first()
        .then(user=>{
            console.log(user.password)
            if(user && bcrypt.compareSync(password, user.password)){
                req.session.user= user.username
                res.status(200).json({message: 'logging in', cookie:req.session.id})
            }else{
                res.status(401).json({message:'You shall not pass!'})
            }
        })
        .catch(err=>{res.status(500).json({message:err})})
})

server.get('/api/users', protected, (req,res)=>{
    db('users')
        .then(users=>res.json(users))
        .catch(err=> res.json(err))
})

