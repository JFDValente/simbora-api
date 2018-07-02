const express = require('express')
const User = require('../models/user')
const Polylineroute = require('../models/polylineroute')
const PolyUtil = require('../util/PolyUtil')
const router = express.Router()

router.post('/', async(req,res) =>{
    destiny = req.body
    console.log(destiny)

    try{
        let { point, address } = destiny

        let routes = await Polylineroute.find({actived: true})

        let rides = []

        if(routes){
            for(ik=10; ik<500; ik++){
                for(j=0; j<routes.length; j++){
                    let route = routes[j];
                    let isWithin = await PolyUtil.isLocationOnEdge(point,route.polyline,true,ik)
                    if(isWithin){
                        let user = await User.findOne({_id: route.idUser})
                        rides.push({
                          name: "name teste",//user.name,
                          distance: ik,
                        });
                        routes.splice(j, 1)
                        if(rides.length == 15){
                            console.log({rides})
                            res.send({rides})
                        }
                    }
                }
            }
            if(rides.length>0){
                console.log({rides})
                res.send({rides})
            }else{
                return res.send({msg: 'Não há rotas próximas ao seu ponto de destino' })
            }
        }else{
            return res.send({msg: 'Não há rotas disponíveis no momento' })
        }
    }catch(err){
        console.log(err)
        res.status(500).send({erro: 'Route Find Failed!'})
    }
});

module.exports = app => app.use('/ride',router);
