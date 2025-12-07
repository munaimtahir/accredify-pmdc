"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      setMessage("Login successful. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      setMessage("Login failed.");
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Username </label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
