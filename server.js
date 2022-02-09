'use strict';
require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const getEvents = require('./src/getEvents.js');

const PORT = process.env.PORT;
const app = express();
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@pacificeventsdb.10hpw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userExists = require('./src/databaseMethods/userExists.js');
const getOneUser = require('./src/databaseMethods/getOneUser.js');
const insertOneUser = require('./src/databaseMethods/insertOneUser.js');
const updateUser = require('./src/databaseMethods/updateUser.js');



app.get('/api/v2/getSeedData', cors(), async (req, res) => {
    let username = req.query.username.toLowerCase();
    let userDoesExist = await userExists(client, username);
    let userInfo;

    // does user exist in database?

    if (userDoesExist) {
        // if so, send what you have, 
        userInfo = await getOneUser(client, username);
        userInfo = JSON.parse(userInfo).performances;

        return await res.end(JSON.stringify(userInfo));
    } else {
        let arrayOfEventObjects = await getEvents(req.query.username.toLowerCase(), true);
        console.log("get seed data return from getEvents: " + arrayOfEventObjects)
        await res.end(JSON.stringify(arrayOfEventObjects));

        // add whole user to database
        return await insertOneUser(client, username, arrayOfEventObjects);
    }
});


app.get('/api/v2/getLatestResults', cors(), async (req, res) => {
    console.log("inside getLatestResults route")

    let username = req.query.username.toLowerCase();
    let userDoesExist = await userExists(client, username);
    let userInfo;

    // does user exist in database?

    if (!userDoesExist) {
        // this case should not occur because getLatestResults implies results already exist.
        return res.status(404).end("user does not exist. Are you sure you spelled it correctly?");
    }

    userInfo = await getOneUser(client, username);
    userInfo = JSON.parse(userInfo).performances;

    let lastKnownEventId = userInfo[userInfo.length - 1].ID
    let arrayOfEventObjects = await getEvents(req.query.username.toLowerCase(), false, lastKnownEventId);
    if (arrayOfEventObjects.length === 0) {
        // no new events to update in database
        return res.status(200).end(JSON.stringify(userInfo));
    } else {
        // there are events that need to be added to database
        // update database with new results and return new document

        let newDocumentFromUpdate = await updateUser(client, username, arrayOfEventObjects);
        return res.status(200).end(JSON.stringify(newDocumentFromUpdate));
    }
});




app.listen(PORT, () => {
    console.log(`Glistening on PORT: ${PORT}`);
});