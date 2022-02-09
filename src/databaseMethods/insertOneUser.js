'use strict';

async function insertOneUser(client, username, performances) {
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted in insertOneUser");

        let oneUser = { _id: username, performances }

        const db = client.db("pacificeventsdb");

        let collection = db.collection("users");

        let results = await collection.insertOne(oneUser);
        console.log("went well in insertOneUser");
        return results;

    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}
module.exports = insertOneUser;