const azure = require("azure-storage");
var tableService = azure.createTableService();
var entGen = azure.TableUtilities.entityGenerator;

module.exports = function() {
  return new Promise((resolve, reject) => {
    //CREATE A TABLE IF NOT EXISTS
    tableService.createTableIfNotExists("presidentstest", function(
      error,
      result,
      response
    ) {
      if (!error) {
        ////////////////

        //create new entity
        var newPresident1 = {
          PartitionKey: entGen.String("presidents"),
          RowKey: entGen.String("1"),
          name: entGen.String("John Adams"),
          party: entGen.String("Whig")
        };

        //create new entity
        var newPresident2 = {
          PartitionKey: entGen.String("presidents"),
          RowKey: entGen.String("2"),
          name: entGen.String("Thomas Jefferson"),
          party: entGen.String("Federalist")
        };

        var batch = new azure.TableBatch();

        batch.insertEntity(newPresident1, { echoContent: true });
        batch.insertEntity(newPresident2, { echoContent: true });

        tableService.executeBatch("presidentstest", batch, function(
          error,
          result,
          response
        ) {
          if (!error) {
            resolve();
          } else {
            reject(error);
          }
        });


        //////////////
      }
    });
  });
};
