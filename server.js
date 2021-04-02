'use strict';
require('dotenv').config();
const express = require('express');
const getEvents = require('./src/getEvents.js');
const app = express();
const PORT = process.env.PORT;

app.get('/bananas', async (req, res) => {
    let results = await getEvents('beasleydotcom')
    console.log('this is server side results: 66666666666666666666666666666666666666666666666666666:       ', results)
    res.send(results);
})

app.listen(PORT, () => {
    console.log(`Glistening on PORT: ${PORT}`);
});