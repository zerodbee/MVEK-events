import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../Layout';
import './Registration.css'

function Authorization() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        const role = Array.isArray(data.role) ? data.role[0] : data.role;
        localStorage.setItem("role", role);

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/cabinet");
        }
      } else {
        setError(data.message || "Неверный логин или пароль");
      }
    } catch {
      setError("Не удалось подключиться к серверу");
    }
  };

  return (
    <Layout>
      <div className="registration-container">
        <div className="registration-card">
          <h1 className="registration-title">
            Вход в 📌 Афиша<span className="logo-accent">МВЕК</span>
          </h1>

          <form onSubmit={handleSubmit} className="registration-form" noValidate>
            <div className="form-group">
              <label className="form-label">Логин</label>
              <input
                type="text"
                className="form-input"
                value={login}
                onChange={e => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button">
              Войти
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Authorization;