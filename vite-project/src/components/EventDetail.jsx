import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import './EventDetail.css';
import RegisterEvent from "./registerEvent";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`http://localhost:5000/getevent/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Мероприятие не найдено");
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        alert("Мероприятие не найдено");
        navigate("/events");
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="event-detail-container">
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!event) return null;

  return (
    <>
        <Layout>
    <div className="event-detail-container">

      <button
        onClick={() => navigate(-1)}
        className="event-detail-back-button"
      >
        ← Назад
      </button>

      <h1 className="event-detail-title">{event.title}</h1>
      <p className="event-detail-description">{event.description}</p>

      {event.imageUrls?.length > 0 && (
        <div className="event-detail-images">
          {event.imageUrls.map((url, i) => (
            <img
              key={i}
              src={`http://localhost:5000${url}`}
              alt={`Изображение ${i + 1}`}
              className="event-detail-image"
            />
          ))}
        </div>
      )}

      {event.date && (
        <p className="event-detail-meta">
          <strong>Дата:</strong> {new Date(event.date).toLocaleString("ru-RU")}
        </p>
      )}
      {event.location && (
        <p className="event-detail-meta">
          <strong>Место:</strong> {event.location}
        </p>
      )}
        <RegisterEvent eventId={event._id?.toString()} />

    </div></Layout>
    </>
  );
}