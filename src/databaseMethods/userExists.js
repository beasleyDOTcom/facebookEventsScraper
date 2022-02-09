'use strict';

async function userExists(client, username) {
    console.log("INSIDE OF USEREXISTS");
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("CHECKING IF USER EXISTS");

        const db = client.db("pacificeventsdb");
        let collection = db.collection("users");
        console.log("WANT full jamba-juice on " + username);

        let results = await collection.find({ _id: username }).count();
        return results;

    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return false;
    }
    finally {
        await client.close();
    }
}

module.exports = userExists;