import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error("Username and Password are required!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username,
        password,
      });

      toast.success(response.data || "Registration successful!");
      navigate("/login"); // Redirect to login after successful registration
    } catch (error) {
      console.error("Register failed:", error.response?.data || error.message);
      toast.error(error.response?.data || "Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;