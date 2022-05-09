/*
* FILE          : app.js
* PROJECT       : Shopify 2022 Intern - Inventory Tracking Application (backend)
* AUTHOR        : Daniel Radjenovic
* FIRST VERSION : Jan 5, 2022
* DESCRIPTION   : Creates a SQLite database and table. Handles API/backend endpoints using Express.
*                 The API server has 3 endpoints ('/', '/inventory', '/export').
*                 Handles CRUD through POST, GET, PUT, and DELETE HTTP methods on the /inventory endpoint.
*/

module.exports = {setupAPIEndpoints}
const sqlite3 = require('sqlite3').verbose();
const { Parser } = require('json2csv');

// open the database
let db = new sqlite3.Database('inventory.db');

// create the table if it doesn't already exist
db.exec("CREATE TABLE IF NOT EXISTS `items` (" +
  "  `name` varchar(255) NOT NULL," +
  "  `cost` decimal(10,2) NOT NULL," +
  "  `quantity` int(11) NOT NULL,"+
  "  `deleted` int(1) DEFAULT 0 NOT NULL,"+
  "  `deletedReason` varchar(255) NULL"+
  ")");

function setupAPIEndpoints(app) {
  // GET '/' Endpoint
  // Returns basic information regarding the application/API. Not strictly required.
  app.get('/api', (req, res) => {
    res.json({"app": "Inventory Tracking Application", "version": 1.0, "endpoints": ["/inventory"]})
  })


  // GET '/inventory' Endpoint
  // Returns inventory items as a JSON string
  // The "READ" part of CRUD
  app.get('/api/inventory', (req, res) => {
    db.all("SELECT rowid AS id, name, cost, quantity, deleted, deletedReason FROM items;", [], (err, rows) => {
      if (err) {
        res.status(500).json({"error": "unable to retrieve data"})
      } else {
        res.json(rows);
      }
    })
  })


  // POST '/inventory' Endpoint
  // Adds new items to the inventory table. Returns the inserted ID#.
  // The "CREATE" part of CRUD
  app.post('/api/inventory', (req, res) => {
    try {
      let jReq = req.body;

      // ensure all required JSON fields are present before executing the SQL statement
      if (jReq.hasOwnProperty("name") && jReq.hasOwnProperty("cost") && jReq.hasOwnProperty("quantity")) {
        // ensure Name, Cost, and Quantity are all valid
        if (jReq.name == null || jReq.name.length === 0)
          res.json({"error": "invalid item name"})
        else if (jReq.cost == null || jReq.cost === "")
          res.json({"error": "invalid item cost"})
        else if (jReq.quantity == null || jReq.quantity === "")
          res.json({"error": "invalid item quantity"})
        else
          db.run(`INSERT INTO items(name, cost, quantity) VALUES (?, ?, ?)`, [jReq.name, jReq.cost, jReq.quantity], (err) => {
            if (err) {
              res.status(500).json({"error": "unable to insert item"})
            } else {
              res.json({"success": true, "id": this.lastID})
            }
          })
      } else {
        res.status(400).json({"error": "missing required data"})
      }
    } catch {
      res.status(400).json({"error": "unable to process request"})
    }
  })


  // PUT '/inventory' Endpoint
  // Updates existing inventory items in the table
  // Un-deletes the item if it was deleted
  // The "UPDATE" part of CRUD
  app.put('/api/inventory', (req, res) => {
    try {
      let jReq = req.body;

      // ensure all required JSON fields are present before executing the SQL statement
      if (jReq.hasOwnProperty("id") && jReq.hasOwnProperty("name") && jReq.hasOwnProperty("cost") && jReq.hasOwnProperty("quantity")) {
        // ensure ID, Name, Cost, and Quantity are all valid
        if (isNaN(parseInt(jReq.id)) || parseInt(jReq.id) <= 0)
          res.json({"error": "invalid item id"})
        else if (jReq.name == null || jReq.name.length === 0)
          res.json({"error": "invalid item name"})
        else if (jReq.cost == null || jReq.cost === "")
          res.json({"error": "invalid item cost"})
        else if (jReq.quantity == null || jReq.quantity === "")
          res.json({"error": "invalid item quantity"})
        else
          db.run(`UPDATE items SET name = ?, cost = ?, quantity = ?, deleted = 0, deletedReason = NULL WHERE rowid = ?;`, [jReq.name, jReq.cost, jReq.quantity, jReq.id], (err) => {
            if (err) {
              res.json({"error": "unable to update item"})
            } else {
              res.json({"success": true})
            }
          })
      } else {
        res.status(400).json({"error": "missing required data"})
      }
    } catch {
      res.status(400).json({"error": "unable to process request. was the data sent as JSON?"})
    }
  })


  // DELETE '/inventory' Endpoint
  // Deletes an existing inventory item from the table
  // The "DELETE" part of CRUD
  app.delete('/api/inventory', (req, res) => {
    try {
      let jReq = req.body;

      // ensure ID field is present in the JSON
      if (jReq.hasOwnProperty("id") && jReq.hasOwnProperty("reason")) {
        // ensure ID field is valid
        if (isNaN(parseInt(jReq.id)) || parseInt(jReq.id) <= 0)
          res.json({"error": "invalid item id"})
        else
          db.run(`UPDATE items SET deleted = 1, deletedReason = ? WHERE rowid = ?;`, [jReq.reason, jReq.id], (err) => {
            if (err) {
              res.json({"error": "unable to delete item"})
            } else {
              if (this.changes === 0) {
                res.status(400).json({"error": "Item to delete was not found"})
              } else {
                res.json({"success": true})
              }
            }
          })
      } else {
        res.status(400).json({"error": "missing item ID or deletion reason"})
      }
    } catch (e) {
      res.status(400).json({"error": "unable to process request. was the data sent as JSON?"})
    }
  })

  // GET '/export' Endpoint
  // Exports inventory data as a CSV
  app.get('/api/export', (req, res) => {
    db.all(`SELECT rowid AS id, name, cost, quantity FROM items;`, [], (err, rows) => {
      if (err) {
        res.json({"error": "unable to export data"})
      } else {
        try {
          const parser = new Parser({
            fields: [{
              label: 'Item ID',
              value: 'id'
            }, {
              label: 'Item Name',
              value: 'name'
            }, {
              label: 'Item Cost',
              value: 'cost'
            }, {
              label: 'Item Quantity',
              value: 'quantity'
            }]
          })
          const csv = parser.parse(rows);
          res.send(csv);
        } catch (err) {
          res.status(500).json({"error": "Server is unable to export CSV"})
        }
      }
    })
  })
}