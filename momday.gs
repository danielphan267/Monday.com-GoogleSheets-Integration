const MONDAY_API_TOKEN = 'your_MONDAY_API_TOKEN';
const MONDAY_API_URL = 'https://api.monday.com/v2';
const BOARD_ID = your_BOARD_ID;

function MondayToSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MondayToSheet");;
  const query = `
    query {
      boards(ids: ${BOARD_ID}) {
        name
        items_page {
          items{
            name
            column_values{
              column{
                title
              }
              text
              value
            }
          }
        }
      }
    }`;

  // Fetch data from Monday.com
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: MONDAY_API_TOKEN
    },
    payload: JSON.stringify({ query }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(MONDAY_API_URL, options);
  const jsonData = JSON.parse(response.getContentText());
  
  // Clear existing data in the sheet
  sheet.clear();
  
  // Parse and write data to the sheet
  const board = jsonData.data.boards[0];
  const items = board.items_page.items;

  // Set headers
  const headers = ["Item Name"];
  if (items.length > 0 && items[0].column_values) {
    items[0].column_values.forEach(column => {
      headers.push(column.column.title);
    });
  }
  sheet.appendRow(headers);

  // Add rows
  items.forEach(item => {
    const row = [item.name];
    item.column_values.forEach(column => {
      row.push(column.text || ""); // Use empty string if no text
    });
    sheet.appendRow(row);
  });
}


function SheetToMonday() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SheetToMonday");
  const data = sheet.getDataRange().getValues();

  // Assuming first row is headers
  const headers = data[0];
  const rows = data.slice(1);

  var dateColumnIndex = findDateColumnIndex(sheet);
  if (dateColumnIndex === -1) {
    Logger.log("No date column found.");
    return;
  }

  const columnMappings = JSON.stringify(getColumnMappings());

  rows.forEach(row => {
    const itemName = row[0]; // First column is the item name
    const columnUpdates = headers.slice(1).reduce((acc, header, index) => {
      acc[header] = row[index + 1] || '';
      return acc;
    }, {});

    const columnParse = JSON.parse(JSON.stringify(columnUpdates))
    let isoDate = new Date(columnParse.Date);
    let formattedDate = isoDate.toISOString().split('T')[0]; // Extract the date in 'YYYY-MM-DD'
    columnParse["Date"] = formattedDate;
    const columnValuesString = JSON.stringify(columnParse);

    const result = {};
    for (const key in JSON.parse(columnMappings)) {
      if (JSON.parse(columnValuesString)[key] !== undefined) {
        result[JSON.parse(columnMappings)[key]] = JSON.parse(columnValuesString)[key];
      }
    }

    const columnValues = JSON.stringify(result).replace(/"/g, '\\"');
    const query = `
      mutation {
        create_item (
          board_id: ${BOARD_ID}, 
          item_name: "${itemName}", 
          column_values: "${columnValues}"
        ) {
          id
        }
      }
    `;
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: MONDAY_API_TOKEN
      },
      payload: JSON.stringify({ query }),
      muteHttpExceptions: true
    };
    
    try {
      const response = UrlFetchApp.fetch(MONDAY_API_URL, options);
      Logger.log(`Response: ${response.getContentText()}`);
    } catch (error) {
      Logger.log(`Error syncing row: ${row}. Details: ${error}`);
    }
  });
}

function getColumnMappings() {
  const query = `
    query {
      boards(ids: ${BOARD_ID}) {
        columns {
          id
          title
        }
      }
    }
  `;

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: MONDAY_API_TOKEN
    },
    payload: JSON.stringify({ query }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(MONDAY_API_URL, options);
    const jsonResponse = JSON.parse(response.getContentText());

    // Extract columns from the response
    const columns = jsonResponse.data.boards[0].columns;

    // Create a mapping of column titles (names) to IDs
    const columnMappings = columns.reduce((acc, column) => {
      acc[column.title] = column.id; // Map "Status" -> "status_mkm58py6"
      return acc;
    }, {});

    // Logger.log(`Column Mappings: ${JSON.stringify(columnMappings, null, 2)}`);
    return columnMappings;
  } catch (error) {
    Logger.log(`Error fetching column mappings: ${error}`);
    return null;
  }
}

function findDateColumnIndex(sheet) {
  var headers = sheet.getDataRange().getValues()[0];  // Get the header row
  var numColumns = headers.length;

  // Loop through the columns and check for the date type
  for (var i = 0; i < numColumns; i++) {
    var columnData = sheet.getRange(2, i + 1, sheet.getLastRow() - 1).getValues();  // Skip header row
    for (var j = 0; j < columnData.length; j++) {
      if (Object.prototype.toString.call(columnData[j][0]) === '[object Date]' && !isNaN(columnData[j][0])) {
        return i;  // Return the column index if a valid date is found
      }
    }
  }
  return -1;  // Return -1 if no date column is found
}
