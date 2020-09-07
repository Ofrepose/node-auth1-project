const knex = require("knex");
const config = require("../knexfile");
const db = knex(config.development);

module.exports = {
    createUser,
    findByUsername,
    getAllUsers,
};



function createUser(user){
    return db('users')
        .insert(user)
        .then(userData => userData)
}

function findByUsername(user){
    console.log(`username in db is ${user.username}`);


    return db('users').where('username',user.username);
}

function getAllUsers(){
    return db('users').select('*')
}