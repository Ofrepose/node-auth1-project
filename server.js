const express = require("express");
const db = require("./data/db");

const server = express();

const port = 5000;
const bcrypt = require("bcryptjs");

const session = require("express-session");

server.use(
    session({
        name: 'notsession',
        secret:'nobody tosses a dwarf',
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
    req.
})

