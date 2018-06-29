const express = require('express')
const User = require('../models/user')
const Polylineroute = require('../models/polylineroute')
const PolyUtil = require('../util/PolyUtil')
const router = express.Router()

router.get('/', async(req,res) =>{
    destiny = req.body
    console.log(destiny)

    try{
        let { point, address } = destiny

        let routes = await Polylineroute.find({actived: true})

        let rides = []

        if(routes){
            for(i=10; i<500; i+=10){
                for(j=0; j<routes.length; j++){
                    let route = routes[j];
                    let isWithin = PolyUtil.isLocationOnEdge(point,route,true,i)
                    if(isWithin){
                        let user = await User.findOne({_id: route.idUser})
                        rides.push({
                          name: user.name,
                          distance: i,
                        });
                        routes.splice(i, 1)
                        if(rides.length == 15){
                            res.send({rides})
                        }
                    }
                }
            }
            if(rides.length>0){
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