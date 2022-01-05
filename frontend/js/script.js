

// stores the latest inventory data, refreshed by loadInventory();
var INVENTORY_DATA = {};

/* Load the inventory by making an AJAX GET call to the "/inventory" endpoint and populating the HTML */
function loadInventory() {
  $.ajax("http://localhost:3000/inventory", {
    type: "GET",
    dataType: "json",
    cache: false,
    json: true,
  }).done( function (data) {
    // clear the existing items HTML
    $("#tableBody").html("");

    // reset the latest data
    INVENTORY_DATA = {};

    // get all the file options from the server and add them to the list
    for(let itemKey in data) {
      let item = data[itemKey];
      INVENTORY_DATA[item.id] = item;

      // Append each item to the table, along with the action buttons which have onClick event handlers
      $("#tableBody").append("<tr><th scope='row'>"+item.id+"</th><td>"+
        item.name+"</td><td>$"+parseFloat(item.cost).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})+
        "</td><td>"+item.quantity.toLocaleString()+"</td>"+"<td>\n" +
        "<button type=\"button\" onClick='editItem(`"+item.id+"`)' class=\"btn btn-success\"><i class=\"fas fa-edit\"></i></button>&nbsp;" +
        "<button type=\"button\" onClick='deleteItem(`"+item.id+"`)' class=\"btn btn-danger\"><i class=\"far fa-trash-alt\"></i></button>" +
        "</td>"+"</tr>");
    }

  });
}

/* Edit an item by making an AJAX PUT call to the /inventory endpoint with the updated details (and item ID) */
function editItem(itemId) {
  Swal.fire({
    title: "Edit Item",
    text: "Make your desired changes, then press Save",
    html:
      '<input id="swalItemName" class="swal2-input" placeholder="Item Name" value="'+INVENTORY_DATA[itemId].name+'">' +
      '<input id="swalItemCost" type="number" class="swal2-input" placeholder="Cost" value="'+INVENTORY_DATA[itemId].cost+'">' +
      '<input id="swalItemQuantity" type="number" class="swal2-input" placeholder="Quantity in Stock" value="'+INVENTORY_DATA[itemId].quantity+'">',
    focusConfirm: false,
    preConfirm: () => {
      return {
        itemName: document.getElementById('swalItemName').value,
        itemCost: document.getElementById('swalItemCost').value,
        itemQuantity: document.getElementById('swalItemQuantity').value
      }
    },
    showCancelButton: true,
    confirmButtonText: 'Add',
    showLoaderOnConfirm: true,
  }).then((result) => {
    if(!result.isConfirmed)
      return;
    if(result.value !== undefined && result.value.hasOwnProperty("itemName") &&
      result.value.itemName.length > 0 && !isNaN(parseFloat(result.value.itemCost)) && !isNaN(parseInt(result.value.itemQuantity))) {
      $.ajax("http://localhost:3000/inventory", {
        type: "PUT",
        data: JSON.stringify({
          id: itemId,
          name: result.value.itemName,
          cost: parseFloat(result.value.itemCost),
          quantity: parseInt(result.value.itemQuantity)
        }),
        contentType: "application/json",
      }).done( function (data) {
        if(data.hasOwnProperty("success") && data.success === true)
          Swal.fire({
            title: "Item Edited!",
            text: "Item #"+itemId+" has been successfully edited",
            icon: "success",
          });

        // update the list of items
        loadInventory();
      });
    } else {
      Swal.fire({
        title: "Invalid Data Entered!",
        text: "You did not enter the required data to add a new item!",
        icon: "error",
      });
    }
  });
}

/* Delete an item from inventory by making an AJAX DELETE call to the /inventory endpoint with the item ID */
function deleteItem(itemId) {
  Swal.fire({
    title: 'Delete Item',
    text: 'Are you sure you want to delete item #'+itemId+'?',
    showCancelButton: true,
    confirmButtonText: 'Delete',
  }).then((result) => {
    if(result.isConfirmed) {
      $.ajax("http://localhost:3000/inventory", {
        type: "DELETE",
        data: JSON.stringify({
          id: itemId,
        }),
        contentType: "application/json",
      }).done( function (data) {
        if(data.hasOwnProperty("success") && data.success === true)
          Swal.fire({
            title: "Item Deleted!",
            text: "Item #"+itemId+" has been successfully deleted",
            icon: "success",
          });

        // update the list of items
        loadInventory();
      });
    }
  });
}

/** Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
function downloadBlob(content, filename, contentType) {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);

  // Create a link to download it
  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
}


/*
 * FUNCTION     :  ready
 * DESCRIPTION  :  This function is called when the pages loads. It defines the functionality for the
 *                 Add Item button and Export Data button upon click.
 * PARAMETERS   :  A function which performs several operations on document ready, including calling loadInventory().
 * RETURNS      :  void
 */
$(document).ready(function() {
  // first thing - load the inventory
  loadInventory();

  // new item button functionality
  $("#newItemBtn").click(function() {
    Swal.fire({
      title: 'Add New Item',
      html:
        '<input id="swalItemName" class="swal2-input" placeholder="Item Name">' +
        '<input id="swalItemCost" type="number" class="swal2-input" placeholder="Cost">' +
        '<input id="swalItemQuantity" type="number" class="swal2-input" placeholder="Quantity in Stock">',
      focusConfirm: false,
      preConfirm: () => {
        return {
          itemName: document.getElementById('swalItemName').value,
          itemCost: document.getElementById('swalItemCost').value,
          itemQuantity: document.getElementById('swalItemQuantity').value
        }
      },
      showCancelButton: true,
      confirmButtonText: 'Add',
      showLoaderOnConfirm: true,
    }).then((result) => {
      if(result.isDismissed === true)
        return;

      if(result.value === undefined || !result.value.hasOwnProperty("itemName") || result.value.itemName.length === 0) {
        Swal.fire({
          title: "Invalid Data Entered!",
          text: "You did not enter the required data to add a new item!",
          icon: "error",
        });
        return;
      }
      $.ajax("http://localhost:3000/inventory", {
        data: JSON.stringify({
          name: result.value.itemName,
          cost: parseFloat(result.value.itemCost),
          quantity: parseInt(result.value.itemQuantity)
        }),
        contentType: "application/json",
        type: "POST"
      }).done(function() {
        // if the HTTP request was successful, process the reaction here
        Swal.fire({
          title: "Item Created!",
          text: "Your item has been successfully created",
          icon: "success",
        });

        // update the list of items
        loadInventory();
      }).fail(function(dat) {
        // If the HTTP request failed, process the reaction here
        let errMsg = "Your item could not be saved to the server";
        if(dat.responseJSON.hasOwnProperty("error")) {
          errMsg = dat.responseJSON.error;
        }
        Swal.fire({
          title: "Error creating item!",
          text: errMsg,
          icon: "error",
        });
      })
    })
  });

  /* Handles the "Export Data (CSV)" button by making a call to /export and letting the browser download it */
  $("#export").click(function() {
    $.ajax("http://localhost:3000/export", {
      type: "GET",
      cache: false,
    }).done( function (data) {
      downloadBlob(data, 'export.csv', 'text/csv;charset=utf-8;')
    }).fail(function(dat) {
      // If the HTTP request failed, process the reaction here
      let errMsg = "The CSV could not be exported!";
      if(dat.responseJSON.hasOwnProperty("error")) {
        errMsg = dat.responseJSON.error;
      }

      Swal.fire({
        title: "Error Exporting CSV!",
        text: errMsg,
        icon: "error",
      });
    });
  });
});