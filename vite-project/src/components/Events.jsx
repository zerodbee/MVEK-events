import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/getevents")
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEventClick = (id) => {
    navigate(`/event/${id}`);
  };

  if (loading) {
    return (
      <div className="events-container">
        <h2 className="events-title">Загрузка...</h2>
      </div>
    );
  }

  return (
    <div className="events-container">
      <h2 className="events-title">Последние события</h2>

      {events.length === 0 ? (
        <p className="events-no-events">Нет мероприятий</p>
      ) : (
        events.map(event => (
          <div
            key={event._id}
            className="event-card"
            role="button"
            tabIndex={0}
            onClick={() => handleEventClick(event._id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleEventClick(event._id);
              }
            }}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <h3 className="event-title">{event.title}</h3>
            <p className="event-description">
              {event.description.length > 160
                ? event.description.substring(0, 160) + '…'
                : event.description}
            </p>

            {event.imageUrls?.length > 0 && (
              <div
                className={`event-images event-images--count-${Math.min(event.imageUrls.length, 3)}`}
              >
                {event.imageUrls.slice(0, 3).map((url, i) => (
                  <div key={i} className="event-image-item">
                    <img
                      src={`http://localhost:5000${url}`}
                      alt={`Изображение ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              className="event-detail-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event._id);
              }}
            >
              Подробнее
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Events;