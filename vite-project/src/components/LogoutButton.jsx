import { useNavigate } from "react-router-dom";
import './LogoutButton.css';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="logout-button"
      aria-label="Выйти из аккаунта"
    >
      Выйти
    </button>
  );
}