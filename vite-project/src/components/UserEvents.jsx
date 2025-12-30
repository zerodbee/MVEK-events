import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './UserEvents.css';

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
    const payload = JSON.parse(json);
    return payload.id || null;
  } catch (e) {
    return null;
  }
};

const isValidObjectId = (id) => {
  if (typeof id !== 'string') return false;
  const len = id.length;
  if (len !== 24 && len !== 12) return false;
  return /^[0-9a-fA-F]+$/.test(id);
};

export default function UserEvents() {
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unregistering, setUnregistering] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserEvents = async () => {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken(token);

      if (!token || !userId) {
        setError("Не авторизован");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userRes = await fetch(`http://localhost:5000/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!userRes.ok) throw new Error("Пользователь не найден");
        const userData = await userRes.json();

        const validEventIds = (userData.eventId || [])
          .filter(id => id && typeof id === 'string' && id.trim().length > 0 && isValidObjectId(id.trim()));

        if (validEventIds.length === 0) {
          setUserEvents([]);
          setLoading(false);
          return;
        }

        const eventsRes = await fetch("http://localhost:5000/geteventsbyids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ eventIds: validEventIds })
        });

        if (!eventsRes.ok) {
          const data = await eventsRes.json().catch(() => ({}));
          throw new Error(data.message || "Не удалось загрузить мероприятия");
        }

        const events = await eventsRes.json();
        setUserEvents(events);
      } catch (err) {
        console.error("Ошибка в UserEvents:", err);
        setError(err.message || "Ошибка загрузки");
        setUserEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserEvents();
  }, []);

  const handleUnregister = async (eventId, eventTitle) => {
    if (!window.confirm(`Отменить запись?`)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Сессия устарела");
      return;
    }

    setUnregistering(prev => new Set(prev).add(eventId));

    try {
      const response = await fetch("http://localhost:5000/unregisterevent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не удалось отменить запись");
      }

      setUserEvents(prev => prev.filter(e => e._id !== eventId));
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    } finally {
      setUnregistering(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="user-events-section">
        <h3>Мои мероприятия</h3>
        <div className="loading-placeholder">Загрузка ваших мероприятий...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-events-section">
        <h3>Мои мероприятия</h3>
        <p className="text-error">Ошибка: {error}</p>
      </div>
    );
  }

  return (
    <div className="user-events-section">
      <h3>Мои мероприятия</h3>

      {userEvents.length === 0 ? (
        <p className="no-events">Вы пока не записаны ни на одно мероприятие.</p>
      ) : (
        <div className="events-grid">
          {userEvents.map(event => (
            <div key={event._id} className="event-card">
              <h4>{event.title}</h4>
              <p className="event-description">
                {event.description.length > 100
                  ? event.description.substring(0, 100) + '…'
                  : event.description}
              </p>
              {event.imageUrls?.[0] && (
                <div className="event-image">
                  <img
                    src={`http://localhost:5000${event.imageUrls[0]}`}
                    alt={event.title}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="event-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  Подробнее
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleUnregister(event._id, event.title)}
                  disabled={unregistering.has(event._id)}
                >
                  {unregistering.has(event._id) ? 'Отписка...' : 'Отменить запись'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}