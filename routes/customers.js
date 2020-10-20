const { Customer, validationSchema } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const customer = await Customer.find().sort("name");
    res.send(customer);
  } catch (error) {
    console.log("error :", error.message);
  }
});

router.post("/", async (req, res) => {
  const { error } = validationSchema(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });

  try {
    await customer.save();

    res.send(customer);
  } catch (error) {
    console.log("error :>> ", error.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer)
      return res.status(404).send("Customer with the given ID was not found");

    res.send(customer);
  } catch (error) {
    console.log("error", error.message);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validationSchema(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );

    if (!customer)
      return res.status(404).send("Customer with the given ID was not found");

    res.send(customer);
  } catch (error) {
    console.log("error :>> ", error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer)
      return res.status(404).send("Customer with the given ID was not found");

    res.send(customer);
  } catch (error) {
    console.log("error :>> ", error.message);
  }
});

module.exports = router;
