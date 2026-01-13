import { useState, useRef, useEffect } from "react";
import defaultAvatar from "../../images/default-avatar.jpg";
import "./ProfileMenu.css";

function ProfileMenu({ username, avatarUrl, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="profile-menu-content" ref={menuRef}>
      <button
        className="profile-button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open user menu"
      >
        <img
          className="profile-button-avatar"
          src={avatarUrl || defaultAvatar}
          alt="User avatar"
        />
        <span className="profile-button-username">{username}</span>
      </button>
      {open && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <img
              className="profile-menu-avatar"
              src={avatarUrl || defaultAvatar}
              alt="User avatar"
            />
            <div className="profile-menu-username">{username}</div>
          </div>
          <button className="profile-menu-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;