'use strict';

const {Pool} = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//Server conf
let port = process.env.PORT || 7777;

const fs = require('fs');
const dir_metrics = './metrics/connections_info.json';


app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json());

// e.g -> http://localhost:3000/images/bg.png
app.use('', express.static(__dirname + '/public'));


//Middle ware count request on the landing page
app.use((req, res, next) => {
    /*
    let connectionInfo = {
        HTTP_method: req.method,
        originalUrl: req.originalUrl,
        timestamp: Date.now(),
        dateFormatted: new Date(Date.now()),
        remoteAddress: req.connection.remoteAddress
    };


    fs.readFile(`${dir_metrics}`, async (err, data) => {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                let currentArrayMetrics = JSON.parse(data);

                currentArrayMetrics.push(JSON.parse(data)); //current data
                currentArrayMetrics.push(connectionInfo) // new connection

                fs.writeFileSync(`${dir_metrics}`, JSON.stringify(currentArrayMetrics));

                try {
                    const client = await pool.connect()
                    const result = await client.query('INSEM metrics_connection');
                    client.release();
                } catch (err) {
                    console.error(err);
                    res.send("Error " + err);
                }

            } else {
                let metrics = [];
                metrics.push(connectionInfo);
                fs.writeFileSync(`${dir_metrics}`, JSON.stringify(metrics));
            }

        }
    });
    next()
     */
});

//access db -> heroku pg:psgl
//refer https://devcenter.heroku.com/articles/getting-started-with-nodejs#provision-a-database
// TODO -> ajouter les connections info dans database; (deja create etc jusque,le code ici a faire)
// TODO -> le block metrics le mettre juste sur la route / (osef des autres routes); ou alors creer une deuxieme tables en mode path et du coup laisser un call sur toutes les requete qui save juste le path cliqué


app.get('/', async (req, res) => {

    let connectionInfo = {
        HTTP_method: req.method,
        originalUrl: req.originalUrl,
        timestamp: Date.now(),
        dateFormatted: new Date(Date.now()),
        remoteAddress: req.connection.remoteAddress
    };

    try {
        const client = await pool.connect();
        const insert = await client.query(`
        INSERT INTO metrics_connection (http_method,original_url, timestamp, createdat, remote_address) 
        VALUES
         (${connectionInfo.HTTP_method},
          ${connectionInfo.originalUrl}, 
          ${connectionInfo.timestamp}, 
          ${connectionInfo.dateFormatted}, 
          ${connectionInfo.remoteAddress})`);
        client.release();
        res.render('pages/index');
    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }

});


app.listen(port, function () {
    console.log("one connection")
    console.log(`App runs on port : ${port}`)
});
