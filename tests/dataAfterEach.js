const azure = require("azure-storage");
var tableService = azure.createTableService();

module.exports = function() {
    return new Promise((resolve,reject)=>{


      tableService.deleteTable('presidentstest', function(error, response){
        if(!error){
           resolve();
        }
        else{
          reject(error);
        }
    });

    });
};
