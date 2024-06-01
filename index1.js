// // const http = require("http");         node import in previous version
// import http from "http";              // we can write this in node latest version by using type=module in package file
// import { generateLovePercent } from "./features.js";
// import fs from "fs"
// import path from "path";

// const home = fs.readFileSync("./index.html")

// // console.log("path",path.extname("/home/dist/index.js"))
// // console.log("path",path.dirname("/home/dist/index.js"))

// const server = http.createServer((req,res)=>{
//     console.log("method",req.method);
//     if(req.url === "/about"){
//         res.end(`<h2>About ${generateLovePercent()}</h2>`)
//     }else if(req.url === "/"){
//         res.end("home")
//     }else if(req.url === "/contact"){
//         res.end("<h1>Contact</h1>")
//     }else {
//         res.end("<h1>Page is not found</h1>")
//     }
// })

// server.listen(5000,()=>{
//     console.log("server is working fine")
// })

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

// const messageSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

// const Message = mongoose.model("Message", messageSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const app = express();

//using Middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//setting up view engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "bhavya");
    req.user = await User.findById(decoded._id);

    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  {console.log("user login", user)}
  // if(!user) return res.status(400).send("Invalid Credentials");
  if (!user) return res.redirect("/register");

  const isMatch = user.password == password;

  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });

  const token = jwt.sign({ _id: user._id }, "bhavya");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  //   let user = await User.findOne({ email });
  let  user = await User.findOne({ email });

  console.log("user",user)

  if (user) {
    return res.redirect("/login");
  }
  user = await User.create({
    name,
    email,
    password,
  });

  const token = jwt.sign({ _id: user._id }, "bhavya");

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.get("/", isAuthenticated, (req, res) => {
//   console.log(req.cookies);
//   const { token } = req.cookies;
//   const pathLocation = path.resolve();
// res.send({
//     success: true,
//     product: []
// })
// res.sendFile(path.join(pathLocation,'./index.html'))

//   if (token) {
//     res.render("logout");
//   } else {
//     res.render("login");
//   }
// res.sendFile("index")
//   res.render("logout", { name: req.user.name });
// });

// app.get("/add", async (req, res) => {
//   await Message.create({ name: "Abhi", email: "sample12@gmail.com" });
//   res.send("node");
// });

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.post("/contact", async (req, res) => {
//   const { name, email } = req.body;
//   await Message.create({ name, email });
//   res.redirect("/success");
// });

// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });

app.listen(5000, () => {
  console.log("server is working fine");
});
