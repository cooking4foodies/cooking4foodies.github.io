/**
 * Cooking 4 Foodies - order + UPI payment intake
 *
 * WHAT THIS DOES
 *   1. Writes every order to the Google Sheet (one row per order)
 *   2. Emails you immediately with the order + payment details
 *
 * HOW TO INSTALL
 *   1. Open your Google Sheet
 *   2. Extensions -> Apps Script
 *   3. Delete whatever is there, paste this whole file in
 *   4. Change NOTIFY_EMAIL below if you want it sent somewhere else
 *   5. Deploy -> Manage deployments -> edit (pencil) -> Version: "New version"
 *      -> Deploy.   (Keep the SAME deployment so your existing URL still works.)
 *
 * IMPORTANT
 *   Orders arrive either as "UPI (Prepaid)" or "Cash on Delivery".
 *   For UPI the status is "Pending Verification" - the website CANNOT confirm
 *   a UPI payment by itself, so check the reference against your bank/UPI app
 *   and then set the Payment Status column yourself.
 *   For COD the status is "To Collect on Delivery" - no money has been paid.
 */

var NOTIFY_EMAIL = 'sonali.debnath4u@gmail.com';

var HEADERS = [
  'Timestamp',
  'Order ID',
  'Name',
  'Contact',
  'Email',
  'Address',
  'Items',
  'Total Amount',
  'Payment Method',
  'UPI Reference',
  'Paid To',
  'Payment Status'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, on a brand new sheet
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.orderedAt || new Date(),
      data.orderId || '',
      data.name || '',
      data.contact || '',
      data.email || '',
      data.address || '',
      data.items || '',
      data.totalAmount || '',
      data.paymentMethod || '',
      data.upiReference || '',
      data.paidTo || '',
      data.paymentStatus || ''
    ]);

    sendNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Still try to tell you something went wrong
    try {
      MailApp.sendEmail(NOTIFY_EMAIL,
        'Cooking 4 Foodies - ORDER ERROR',
        'An order came in but could not be saved.\n\nError: ' + err.message +
        '\n\nRaw data:\n' + (e && e.postData ? e.postData.contents : '(none)'));
    } catch (ignored) {}

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendNotification(data) {
  var isCod = (data.paymentMethod || '').indexOf('Cash') !== -1;
  var subject = (isCod ? '[COD] ' : '[PREPAID] ') +
    'New Order ' + (data.orderId || '') + ' - ' + (data.totalAmount || '');

  var body =
    'NEW ORDER RECEIVED\n' +
    '===================================\n\n' +
    'Order ID   : ' + (data.orderId || '') + '\n' +
    'Placed at  : ' + (data.orderedAt || '') + '\n\n' +
    'CUSTOMER\n' +
    '-----------------------------------\n' +
    'Name       : ' + (data.name || '') + '\n' +
    'Phone      : ' + (data.contact || '') + '\n' +
    'Email      : ' + (data.email || '') + '\n' +
    'Address    : ' + (data.address || '') + '\n\n' +
    'ORDER\n' +
    '-----------------------------------\n' +
    (data.items || '') + '\n\n' +
    'TOTAL      : ' + (data.totalAmount || '') + '\n\n' +
    'PAYMENT\n' +
    '-----------------------------------\n' +
    'Method     : ' + (data.paymentMethod || '') + '\n' +
    'Status     : ' + (data.paymentStatus || '') + '\n' +
    (isCod ? '' :
      'UPI Ref    : ' + (data.upiReference || '') + '\n' +
      'Paid to    : ' + (data.paidTo || '') + '\n') +
    '\n' +
    '>> ACTION NEEDED <<\n' +
    (isCod
      ? 'This is a CASH ON DELIVERY order. Nothing has been paid yet.\n' +
        'Collect ' + (data.totalAmount || '') + ' in cash at delivery, then update the\n' +
        'Payment Status column in the sheet to "Collected".\n'
      : 'The customer entered this UPI reference themselves. Please open your\n' +
        'UPI/bank app and confirm that ' + (data.totalAmount || '') + ' actually arrived with\n' +
        'reference ' + (data.upiReference || '') + ' before you start cooking.\n' +
        'Then update the Payment Status column in the sheet to "Verified".\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
