import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <span className="footer-accent"></span>
        <h3 className="footer-title">Дипломная работа</h3>
        <div className="footer-subtitle">Выпуск 2026</div>
        <p className="footer-text"><strong>Оборотова Виктория Сергеевна</strong></p>
        <p className="footer-text">Студент, группа ЭдИС-215/21</p>
        <p className="footer-text">
          <span className="footer-year">09.02.07</span> Информационные системы и программирование
        </p>
      </div>
    </footer>
  );
}

export default Footer;