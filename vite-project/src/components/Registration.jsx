import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../Layout';
import './Registration.css';

// Define backend URL as a constant
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function Registration() {
  const [login, setLogin] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [error, setError] = useState(""); 
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value) return false;

    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError("");
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError("Введите корректный email (например: user@gmail.com)");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Проверьте формат email");
      return;
    }

    const payload = {
      login,
      name: firstName,
      surname: lastName,
      lastname: noMiddleName ? null : middleName,
      email,
      password,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/reg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        navigate("/authorization");
      } else {
        setError(data.message || "Ошибка при регистрации");
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
            Создайте аккаунт в 📌 Афиша<span className="logo-accent">МВЕК</span>
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Имя</label>
              <input
                type="text"
                className="form-input"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Фамилия</label>
              <input
                type="text"
                className="form-input"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Отчество</label>
              <input
                type="text"
                className="form-input"
                value={middleName}
                onChange={e => setMiddleName(e.target.value)}
                disabled={noMiddleName}
              />
              <div className="middle-name-toggle">
                <input
                  type="checkbox"
                  id="noMiddleName"
                  checked={noMiddleName}
                  onChange={e => {
                    setNoMiddleName(e.target.checked);
                    if (e.target.checked) setMiddleName("");
                  }}
                />
                <label htmlFor="noMiddleName">У меня нет отчества</label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Почта</label>
              <input
                type="email"
                className={`form-input ${emailError ? 'form-input--error' : ''}`}
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                required
              />
              {emailError && <div className="form-error">{emailError}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength="5"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-button">
              Зарегистрироваться
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Registration;