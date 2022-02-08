'use strict';
require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const getEvents = require('./src/getEvents.js');

const PORT = process.env.PORT;
const app = express();
// app.use(cors());
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${ DB_USERNAME }:${ DB_PASSWORD }@pacificeventsdb.10hpw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/api/v2/getSeedData', cors(), async (req, res) => {
    let username = req.query.username.toLowerCase();
    let userDoesExist = await userExists(username);
    let userInfo;
    console.log('req.query', req.query.username);
 
      // does user exist in database?
     
    if ( userDoesExist ) {
        // if so, send what you have, 
        console.log("********************* user does exist in database");
        userInfo = await getOneUser(username);
        userInfo = JSON.parse(userInfo).performances;
        console.log("USER INFO: ********************** " + userInfo)

        return await res.end(JSON.stringify(userInfo));
    } 
    if ( !userDoesExist ) {
        console.log("user does  N O T  exist in database");
        let arrayOfEventObjects = await getEvents(req.query.username.toLowerCase(), true);
        
        await res.end(JSON.stringify(arrayOfEventObjects));

        // add whole user to database
        return await insertOneUser(username, arrayOfEventObjects);
    } 
});
app.get('/api/v2/getLatestResults', cors(), async (req, res) => {

    let username = req.query.username.toLowerCase();
    let userDoesExist = await userExists(username);
    let userInfo;
    console.log('req.query', req.query.username);
    // retrieve all events from facebook. 
      // does user exist in database?
     
    if ( !userDoesExist ) {
        return res.status(404).end();
    }
    // then user does exist, send what you have, 
    console.log("********************* user does exist");
    
    userInfo = await getOneUser(username);
    console.log("THIS IS USERINFO BEFORE ANYTHING: " + userInfo)
    userInfo = JSON.parse(userInfo).performances;


    let lastKnownEventId = userInfo[userInfo.length-1].ID
    console.log("THIS IS LAST KNOWN eventID IN SERVER.JS: " + lastKnownEventId)
    let arrayOfEventObjects = await getEvents(req.query.username.toLowerCase(), false, lastKnownEventId);
    

    if ( arrayOfEventObjects !== userInfo ) {
    // if not strictly equal, which performances need to be added?
    console.log("not strictly equal, which performances need to be added?");
        let lastEventInDb = userInfo[userInfo.length-1];
        let startingIndex = arrayOfEventObjects.indexOf(lastEventInDb) + 1;
        if ( startingIndex >= arrayOfEventObjects.length ) {
            //events array is different but no new event needs to be added
            console.log("events array is different but no new event needs to be added");
            return res.status(200).end(JSON.stringify(userInfo));
        } else {
            // add all new events
            await updateUser ( username, arrayOfEventObjects, userInfo );
            console.log("added all new events to database");
            userInfo = await getOneUser(username);
            userInfo = JSON.parse(userInfo).performances
            return res.status(200).end(JSON.stringify(userInfo));
        }
    } else {
        // else strictly equal == no further work required.
        return res.status(200).end(JSON.stringify(userInfo));
    }


   


    // does user exist in database? 
        // if so, res.write what you have, then check for length of array with number of keys, then for strict equality of events array
            // if not strictly equal, which performances need to be added?
                // iterate through arrayOfEventObjects array :
                    // does ID exist? move on, else add event.
        // else strictly equal == no further work required.
    // else add whole user to database

    return res.end();
});

let oneUser = {
    _id : "beasleydotcom",
    performances : 
        {
        "FbEventID":"270562201720589",
        "individualEventUrl":"https://www.facebook.com/events/270562201720589",
        "title":"Round 199: Beasley, Devon Dodgson, Noble Monyei, Devonnie Black, Paul Nunn",
        "image":"https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/c103.0.206.206a/p206x206/264500515_3028645400718572_7451861523995737653_n.png?_nc_cat=103&ccb=1-5&_nc_sid=b386c4&_nc_ohc=3Gwwe7LP-yEAX81VBeT&_nc_ht=scontent-sea1-1.xx&oh=00_AT9EJLWiFsIyO_PMZBfhPgkv3vxBcukk-9ciIDl4TdUo1w&oe=61E6B323",
        "dateTime":"Tuesday, December 14, 2021 at 7:30 PM PST",
        "urlsFromDescription":["www.beasleydotcom.com/","www.devondodgson.com/","dearlydepartedseattle.com/","www.instagram.com/devonnieblack/","www.instagram.com/creativityinacan/","www.abbeypresents.org","www.theround.org","http://www.fremontabbey.org/artsconnect","http://www.fremontabbey.org/rent","http://www.abbeypresents.org","www.abbeypresents.org/respect"],"venueName":"Fremont Abbey Arts Center","venueUrl":"https://www.facebook.com/FremontAbbey/",
    }
}

async function insertOneUser(username, performances){
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted");

        let oneUser = { _id: username, performances }

        console.log("went full jamba-juice");

        const db = client.db("pacificeventsdb");

        let collection = db.collection("users");

        return await collection.insertOne(oneUser);

    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}
async function getOneUser(username){
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted");


        console.log("went full jamba-juice");

        const db = client.db("pacificeventsdb");

        let collection = db.collection("users");

        // const beSilly = await collection.insertOne(oneUser);

        const oneUser = await collection.findOne({_id: username });

        console.log("EVERYTHING WENT SMOOTH(y)LY :^{p" + JSON.stringify(oneUser));
        return JSON.stringify(oneUser);
    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}

async function userExists( username ) {
    console.log("INSIDE OF USEREXISTS");
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("CHECKING IF USER EXISTS");

        const db = client.db("pacificeventsdb");
        let collection = db.collection("users");
        console.log("WANT full jamba-juice on " + username );

        let results = await collection.find({_id : username }).count();
        console.log("RESULTSSSSSSSSSSSSSSSSS: " + results);
        return results;

    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return false;
    }
    finally {
        await client.close();
    }
}

async function updateUser( username, arrayOfEventObjects, userInfo ){
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted ");

        const db = client.db("pacificeventsdb");
        let collection = db.collection("users");
        console.log("went full jamba-juice on " + username );

        // const beSilly = await collection.insertOne(oneUser);

        const oneUser =  await collection.findOne({_id: username });
        
        console.log("EVERYTHING WENT SMOOTH(y)LY :^{p")
        return oneUser;
    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}


app.listen(PORT, () => {
    console.log(`Glistening on PORT: ${PORT}`);
});