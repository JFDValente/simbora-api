const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');
const User = require('../models/user');

const router = express.Router();

function generateToken(params={}){
  return jwt.sign(params, authConfig.secret,{
    expiresIn: 86400,
  });
}

router.post('/register', async(req,res) =>{
  const {email} = req.body;
  try{
    if(await User.findOne({email}))
      return res.status(412).send({'error': 'Este endereço de email já está sendo utilizado'});

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({id: user.id}),
    });
  }catch(err){
    console.log(err);
    res.status(412).send({erro: 'Registration failed'});
  }
});

router.post('/authenticate', async(req,res) => {
    const {email, password} = req.body;
    console.log("tentando consultar o banco de dados");
    const user = await User.findOne({email}).select('+password');

    if(!user)
      return res.status(400).send({'error': 'Usuário não encontrado'});

    if(!await bcrypt.compare(password, user.password))
      return res.status(400).send({'error': 'Senha inválida'});

    user.password = undefined;

    res.send({
      user,
      token: generateToken({id: user.id}),
    });
});

router.put('/edit', async(req,res) =>{
  userReq = req.body;
  let { _id } = userReq;
  console.log(userReq);
  console.log(_id);

  try{
    User.findByIdAndUpdate(_id,userReq,{new: true},(err,user) => {
        if (!err){
            return res.send(user);
        }
    });
  }catch(err){
    return res.status(500).send({'error': err});
  }
});

router.put('/disable', async(req,res) =>{
  userReq = req.body;
  let { _id } = userReq;

  try{
    User.findByIdAndUpdate(_id,{actived: false},{new: true},(err,user) => {
        if (!err){
            return res.send(user);
        }
    });
  }catch(err){
    return res.status(500).send({'error': err});
  }
});

module.exports = app => app.use('/auth',router);
