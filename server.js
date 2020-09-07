const express = require("express");
const db = require("./data/db");

const server = express();

const port = 5000;
const bcrypt = require("bcryptjs");

const session = require("express-session");

function restrict(){
    const authError = {
        message:"Invalid Credentials",
    }
    return async (req, res, next)=>{
        try{
            const {username, password} = req.headers

            //make sure the values are not empty
            if (!username || !password){
                return res.status(401).json(authError)
            }

            const user = await db.findBy({username}).first()
            // make sure user exists
            if (!user){
                return res.status(401).json(authError)
            }

            const passwordValid = await bcrypt.compare(password, user.password)

            if(!passwordValid){
                return res.status(401).json(authError)
            }

            //if we reach this point we know the user is auth
            next();

        }catch (err) {
            next(err)
        }

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

server.post('/api/login', async (req, res)=>{
    let {username, password} = req.body;
    console.log({username});
    console.log({password});
    await db.findByUsername({username})
        .first()
        .then(user=>{
            console.log(user.password)
            if(user && bcrypt.compareSync(password, user.password)){
                // req.session = user
                req.session.username = user.username
                res.status(200).json({message: 'logging in', cookie:req.session})
            }else{
                res.status(401).json({message:'You shall not pass!'})
            }
        })
        .catch(err=>{res.status(500).json({message:err})})
})

server.get('/api/users', restrict(), (req,res)=>{
    db.getAllUsers()
        .then(users=>res.json(users))
        .catch(err=> res.json(err))
})

