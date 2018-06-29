const express = require('express');
const User = require('../models/user');
const Polylineroute = require('../models/polylineroute');

const router = express.Router();

router.post('/', async(req,res) =>{
    routemapReq = req.body;
    console.log(routemapReq);
    let { idUser } = routemapReq;

    try{
        if(await !User.findOne({_id: idUser}))
            return res.status(412).send({'error': 'Usuário requisitante não existe'});

        const polylineroute = await Polylineroute.create(routemapReq);
        let { _id } = polylineroute

        return res.send({ _id });

    }catch(err){
        console.log(err);
        res.status(500).send({erro: 'Confirme Route Failed!'});
    }
});

module.exports = app => app.use('/routeMap',router);
