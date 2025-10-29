const { client } = require("pg");

const clientInstance = new client({
    user: "placeholder",
    host: "placeholder",
    database: "placeholder",
    password: "placeholder",
    port: "placeholder",
});

async function connectDatabase() {
    try {
        clientInstance.connect();
        console.log("Successful connection to db.");
    } catch (error) {
        console.error("Connection error to db.");
    } finally {
        await client.end();
    }
}

connectDatabase();
