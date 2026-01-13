import menu from "./menu";
import "./GlobalNav.css";
import { useState } from "react";

function GlobalNav({ className, changePage }) {
  const [showMenu, setShowMenu] = useState(true);

  function go(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const href = link.getAttribute("href");
    changePage(href);
  }

  const list = menu.map((item) => {
    return (
      <li key={item.name} className="global-nav__item">
        <a className="global-nav__link" href={item.path} onClick={go}>
          {item.name}
        </a>
      </li>
    );
  });

  const menuClass = showMenu ? "global-nav__list--active" : "";

  return (
    <nav className={`${className} global-nav`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="global-nav__toggle"
      >
        <span aria-hidden="true">{showMenu ? "X" : "☰"}</span>
      </button>

      <ul className={`global-nav__list  ${menuClass}`}>{list}</ul>
    </nav>
  );
}

export default GlobalNav;