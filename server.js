const express = require('express');
const cors = require('cors');
const db = require("./models");
require('dotenv').config();
const { logger, } = require('./middlewares');

const app = express();

var corsOptions = {
  origin: '*'
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Use custom logging middleware
app.use(logger)

// Prepare DB
db.connection.sync();

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Login System', developer: { name: 'Muhammad Tayyab Sheikh', alias: 'cstayyab' } });
});

app.use("/api/v1", require("./routes/userRoutes"));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
