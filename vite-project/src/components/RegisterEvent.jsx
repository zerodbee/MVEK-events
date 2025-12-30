import { useState, useEffect } from "react";
import './RegisterEvent.css';

function RegisterEvent({ eventId }) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [isRegisteredChecked, setIsRegisteredChecked] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      const token = localStorage.getItem("token");
      if (!token || !eventId) return;

      try {
        const userId = getUserIdFromToken(token);
        if (!userId) return;

        const res = await fetch(`http://localhost:5000/user/${userId}`);
        if (!res.ok) return;

        const { eventId: userEventIds = [] } = await res.json();
        const isRegistered = userEventIds.includes(eventId);
        setRegistered(isRegistered);
      } catch (err) {
        console.warn("Не удалось проверить статус записи", err);
      } finally {
        setIsRegisteredChecked(true);
      }
    };

    checkRegistration();
  }, [eventId]);

  const getUserIdFromToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padding = "=".repeat((4 - base64.length % 4) % 4);
      const json = decodeURIComponent(
        atob(base64 + padding)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json).id || null;
    } catch {
      return null;
    }
  };

  const handleRegister = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Вы не авторизованы");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventIdStr = String(eventId).trim();
      if (!eventIdStr || eventIdStr === "undefined") {
        throw new Error("Некорректный ID мероприятия");
      }

      const response = await fetch("http://localhost:5000/registerevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: eventIdStr })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось записаться");
      }

      setRegistered(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isRegisteredChecked) {
    return <div className="register-btn-placeholder"></div>;
  }

  if (registered) {
    return (
      <button 
        className="register-btn register-btn-success" 
        disabled
      >
        Вы записаны
      </button>
    );
  }

  return (
    <div className="register-btn-wrapper">
      <button
        className="register-btn"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="register-btn-loader"></span>
            Запись...
          </>
        ) : (
          "Записаться на мероприятие"
        )}
      </button>
      {error && <p className="register-error">{error}</p>}
    </div>
  );
}

export default RegisterEvent;