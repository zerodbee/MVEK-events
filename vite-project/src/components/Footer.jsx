import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <span className="footer-accent"></span>
        <h3 className="footer-title">Онлайн-афиша МВЕК</h3>
        <div className="footer-subtitle">События, мероприятия и расписание колледжа</div>

        <p className="footer-text">
          <strong>Международный восточно-европейский колледж</strong><br />
          Входит в первую лигу колледжей России
        </p>
        <br></br>
        <p className="footer-text">
          Адрес (головной офис): г. Ижевск, ул. Пушкинская, д. 268
        </p>
        <p className="footer-text">Телефон: <a href="tel:88001007724" className="footer-link">8(3412)77-68-17</a> (бесплатно по РФ) </p>
        <p className="footer-text">
          Email: <a href="mailto:pk@mveu.ru" className="footer-link">distspo@mveu.ru</a> 
        </p>
        <p className="footer-text">
          Официальный сайт:{" "}
          <a href="https://mveu.ru/education/srednee_professionalnoe_obrazovanie/" target="_blank" rel="noopener noreferrer" className="footer-link">
            mveu.ru
          </a>
        </p>
        <br></br>
        <p className="footer-text">
          <span className="footer-year">© {new Date().getFullYear()}</span> Все права защищены.
        </p>
      </div>
    </footer>
  );
}

export default Footer;