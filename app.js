// APP IMPORTS
const express = require("express");
const app = express();
const expressSanitizer = require('express-sanitizer');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override"); // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.



// APP CONFIG
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer()); // must be listed AFTER body parser.
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static('public')); // We can access stylesheets, images, etc. now via public folder.
mongoose.set('useFindAndModify', false); // needed to fix this error message: DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated.




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

// NEW ROUTE
app.get("/blogs/new", (req, res) => {
  res.render("new");
})

// CREATE ROUTE
app.post("/blogs", (req, res) => {
  // sanitize is used when we allow html instead of just text in our input. It removes things like <script>

  req.body.blog.body = req.sanitize(req.body.blog.body);

  // see new.ejs for more info on req.body.blog
  Blog.create(req.body.blog, (err, newBlog) => {
    if (err) {
      res.redirect("new");
    } else {
      res.redirect("/blogs");
    }
  });
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      console.log(err);
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) => {
  Blog.findById(req.params.id, (err, foundBlog) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// UPDATE ROUTE
// Must use and install Method-Override or put request will act like a get request and just create a duplicate post. See edit.ejs page.
app.put("/blogs/:id", (req, res) => {

  req.body.blog.body = req.sanitize(req.body.blog.body);

  // .findByIdAndUpdate params = (id, newData, callback)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
    if (err) {
      console.log(err);
      res.redirect("/blogs");
    } else {
      // redirect to show page
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DESTROY ROUTE
// Also requires Method-Override middleware
app.delete("/blogs/:id", (req, res) => {
  Blog.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(3000, () => {
  console.log("Server live, sir!");
});