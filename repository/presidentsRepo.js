const azure = require("azure-storage");
var tableService = azure.createTableService();
var entGen = azure.TableUtilities.entityGenerator;
const config = require("config");
const uuidv1 = require("uuid/v1");

//this are the functions in this file. they interact with the Azure Tables so that the president route file doesnt need to.
// addPresident
//  getPresidents
// deletePresidentByRowKey
// findPresidentByName
// getPresidentByRowKey
// updatePresident

function getPresidents() {
  return new Promise(function(resolve, reject) {
    var query = new azure.TableQuery();
    tableService.queryEntities(
      `presidents${config.get("tableEnd")}`,
      query,
      null,
      function(error, result, response) {
        if (!error) {
          resolve(response.body.value);
        } else {
          reject(error);
        }
      }
    );
  });
}

function findPresidentByName(name) {
  return new Promise(async (resolve, reject) => {
    var nameLower = name.toLowerCase();

    try {
      var presidents = await getPresidents();

      presidents.forEach(pres => {
        var presNameLower = pres.name;

        if (presNameLower.toLowerCase() === nameLower) {
          resolve(pres);
        }
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function getPresidentByRowKey(rowkey) {
  return new Promise(async (resolve, reject) => {
    try {
      var presidents = await getPresidents();

      presidents.forEach(pres => {
        if (pres.RowKey === rowkey) {
          resolve(pres);
        }
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function addPresident(name, party) {
  return new Promise(async function(resolve, reject) {
    //create new entity
    var newPresident = {
      PartitionKey: entGen.String("presidents"),
      RowKey: entGen.String(uuidv1()),
      name: entGen.String(name),
      party: entGen.String(party)
    };

    //insert it into table
    tableService.insertEntity(
      `presidents${config.get("tableEnd")}`,
      newPresident,
      { echoContent: true },
      function(error, result, response) {
        if (!error) {
          resolve(response.body);
        }
        reject(error);
      }
    );
  });
}

function updatePresident(name, party, rowkey) {
  return new Promise(async function(resolve, reject) {
    //create new entity
    var newPresident = {
      PartitionKey: entGen.String("presidents"),
      RowKey: entGen.String(rowkey),
      name: entGen.String(name),
      party: entGen.String(party)
    };

    //insert it into table
    tableService.replaceEntity(
      `presidents${config.get("tableEnd")}`,
      newPresident,
      { echoContent: true },
      function(error, result, response) {
        if (!error) {
          resolve(response.isSuccessful);
        }
        reject(error);
      }
    );
  });
}

function deletePresidentByRowKey(rowkey) {
  return new Promise(async function(resolve, reject) {
    //make delete president task
    var deletePresidentTask = {
      PartitionKey: { _: "presidents" },
      RowKey: { _: rowkey }
    };

    tableService.deleteEntity(
      `presidents${config.get("tableEnd")}`,
      deletePresidentTask,
      { echoContent: true },
      function(error, result, response) {
        if (!error) {
          resolve(result.isSuccessful);
        }
        reject(error);
      }
    );
  });
}

exports.addPresident = addPresident;
exports.getPresidents = getPresidents;
exports.deletePresidentByRowKey = deletePresidentByRowKey;
exports.findPresidentByName = findPresidentByName;
exports.getPresidentByRowKey = getPresidentByRowKey;
exports.updatePresident = updatePresident;
