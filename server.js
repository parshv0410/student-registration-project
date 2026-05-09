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


// MongoDB Atlas Connection
mongoose.connect(
   "mongodb+srv://parshvpatel30_db_user:Parshv%404356@cluster0.9wz1eja.mongodb.net/studentDB?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});


// User Schema
const userSchema = new mongoose.Schema({

    name: String,
    email: String,
    password: String

});

const User = mongoose.model("User", userSchema);



// Home Page
app.get("/", (req, res) => {

    res.render("index");

});



// Login Page
app.get("/login", (req, res) => {

    res.render("login");

});



// Dashboard
app.get("/dashboard", async (req, res) => {

    const users = await User.find();

    res.render("dashboard", { users });

});



// Register User
app.post("/register", async (req, res) => {

    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    if(userPassword.length < 6){

        return res.send("Password must be at least 6 characters");

    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = new User({

        name: userName,
        email: userEmail,
        password: hashedPassword

    });

    await newUser.save();

    res.send("Registration Successful");

});



// Login User
app.post("/login", async (req, res) => {

    const userEmail = req.body.email;
    const userPassword = req.body.password;

    const foundUser = await User.findOne({
        email: userEmail
    });

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



// Edit Page
app.get("/edit/:id", async (req, res) => {

    const user = await User.findById(req.params.id);

    res.render("edit", { user });

});



// Update User
app.post("/update/:id", async (req, res) => {

    await User.findByIdAndUpdate(req.params.id, {

        name: req.body.name,
        email: req.body.email

    });

    res.redirect("/dashboard");

});



// Delete User
app.get("/delete/:id", async (req, res) => {

    await User.findByIdAndDelete(req.params.id);

    res.redirect("/dashboard");

});



// Logout
app.get("/logout", (req, res) => {

    req.session.destroy();

    res.redirect("/login");

});



// Server
app.listen(process.env.PORT || 3000, () => {

    console.log("Server Started");

});