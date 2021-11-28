const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env["MONGO_URI"];
const PORT = process.env.PORT || 3001;

// allows for json input from forms, like posting from react
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const { Schema, model } = mongoose;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const whitelist = ["http://localhost:3000"];
var corsOptions = {
  origin: whitelist,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, PUT, POST, DELETE",
};

app.use(cors(corsOptions));

// if servering static resources
// app.use(express.static("public"));

const billsSchema = new Schema({
  balance: Number,
  defaultPayment: Number,
  dayDue: Number,
  interest: Number,
  name: String,
});

const userSchema = new Schema({
  username: String,
  bills: [billsSchema],
});

const User = model("User", userSchema);

// add a new user
app.post("/api/new-user", (req, res) => {
  const newUser = new User({
    username: req.body.username,
  });
  newUser.save((err, data) => {
    if (err) return data.json({ error: err });
    res.json({
      status: 200,
      username: data.username,
      _id: data._id,
    });
  });
});

// add a new bill to bills list for specified user
app.put("/api/user/:id/add-bill", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) res.json({ error: err });
    user.bills.push(req.body);
    user.save((saveErr) => {
      if (saveErr) res.json({ error: saveErr });
      res.json({
        message: `Successfully updated ${user.username} with bill: ${req.body.name}`,
      });
    });
  });
});

// get list of bills for specified user
app.get("/api/user/:id/bills", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    res.json(user);
  });
});

// remove bill from bills list for specified user
app.delete("/api/user/:id/remove-bill", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) res.json({ error: err });
    user.bills = user.bills.filter(
      (bill) => bill._id.toString() !== req.body.id
    );
    user.save((saveErr) => {
      if (saveErr) res.json({ error: saveErr });
      res.json({
        message: `Successfully removed bill.`,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Routes working.",
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
