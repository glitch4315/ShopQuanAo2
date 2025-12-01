const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function db() {
  await client.connect();
  console.log("Kết nối MongoDB thành công");
  return client.db("qlquanao"); 
}

module.exports = db;
