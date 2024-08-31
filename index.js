const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Users

const users = [];

app.post("/api/users", (req, res) => {
  const userName = req.body.username;
  if (!userName) {
    return res.json({ error: "username required" });
  }

  const userId = uuidv4().replace(/-/g, "").slice(0, 24);
  const userObject = { username: userName, _id: userId, log: [] };
  users.push(userObject);
  res.json(userObject);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

// Exercises

app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const user = users.find((user) => user._id === userId);
  if (!user) {
    return res.json({ error: "unknown user id" });
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  if (!description) {
    return res.json({ error: "description required" });
  }

  if (!duration) {
    return res.json({ error: "duration required" });
  }

  const exerciseObject = {
    description: description,
    duration: duration,
    date: date.toDateString(),
  };

  user.log.push(exerciseObject);

  const responseObject = {
    username: user.username,
    description: exerciseObject.description,
    duration: exerciseObject.duration,
    date: exerciseObject.date,
    _id: user._id,
  };

  res.json(responseObject);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const user = users.find((user) => user._id === userId);
  if (!user) {
    return res.json({ error: "unknown user id" });
  }

  let { from, to, limit } = req.query;

  from = from ? new Date(from) : new Date(0);
  to = to ? new Date(to) : new Date();

  let log = user.log.filter((exercise) => {
    const exerciseDate = new Date(exercise.date);
    return exerciseDate >= from && exerciseDate <= to;
  });

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const responseObject = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log,
  };

  res.json(responseObject);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
