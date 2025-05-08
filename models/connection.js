const connectionString = process.env.CONNECTION_STRING;
const mongoose = require("mongoose");

mongoose
  .connect(connectionString, { connectTimeoutMs: 2000 })
  .then(console.log("Database connected"))
  .catch((error) => console.error(error));
