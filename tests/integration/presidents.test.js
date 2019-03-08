const azure = require("azure-storage");
const request = require("supertest");
const {
  addPresident,
  getPresidentByRowKey
} = require("../../repository/presidentsRepo");

//this are repositoy functions that could be used with the test azure table
// addPresident
// getPresidents
// deletePresidentByRowKey
// findPresidentByName
// getPresidentByRowKey
// updatePresident

let server;

describe("/api/presidents", () => {
  beforeEach(async () => {
    server = require("../../index");
    await require("../dataBeforeEach")(); //execute code from this file;
  });

  afterEach(async () => {
    await server.close();
    await require("../dataAfterEach")(); //execute code from this file;
  });

  describe("Test If Environment variables are setup.", () => {
    it("should return true if the database succesfully is created", () => {
      var tableService = azure.createTableService();
      //CREATE A TABLE IF NOT EXISTS
      tableService.createTableIfNotExists("presidentstest", function(
        error,
        result,
        response
      ) {
        if (!error) {
          expect(result.isSuccessful).toEqual(true);
        }
      });
    });
  });

  describe("GET /", () => {
    it("should return status 200 if president is retreived", async () => {
      const res = await request(server).get("/api/presidents");

      expect(res.statusCode).toBe(200);
    });

    it("should return array length 2", async done => {
      const res = await request(server).get("/api/presidents");

      expect(res.body.length).toBe(2);

      done();
    });
  });

  describe("POST /", () => {
    let name;
    let party;

    const exec = async () => {
      return await request(server)
        .post("/api/presidents")
        .send({ name, party });
    };

    beforeEach(async () => {
      name = "Ronald Reagan";
      party = "Republican";
    });

    //Seems Like this test works even if the name is valid??
    it("should return 400 if the president exists already", async () => {
      const res = await request(server)
        .post("/api/presidents")
        .send({ name: "John Adams", party: "Whig" });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 bad request if the name is missing.", async () => {
      name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the party is missing.", async () => {
      party = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is a number.", async () => {
      name = 6;

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is an array of numbers.", async () => {
      name = [3, 4, 5];

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is less then 5 chars", async () => {
      name = "bo";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is more then 50 chars", async () => {
      name = `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 bad request if there is an exra property", async () => {
      var president = {
        name: "Ronald Reagan",
        party: "Republican",
        favColor: "blue"
      };

      const res = await request(server)
        .post("/api/presidents")
        .send(president);

      expect(res.statusCode).toBe(400);
    });

    it("should return status 200 if president is successfuly created", async () => {
      var president = {
        name: "Harry Truman",
        party: "Democrat"
      };

      const res = await request(server)
        .post("/api/presidents")
        .send(president);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("party");
      expect(res.body).toHaveProperty("RowKey");
      expect(res.body).toHaveProperty("PartitionKey");
    });
  });

  describe("GET /:RowKey", () => {
    //let name;
    //let party;
    let RowKey;

    const exec = async () => {
      return await request(server).get("/api/presidents/" + RowKey);
    };

    beforeEach(async () => {
      const president = await addPresident("John F Kennedy", "Democrat");
      RowKey = president.RowKey;
      //(name = "Andrew Jackson"), (party = "Democrat");
    });

    //Seems Like this test works even if the name is valid??
    it("should return 200 if the there is a president with the RowKey", async () => {
      const res = await exec();

      expect(res.statusCode).toBe(200);
    });

    it("should return 400 bad request if the RowKey is Invalid.", async () => {
      RowKey = "123456789";

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /:RowKey", () => {
    let RowKey;

    const exec = async () => {
      return await request(server).delete("/api/presidents/" + RowKey);
    };

    beforeEach(async () => {
      const president = await addPresident("John F Kennedy", "Democrat");
      RowKey = president.RowKey;
    });

    
    it("should return 200 if President was properly deleted", async () => {
      let oldPresident = await getPresidentByRowKey(RowKey);

      const res = await exec();

      let newPresident = await getPresidentByRowKey(RowKey);

      expect(res.status).toBe(200);
      expect(oldPresident.name).toBe("John F Kennedy");
      expect(newPresident).toBe(undefined);

    });

    it("should return 400 bad request if the RowKey is Invalid.", async () => {
      RowKey = "123456789";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 Not found if the RowKey is missing.", async () => {
      RowKey = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });


    it("should return 403 Forbidden if the RowKey is for Abraham lincoln.", async () => {
      const Mypresident = await addPresident("Abraham Lincoln", "Republican");
      RowKey = Mypresident.RowKey;

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 403 Forbidden if the RowKey is for Ronald Reagan.", async () => {
      const Mypresident = await addPresident("Ronald Reagan", "Republican");
      RowKey = Mypresident.RowKey;

      const res = await exec();

      expect(res.status).toBe(403);
    });


  });



  describe("PUT /:RowKey", () => {
    let name;
    let party;
    let RowKey;

    const exec = async () => {
      return await request(server)
        .put("/api/presidents/" + RowKey)
        .send({ name, party });
    };

    beforeEach(async () => {
      const president = await addPresident("George W Bush", "Republican");
      RowKey = president.RowKey;
      name = "John F Kennedy";
      party = "Democrat";
    });

    //Seems Like this test works even if the name is valid??
    it("should return 200 and true if old president name and party of different from the other", async () => {
      let oldPresident = await getPresidentByRowKey(RowKey);

      const res = await exec();

      let newPresident = await getPresidentByRowKey(RowKey);

      expect(res.statusCode).toBe(200);
      expect(oldPresident.name).toBe("George W Bush");
      expect(oldPresident.party).toBe("Republican");
      expect(newPresident.name).toBe("John F Kennedy");
      expect(newPresident.party).toBe("Democrat");
    });

    it("should return 400 bad request if the RowKey is Invalid.", async () => {
      RowKey = "123456789";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 Notfound if the RowKey is missing.", async () => {
      RowKey = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 403 Forbidden if the RowKey is for Abraham lincoln.", async () => {
      const Mypresident = await addPresident("Abraham Lincoln", "Republican");
      RowKey = Mypresident.RowKey;

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 403 Forbidden if the RowKey is for Ronald Reagan.", async () => {
      const Mypresident = await addPresident("Ronald Reagan", "Republican");
      RowKey = Mypresident.RowKey;

      const res = await exec();

      expect(res.status).toBe(403);
    });

    //Seems Like this test works even if the name is valid??
    it("should return 400 if the president with same name exists already", async () => {
      const res = await request(server)
        .put("/api/presidents/" + RowKey)
        .send({ name: "John Adams", party: "Whig" });

      expect(res.statusCode).toBe(400);
    });

    it("should return 400 bad request if the name is missing.", async () => {
      name = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the party is missing.", async () => {
      party = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is a number.", async () => {
      name = 6;

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is an array of numbers.", async () => {
      name = [3, 4, 5];

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is less then 5 chars", async () => {
      name = "bo";

      const res = await exec();

      expect(res.status).toBe(400);
    });
    it("should return 400 bad request if the name is more then 50 chars", async () => {
      name = `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 bad request if there is an exra property", async () => {
      var president = {
        name: "Richard Nixon",
        party: "Republican",
        favColor: "blue"
      };

      const res = await request(server)
        .put("/api/presidents/" + RowKey)
        .send(president);

      expect(res.statusCode).toBe(400);
    });
  });
});
