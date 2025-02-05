# Monday.com-GoogleSheets-Integration

This Google Apps Script allows you to trigger the synchronization of data between Monday.com and Google Sheets. It consists of two functions:

**MondayToSheet**: Fetches data from a specified Monday.com board and writes it to a Google Sheet.

**SheetToMonday**: Reads data from a Google Sheet and pushes it back to Monday.com.

## Setup Instructions

1. **Prerequisites**

    - A Google Sheet with two sheets named MondayToSheet and SheetToMonday.

    - A Monday.com account with API access.

    - An API key from Monday.com.

2. **Configure Your Script**

    - Replace the following placeholders in the script with actual values:

    - MONDAY_API_TOKEN: Your Monday.com API token.

    - BOARD_ID: The ID of the Monday.com board you want to sync.

3. **Running the Script**

    - Open Google Sheets and navigate to Extensions > Apps Script.

    - Copy and paste the provided script into the script editor.

    - Save and authorize the script to access your spreadsheet and external APIs.

    - Run MondayToSheet to fetch Monday.com data and store it in Google Sheets, Run SheetToMonday to push data to Monday.com.

## Troubleshooting

Ensure that the BOARD_ID is correct and accessible with your API token.

Check that your sheet names match MondayToSheet and SheetToMonday exactly.

If date columns do not sync properly, verify the date format in your Google Sheet.

## Demo

![monday](https://github.com/user-attachments/assets/2e249c3d-82f8-4d49-9925-9268de444ec0)

