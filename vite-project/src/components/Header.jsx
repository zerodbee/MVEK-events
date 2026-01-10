import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import './Header.css';

function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      setIsAuthenticated(false);
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
      const payload = JSON.parse(json);
      const role = Array.isArray(payload.role) ? payload.role[0] : payload.role;
      setIsAdmin(role === "admin");
      setIsAuthenticated(true);
    } catch (e) {
      setIsAdmin(false);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    }
  }, []);

  return (
    <header className="header-glass">
      <div className="header-content">
        <Link to="/" className="header-logo">
          Афиша<span className="logo-accent">МВЕК</span>
        </Link>

        <nav className="header-nav">
          <ul className="header-nav__list">
            <li><Link to="/" className="nav-link">Главная</Link></li>
            
            {isAuthenticated ? (
              <>
                <li><Link to="/cabinet" className="nav-link">Кабинет</Link></li>
                {isAdmin && (
                  <li><Link to="/admin" className="nav-link nav-link--admin">Админ-панель</Link></li>
                )}
                <li>
                  <div className="nav-logout">
                    <LogoutButton />
                  </div>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/registration" className="nav-link nav-link--signup">Регистрация</Link></li>
                <li><Link to="/authorization" className="nav-link nav-link--login">Войти</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;