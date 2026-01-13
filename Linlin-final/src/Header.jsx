import "./Header.css";
import Logo from "./images/elaine-casap-qgHGDbbSNm8-unsplash.jpg";
import GlobalNav from "./GlobalNav.jsx";

function Header({ changePage }) {
  function goToHomePage(e) {
    e.preventDefault();
    changePage("/");
  }

  return (
    <>
      <header className="header">
        <a className="skip-to-content-link" href="#main">
          Skip to content
        </a>
        <img
          src={Logo}
          className="header__logo"
          href="/"
          onClick={goToHomePage}
          alt="Logo: One hand with a bare arm and the other with a gloved hand and sleeve are holding a terra-cotta bowl filled with cherry tomatoes."
        />
        <h1 className="header__title">Lend and Borrow Tracker</h1>
      </header>

      <GlobalNav className="header__nav" changePage={changePage} />
    </>
  );
}

export default Header;
