const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const presidentRoutes =require('./routes/presidents');
const config = require('config');
const app = express();

app.use(cors()); //this is to allow browsers to access this api publicly
app.use(express.static(".")); //this is to render the static index.html page at the root


// parse application/json
app.use(bodyParser.json());

require("./db/createTables")();//Creates Database if not already created!


app.get("/", (req, res) => {
  res.sendFile(__dirname+"/index.html");
});

app.use("/api/presidents", presidentRoutes);





const port = process.env.PORT || 4000;
const server = app.listen(port, err => {
  if (err) return console.log(err);
  console.log(`running on port ${port}...`);
  console.log(`Environment:  ${process.env.NODE_ENV}...`);
  console.log(`Using table presidents${config.get('tableEnd')}`);
});

module.exports = server;
