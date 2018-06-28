const express = require('express');
const polylineroute = require('../models/polylineroute');

const router = express.Router();

router.post('/', async(req,res) =>{
  routemapReq = req.body;
  const {email} = userReq;
  console.log(userReq);

  try{
    Users.findOne({email},function(err,user){
        if (!err){
            if(user){
                console.log(user);
                user.name = userReq.name;
                user.phonenumber = userReq.phonenumber;
                user.cpf = userReq.cpf;
                user.registrationUFAM = userReq.registrationUFAM;
                user.save();
                return res.send({user});
            }else{
                return res.status(412).send({'error': 'Usuário não registrado previamente'});
            }
        }else{
            throw err;
            res.status(500).send({'error': err});
        }
    });
  }catch(err){
    return res.status(500).send({'error': err});
  }
});

module.exports = app => app.use('/user',router);
