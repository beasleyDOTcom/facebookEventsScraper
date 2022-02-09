'use strict';

async function updateUser(client, username, arrayOfEventObjects) {
    try {
        await client.connect().catch(reason => console.log("this was the reason: " + reason));
        console.log("dbco necked Ted ");

        const db = client.db("pacificeventsdb");
        let collection = db.collection("users");
        console.log("went full jamba-juice on " + username);

        const oneUser = await collection.findOneAndUpdate(
            { _id: username },
            { $push: { performances: { $each: arrayOfEventObjects } } },
            { returnNewDocument: true });

        console.log("EVERYTHING WENT SMOOTH(y)LY with user: " + username + " this was added: " + Object.keys(oneUser));
        return oneUser;
    } catch (err) {
        console.log('a ROAR produced: ' + err);
        return err;
    }
    finally {
        await client.close();
    }
}

module.exports = updateUser;