const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env["MONGO_URI"];
const PORT = process.env.PORT || 3001;

// allows for json input from forms, like posting from react
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

const { Schema, model } = mongoose;

const messageSchema = new Schema({
  message: String,
});
const Message = model("Message", messageSchema);

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

app.get("/message/:id", (req, res) => {
  Message.findById(req.params.id, (err, message) => {
    res.json({
      message: message.message,
      id: message._id,
    });
  });
});

app.post("/api/new-message", (req, res) => {
  const msg = new Message({
    message: req.body.message,
  });
  msg.save((err, data) => {
    if (err) return data.json({ error: err });
    res.json({
      status: 200,
      message: data.message,
      _id: data._id,
    });
  });
});

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
    console.log("req.body", req.body);
    console.log("user found", user);
    user.bills.push(req.body);
    user.save((saveErr, data) => {
      res.json({
        message: `Successfully updated ${user.username} with bill: ${data.name}`,
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
