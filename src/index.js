const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

require('./controllers/auth')(app);
//require('./controllers/user')(app);

var port = 8080
app.listen(port,function(err){
  if (!err){
    console.log('Servidor iniciado na porta '+port);
  }else{
    console.log(err);
  }
});
