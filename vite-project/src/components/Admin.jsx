import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../Layout';
import LogoutButton from './LogoutButton.jsx';
import AddEvent from "./AddEvent.jsx";
import './Admin.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function Admin() {
  const [payload, setPayload] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/authorization", { replace: true });
      return;
    }

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padding = "=".repeat((4 - (base64.length % 4)) % 4);
      const json = decodeURIComponent(
        atob(base64 + padding)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      setPayload(JSON.parse(json));
    } catch (e) {
      console.error("Ошибка декодирования токена:", e);
      navigate("/authorization", { replace: true });
    }
  }, [navigate]);


  useEffect(() => {
    if (!payload) return;
    
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/getevents`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении мероприятий:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [payload]);


  const isEventTodayOrPast = (eventDate) => {
    if (!eventDate) return false;
    const eventDateObj = new Date(eventDate);
    const today = new Date();

    eventDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDateObj <= today;
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Вы уверены, что хотите удалить это мероприятие?")) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/event/${eventId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        alert("Мероприятие успешно удалено");
      } else {
        alert(`Ошибка: ${data.message}`);
      }
    } catch (error) {
      console.error("Ошибка при удалении мероприятия:", error);
      alert("Ошибка сети при удалении мероприятия");
    }
  };

  const handleMarkAsPassed = async (eventId) => {
    if (!window.confirm("Вы уверены, что хотите отметить это мероприятие как прошедшее?")) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/event/${eventId}/pass`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setEvents(events.map(event =>
          event._id === eventId ? { ...event, passed: true } : event
        ));
        alert("Мероприятие отмечено как прошедшее");
      } else {
        alert(`Ошибка: ${data.message}`);
      }
    } catch (error) {
      console.error("Ошибка при отметке мероприятия как прошедшего:", error);
      alert("Ошибка сети при отметке мероприятия как прошедшего");
    }
  };

  if (!payload) return <Layout><p>Загрузка...</p></Layout>;

  return (
    <Layout>
      <div className="admin-container">
        <h2 className="admin-title">Админ-панель</h2>
        <div className="admin-profile-card">
          <ul className="admin-profile-list">
            <li><strong>ID:</strong>{payload.id}</li>
            <li>@{payload.login}</li>
            <li>{payload.name} {payload.surname} {payload.lastname || ""}</li>
            <li><strong>Роль:</strong>{payload.role?.[0] || payload.role}</li>
          </ul>
          <LogoutButton />
        </div>

        <div className="admin-actions">
          <AddEvent />
          
          <div className="admin-events-section">
            <h3>Управление мероприятиями</h3>
            {loading ? (
              <p>Загрузка мероприятий...</p>
            ) : events.length === 0 ? (
              <p>Нет мероприятий для отображения</p>
            ) : (
              <div className="admin-events-list">
                {events.map(event => (
                  <div key={event._id} className="admin-event-card">
                    <h4>{event.title}</h4>
                    <p>{event.description.substring(0, 100)}...</p>
                    <div className="admin-event-actions">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Удалить
                      </button>
                      {!event.passed && isEventTodayOrPast(event.date) && (
                        <button
                          className="pass-btn"
                          onClick={() => handleMarkAsPassed(event._id)}
                        >
                          Отметить как прошедшее
                        </button>
                      )}
                      {!event.passed && !isEventTodayOrPast(event.date) && (
                        <span className="disabled-btn">Отметить как прошедшее (доступно после дня мероприятия)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Admin;