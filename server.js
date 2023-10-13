require("dotenv").config({ path: "src/config/config.env" });

/**
 * Importing required libraries
 */
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const userRouter = require("./src/routes/user");
const uri = process.env.MONGO_URI;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Http Request: ${req.method} ${req.url}`);

  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));
app.set("views", path.resolve("./src/views"));
app.use("/user", userRouter);
app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});
app.use("/", userRouter);

/**
 * Setting port for server
 */
const PORT = process.env.PORT || 3500;

/**
 * Creating mongoDB connection
 */
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Connection to MongoDB failed:", error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
