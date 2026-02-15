import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("worker");

  const handleLogin = () => {
    login(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80 space-y-4">
        <h1 className="text-2xl font-bold text-center">WORQIZ Login</h1>

        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="worker">Worker</option>
          <option value="agent">Agent</option>
          <option value="owner">Shop Owner</option>
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
