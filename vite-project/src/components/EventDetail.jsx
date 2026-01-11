import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import './EventDetail.css';
import RegisterEvent from "./RegisterEvent";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${BACKEND_URL}/getevent/${id}`)
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

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

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
                  src={`${BACKEND_URL}${url}`}
                  alt={`Изображение ${i + 1}`}
                  className="event-detail-image clickable"
                  onClick={() => handleImageClick(i)}
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
        </div>
      </Layout>


      {selectedImageIndex !== null && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <span className="image-modal-close" onClick={closeModal}>&times;</span>
            <img
              src={`${BACKEND_URL}${event.imageUrls[selectedImageIndex]}`}
              alt={`Изображение ${selectedImageIndex + 1}`}
              className="image-modal-img"
            />
            <div className="image-modal-caption">
              {selectedImageIndex + 1} / {event.imageUrls.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}