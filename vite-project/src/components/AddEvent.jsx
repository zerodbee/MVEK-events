import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './AddEvent.css';

// Define backend URL as a constant
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function AddEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const payload = JSON.parse(json);
      const role = Array.isArray(payload.role) ? payload.role[0] : payload.role;
      if (role !== "admin") {
        navigate("/cabinet", { replace: true });
      }
    } catch (e) {
      navigate("/authorization", { replace: true });
    }
  }, [navigate]);


  useEffect(() => {

    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    imageFiles.forEach(file => formData.append("images", file));

    try {
      const res = await fetch(`${BACKEND_URL}/addevents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Мероприятие успешно добавлено!");

        setTitle("");
        setDescription("");
        setImageFiles([]);
        setPreviewUrls([]);
        const fileInput = document.getElementById("images");
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(`❌ ${data.message || "Не удалось добавить мероприятие"}`);
      }
    } catch (err) {
      setMessage("⚠️ Ошибка сети. Проверьте подключение.");
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <div className="add-event-box">
    <div className="add-event-card">
      <h2 className="add-event-title">Добавить мероприятие</h2>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="title">Название *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Например: Открытая лекция по веб-разработке"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание *</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows="4"
            placeholder="Укажите дату, время, место, формат (онлайн/офлайн), спикеров, цели..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Изображения (перетащите или выберите несколько)</label>
          <div className="file-upload-area">
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="images" className="file-upload-label">
              Выберите файлы или перетащите сюда
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="image-previews">
              <p>Предпросмотр ({previewUrls.length}):</p>
              <div className="preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img src={url} alt={`preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeImage(index)}
                      title="Удалить"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {imageFiles.length > 0 && (
            <div className="file-info">
              Выбрано файлов: {imageFiles.length}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || !title.trim() || !description.trim()}
        >
          {isSubmitting ? "Отправка…" : "Добавить мероприятие"}
        </button>

        {message && (
          <div className={`message ${message.includes("Успешно") ? "success" : message.includes("Ошибка") ? "warning" : "error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  </div>
);
}

export default AddEvent;