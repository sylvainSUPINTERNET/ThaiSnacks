'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Server conf
let port = process.env.PORT || 7777;

const fs = require('fs');
const dir_metrics = './metrics/connections_info.json';



app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());

// e.g -> http://localhost:3000/static/images/bg.png
app.use('/static', express.static(__dirname + '/public'));



//Middle ware count request on the landing page
app.use((req, res, next) => {
    let connectionInfo = {
        HTTP_method: req.method,
        originalUrl: req.originalUrl,
        timestamp: Date.now(),
        dateFormatted: new Date(Date.now()),
        remoteAddress:req.connection.remoteAddress
    };


    fs.readFile(`${dir_metrics}`, (err, data) => {
        if(err){
            console.log(err);
        } else {
            if(data.length > 0){
                console.log(JSON.parse(data))
                let metrics = [];
                metrics.push(JSON.parse(data)); //current data
                metrics.push(connectionInfo) // new connection
                fs.writeFileSync(`${dir_metrics}`, JSON.stringify(metrics));

            } else {
                let metrics = [];
                metrics.push(JSON.stringify(connectionInfo));
                fs.writeFileSync(`${dir_metrics}`, metrics);
            }

        }
    });
    next()
});



app.get('/', function(req, res) {
    res.render('pages/index');
});


app.listen(port, function () {
    console.log("one connection")
    console.log('Example app listening on port 3000!')
});
