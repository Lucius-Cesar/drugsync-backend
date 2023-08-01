var express = require('express');
var router = express.Router();

const User = require("../models/users")
const {checkBody} = require("../modules/checkBody")

const bcrypt = require("bcrypt")
const uid2 = require("uid2")

// mis en place de la route SignUp grace a la route Post

router.post("/signup",(req,res) =>{
  // Check if signUp data is Valid
  if(!checkBody(req.body, [
    "firstname",
    "lastname",
    "mail",
    "password",
    "adress",
    "profession"])){
    res.json({ result: false, error: "Missing or empty fields"})
    return
  }

  //Check if user is already registered
  User.findOne({ mail: { $regex: new RegExp(req.body.mail, 'i') } })
  .then(data =>{
    if(data === null){
      //hash password with bcrypt
      const hash = bcrypt.hashSync(req.body.password,10)
      // user is not yet registered
      const newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        mail: req.body.mail,
        password: hash,
        adress: req.body.adress,
        profession: req.body.profession,
        token: uid2(32)
      })

      newUser.save()
      .then( newDoc =>{
        res.json({ result: true, token: newDoc.token }) //au moment de l'inscription et de la connection on retourne le token pour qu'il puisse utiliser le toker pour naviguer et communiquer avec le backend
      })

    } else{
      // user is already registered
      res.json({ result: false, error: "Mail already exists"})
    }
  })


})

// mis en place de la route SignIn grace a la route Post

router.post("/signin",(req,res) =>{
  // Check if signIn data is Valid
  if(!checkBody(req.body, [
    "mail",
    "password"
  ])){
    res.json({ result: false, error: "Missing or empty fields"})
    return
  }

  User.findOne({
    mail: { $regex: new RegExp(req.body.mail, 'i') },
    
  })
  .then(data =>{
    // mail is registered
    if (data  && bcrypt.compareSync(req.body.password, data.password)){
    res.json({ result: true, token: data.token})
  } else{
    // mail was not found in DB
    res.json({ result: false, error:"Mail not found or wrong password"})
  }
  })
  
})

router.get("/checkToken/:token", (req,res)=>{
  User.findOne({ token: req.params.token })
    .then(data =>{ 
      if(data){
      //user found
      res.json({ result: true })
    }else{
      //user does not exist
      res.json({ result: false, error:"User not found" })
    }
  
  })
   
  })


module.exports = router;
