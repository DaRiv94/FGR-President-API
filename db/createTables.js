const azure = require("azure-storage");
const config = require('config');

module.exports = function() {
  //must have env vars
  //AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  // or
  //AZURE_STORAGE_CONNECTION_STRING
  var tableService = azure.createTableService();

  // //CREATE A TABLE IF NOT EXISTS
  // tableService.createTableIfNotExists(`presidents${config.get('tableEnd')}`, function(
  //   error,
  //   result,
  //   response
  // ) {
  //   if (!error) {
  //   }
  // });


  //CREATE A TABLE IF NOT EXISTS
  tableService.createTableIfNotExists(`presidentstest`, function(
    error,
    result,
    response
  ) {
    if (!error) {
    }
  });


};
