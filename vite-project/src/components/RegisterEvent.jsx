import { useState, useEffect } from "react";
import './RegisterEvent.css';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function RegisterEvent({ eventId }) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [isRegisteredChecked, setIsRegisteredChecked] = useState(false);
  const [eventPassed, setEventPassed] = useState(false);

  useEffect(() => {
    const checkRegistrationAndEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token || !eventId) return;

      try {

        const eventRes = await fetch(`${BACKEND_URL}/getevent/${eventId}`);
        if (eventRes.ok) {
          const event = await eventRes.json();
          setEventPassed(event.passed || false);
        }

        const userId = getUserIdFromToken(token);
        if (!userId) return;

        const res = await fetch(`${BACKEND_URL}/user/${userId}`);
        if (!res.ok) return;

        const { eventId: userEventIds = [] } = await res.json();
        const isRegistered = userEventIds.includes(eventId);
        setRegistered(isRegistered);
      } catch (err) {
        console.warn("Не удалось проверить статус записи или мероприятие", err);
      } finally {
        setIsRegisteredChecked(true);
      }
    };

    checkRegistrationAndEvent();
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

      const response = await fetch(`${BACKEND_URL}/registerevent`, {
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

  if (eventPassed) {
    return (
      <button
        className="register-btn register-btn-disabled"
        disabled
      >
        Мероприятие уже прошло
      </button>
    );
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