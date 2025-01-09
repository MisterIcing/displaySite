import "./Header.css";
import { useNavigate } from "react-router-dom";
import BrushIcon from "@mui/icons-material/Brush";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function Header() {
  let navigate = useNavigate();

  return (
    <div className="header">
      <div id="header" className="header-content">
        <div id="name" className="header-left" onClick={() => navigate("/")}>
          <BrushIcon className="header-icon" fontSize="large" />
          <h1 id="home" className="header-title">
            Gallery
          </h1>
        </div>
        <div className="header-right" onClick={() => navigate("/admin")}>
          <h1 id="admin" className="header-title">
            Admin
          </h1>
          <AdminPanelSettingsIcon className="header-icon" fontSize="large" />
        </div>
      </div>
    </div>
  );
}

export default Header;
