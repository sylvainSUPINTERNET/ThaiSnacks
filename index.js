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

// e.g -> http://localhost:3000/images/bg.png
app.use('', express.static(__dirname + '/public'));



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
                let currentArrayMetrics = JSON.parse(data);

                currentArrayMetrics.push(JSON.parse(data)); //current data
                currentArrayMetrics.push(connectionInfo) // new connection

                fs.writeFileSync(`${dir_metrics}`, JSON.stringify(currentArrayMetrics));

            } else {
                let metrics = [];
                metrics.push(connectionInfo);
                fs.writeFileSync(`${dir_metrics}`, JSON.stringify(metrics));
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
    console.log(`App runs on port : ${port}`)
});
