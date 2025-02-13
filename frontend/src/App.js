import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";
import Login from "./Login";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in!");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
    } catch (error) {
      toast.error("Failed to load posts. Please log in again.");
    }
  };

  const createPost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to create a post.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content cannot be empty!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/posts", { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle("");
      setContent("");
      fetchPosts();
    } catch (error) {
      toast.error("Error creating post. Please try again.");
    }
  };

  const deletePost = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to delete a post.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post deleted!");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const updatePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to update a post.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/posts/${editingId}`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Post updated successfully!");
      setTitle('');
      setContent('');
      setEditingId(null);
      fetchPosts();
    } catch (error) {
      toast.error("Error updating post");
    }
  };

  return (
    <Router>
      <div className="container">
        <h1>Community Sync</h1>

        <div className="input-container">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content"></textarea>
        </div>
        {editingId ? (
          <button className="edit-btn" onClick={updatePost}>Update Post</button>
        ) : (
          <button className="post-btn" onClick={createPost}>Post</button>
        )}

        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post-container">
              <h3>{post.title}</h3>
              <p>{post.content}</p>

              <div className="button-group">
                <button className="edit-btn" onClick={() => {
                  setEditingId(post._id);
                  setTitle(post.title);
                  setContent(post.content);
                }}>Edit</button>

                <button className="delete-btn" onClick={() => deletePost(post._id)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No posts available. Start adding some!</p>
        )}

        <ToastContainer position="top-center" autoClose={3000} />

        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;