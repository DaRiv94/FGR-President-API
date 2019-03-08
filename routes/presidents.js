const express = require("express");
const Joi = require("joi");

//bring in my repository routes
var {
  addPresident,
  getPresidents,
  deletePresidentByRowKey,
  findPresidentByName,
  getPresidentByRowKey,
  updatePresident
} = require("../repository/presidentsRepo");

const router = express.Router();

router.get("/", async (req, res) => {
  const response = await getPresidents();

  res.send(response);
});

router.post("/", async (req, res) => {
  //validate the reqest body to make sure its valid, sendback 400 bad request if it isnt
  const { error } = validatePresident(req.body); //deconstructed from result.error //this is for when we were not using the database
  if (error) return res.status(400).send(error.details[0].message);

  try {
    var president = await findPresidentByName(req.body.name);
    if (president)
      return res.status(400).send("President with that name already exists.");

    const response = await addPresident(req.body.name, req.body.party);

    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

router.get("/:rowkey", async (req, res) => {
  try {
    const response = await getPresidentByRowKey(req.params.rowkey);
    if (!response)
      return res.status(400).send("No President was found with that RowKey");

    res.send(response);
  } catch (err) {
    res.send(err);
  }
});

router.put("/:rowkey", async (req, res) => {
  //validate the reqest body to make sure its valid, sendback 400 bad request if it isnt
  const { error } = validatePresident(req.body); //deconstructed from result.error //this is for when we were not using the database
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const president = await getPresidentByRowKey(req.params.rowkey);
    if (!president)
      return res.status(400).send("No President was found with that RowKey");

    var pastpresident = await findPresidentByName(req.body.name);
    if (pastpresident)
      return res.status(400).send("President with that name already exists.");

    if (president.name === "Abraham Lincoln")
      return res
        .status(403)
        .send(
          "Sorry, Abraham Lincoln is permanently in this azure table for demonstration purposes. He can not be Edited "
        );
    if (president.name === "Ronald Reagan")
      return res
        .status(403)
        .send(
          "Sorry, Ronald Reagan is permanently in this azure table for demonstration purposes. He can not be Edited "
        );

    const result = await updatePresident(
      req.body.name,
      req.body.party,
      req.params.rowkey
    );
    if (!result)
      return res.status(500).send("Something went wrong in updating process.");

    const updatedPresident = await getPresidentByRowKey(req.params.rowkey);

    res.send(updatedPresident);
  } catch (err) {
    res.send("Error: ", err);
  }
});

router.delete("/:rowkey", async (req, res) => {
  try {
    const president = await getPresidentByRowKey(req.params.rowkey);
    if (!president)
      return res.status(400).send("No President was found with that RowKey");

    if (president.name === "Abraham Lincoln")
      return res
        .status(403)
        .send(
          "Sorry, Abraham Lincoln is permanently in this azure table for demonstration purposes. He can not be deleted "
        );
    if (president.name === "Ronald Reagan")
      return res
        .status(403)
        .send(
          "Sorry, Ronald Reagan is permanently in this azure table for demonstration purposes. He can not be deleted "
        );

    const deletedPres = await deletePresidentByRowKey(req.params.rowkey);
    if (!deletedPres)
      return res.status(500).send("Something went wrong in delting process.");

    res.send(president);
  } catch (err) {
    res.send(err);
  }
});

function validatePresident(president) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    party: Joi.string()
      .min(5)
      .max(50)
      .required()
  };
  return Joi.validate(president, schema);
}

module.exports = router;
