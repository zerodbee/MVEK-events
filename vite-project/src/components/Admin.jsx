import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Layout from '../Layout';
import LogoutButton from './LogoutButton.jsx'; 
import AddEvent from "./AddEvent.jsx";
import './Admin.css';
function Admin() {
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

      </div>
    </div>
  </Layout>
);
}

export default Admin;