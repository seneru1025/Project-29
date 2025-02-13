require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Allow Cross-Origin Requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Post Schema & Model
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Post = mongoose.model('Post', postSchema);

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access Denied');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};
//Register route
app.post("/api/register", async (req, res) => {
  try {
    console.log("Incoming registration request:", req.body); // Debugging log

    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Missing username or password"); // Debugging log
      return res.status(400).send("Username and Password are required");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log("Username already exists"); // Debugging log
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    await newUser.save();
    console.log("User registered successfully:", newUser); // Debugging log
    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send("Internal Server Error");
  }
});



// Login Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  
  if (!user) return res.status(400).send('User not found');
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');
  
  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Get User Profile Route
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    res.json(user);
  } catch (error) {
    res.status(500).send('Error fetching profile');
  }
});


// Create Post Route
app.post("/api/posts", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const newPost = new Post({ title, content, user: req.user.id });
  
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).send('Error creating post');
  }
});

// Fetch Posts Route
app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username');
    res.json(posts);
  } catch (err) {
    res.status(400).send('Error fetching posts');
  }
});

// Update Post Route
app.put("/api/posts/:id", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    res.status(400).send('Error updating post');
  }
});

// Delete Post Route
app.delete("/api/posts/:id", authenticateToken, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.send('Post deleted');
  } catch (err) {
    res.status(400).send('Error deleting post');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});