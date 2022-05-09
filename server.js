/*
* FILE          : server.js
* PROJECT       : Shopify 2022 Intern - Inventory Tracking Application
* AUTHOR        : Daniel Radjenovic
* FIRST VERSION : May 9, 2022
* DESCRIPTION   : Main express server file. Hosts the frontend, calls backend/app.js to run the API
*/

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000; // the port the API server runs on

// JSON-related Express middleware
app.use(express.json());
// hosting static frontend files
app.use(express.static('frontend'))
app.use(express.urlencoded({extended: true}));
app.use(cors());

const backend = require("./backend/app.js");
backend.setupAPIEndpoints(app);

// Starts up the API server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});