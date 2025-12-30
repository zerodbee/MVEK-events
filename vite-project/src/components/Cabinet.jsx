import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../Layout';
import LogoutButton from './LogoutButton.jsx';
import UserEvents from '../components/UserEvents';
import './Cabinet.css';

function Cabinet() {
  const [payload, setPayload] = useState(null);
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
      const padding = "=".repeat((4 - base64.length % 4) % 4);
      const json = decodeURIComponent(
        atob(base64 + padding)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payloadData = JSON.parse(json);

      if (Array.isArray(payloadData.eventId)) {
        payloadData.eventId = payloadData.eventId.filter(
          id => id && id !== 'undefined' && id !== 'null'
        );
      }

      setPayload(payloadData);
    } catch (e) {
      console.error("Ошибка декодирования токена", e);
      navigate("/authorization", { replace: true });
    }
  }, [navigate]);

  if (!payload) {
    return (
      <Layout>
        <div className="cabinet-container">
          <p>Загрузка профиля...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cabinet-padding">
        <div className="cabinet-container">
          <div className="cabinet-header">
            <h1 className="cabinet-title">Личный кабинет</h1>
            <p className="cabinet-greeting">
              Здравствуйте, <strong>{payload.name} {payload.surname}</strong>!
            </p>
            <p>{payload.email}</p>
            <p>@{payload.login}</p>
          </div>

          <UserEvents eventIdList={payload.eventId} />

          <div className="cabinet-actions">
            <LogoutButton />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Cabinet;