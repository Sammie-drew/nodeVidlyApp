const mongoose = require("mongoose");
const Joi = require("joi");

const validationSchema = (customer) => {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    isGold: Joi.boolean().required(),
    phone: Joi.string().min(3).required(),
  };

  return Joi.validate(customer, schema);
};

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
});

const Customer = new mongoose.model("Customer", customerSchema);

exports.Customer = Customer;
exports.validationSchema = validationSchema;
