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

app.put("/api/user/:id/add-bill", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) res.json({ error: err });
    user.bills.push(req.body);
    user.save((saveErr, data) => {
      if (saveErr) res.json({ error: saveErr });
      console.log("data", data);
      res.json({
        message: `Successfully updated ${user.username} with bill: ${req.body.name}`,
      });
    });
  });
});

app.get("/api/user/:id/bills", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    res.json(user);
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
