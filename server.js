const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));


mongoose.connect("mongodb+srv://admin:admin123@cluster0.xxxx.mongodb.net/studentDB");


const userSchema = new mongoose.Schema({

    name: String,
    email: String,
    password: String

});

const User = mongoose.model("User", userSchema);



app.get("/", (req, res) => {

    res.render("index");

});


app.get("/login", (req, res) => {

    res.render("login");

});



app.post("/update/:id", async (req, res) => {

    await User.findByIdAndUpdate(req.params.id, {

        name: req.body.name,
        email: req.body.email

    });

    res.redirect("/dashboard");

});



app.post("/login", async (req, res) => {

    const userEmail = req.body.email;
    const userPassword = req.body.password;

    const foundUser = await User.findOne({ email: userEmail });

    if(!foundUser){

        return res.send("User Not Found");

    }

    const isMatch = await bcrypt.compare(
        userPassword,
        foundUser.password
    );

    if(isMatch){

    req.session.user = foundUser;

    res.redirect("/dashboard");

    }
    else{

        res.send("Wrong Password");

    }

});
    app.get("/edit/:id", async (req, res) => {

    const user = await User.findById(req.params.id);

    res.render("edit", { user });

});
    app.get("/delete/:id", async (req, res) => {

    await User.findByIdAndDelete(req.params.id);

    res.redirect("/dashboard");

});
app.listen(process.env.PORT || 3000, () => {

    console.log("Server Started");

});
