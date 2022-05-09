# Inventory Tracking Web Application

Frontend + Backend of an inventory/item tracking system.

# Main Page (Frontend)
![image](https://user-images.githubusercontent.com/50718889/167464062-2b2302ae-6634-4a51-829b-b2f2410bd35c.png)

# Features
- Backend:
  - Persistent storage using SQLite
  - JSON-based API with input validation
  - 3 Endpoints and multiple HTTP methods for CRUD support
  - CSV export system with utilizing the json2csv package
  - Hosts the static frontend files
- Frontend:
  - Full item listing
  - Edit and Delete options for each Item - with user confirmation
  - Specify reason for deleting an item
  - View deleted items, un-delete items
  - Add New Items
  - Special Feature: Export Data & Download CSV
  - Modern design with Bootstrap
  - Use of Sweetalert2 for user input
  - Fully AJAX based
  - Dark theme inspired by GitHub

# Installation Instructions

### 0) Ensure Node.JS and NPM (node package manager) are installed on the system
### 1) Download/clone this repository & extract if needed
### 2) Using a command line, install dependencies in the / folder:
`npm install`

### 3) Launch the node.js server
Type `node server.js` in the command line.

The SQLite database file is automatically created.

By default, the application starts listening on localhost:3000. If the host changes, the `API_HOST` constant in `frontend/js/script.js` should be updated. 

### 4) Open localhost:3000 in a web browser

The server hosts both the backend and frontend files.