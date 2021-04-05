'use strict';
require('dotenv').config();
const express = require('express');
const getEvents = require('./src/getEvents.js');
const app = express();
const PORT = process.env.PORT;

app.get('/api/v1/', async (req, res) => {
    console.log('req.query', req.query.username);

    let results = await getEvents(req.query.username);
    // console.log('this is server side results: 66666666666666666666666666666666666666666666666666666:       ', results)
    res.send(results);
})

app.listen(PORT, () => {
    console.log(`Glistening on PORT: ${PORT}`);
});