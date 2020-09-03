// APP IMPORTS
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// APP CONFIG
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static('public')); // We can access stylesheets, images, etc. now via public folder.



// MONGOOSE TO MONGO CONFIG
mongoose.connect('mongodb://localhost:27017/restful-blog-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to DB!'))
  .catch(error => console.log(error.message));

// MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }

});

const Blog = mongoose.model('Blog', blogSchema);

// RESTFUL ROUTES

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", (req, res) => {
  Blog.find({}, (err, blogs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

app.listen(3000, () => {
  console.log("Server live, sir!");
});