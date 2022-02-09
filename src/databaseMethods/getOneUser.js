'use strict';

async function getOneUser(client, username) {
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted in getOneUser");


        const db = client.db("pacificeventsdb");

        let collection = db.collection("users");

        const oneUser = await collection.findOne({ _id: username });

        console.log("EVERYTHING WENT SMOOTH(y)LY :^{p in getOneUser");
        return JSON.stringify(oneUser);
    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}

module.exports = getOneUser;