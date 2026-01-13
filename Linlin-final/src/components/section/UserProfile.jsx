import defaultAvatar from "../images/default-avatar.png";
import "./UserProfile.css";

function UserProfile({ username, avatarUrl }) {
  return (
    <div className="user-profile">
      <img
        className="user-profile-avatar"
        src={avatarUrl || defaultAvatar}
        alt="User avatar"
      />
      <div>
        <div className="user-profile-username">{username}</div>
        <div className="user-profile-welcome">Welcome to your dashboard!</div>
      </div>
    </div>
  );
}

export default UserProfile;