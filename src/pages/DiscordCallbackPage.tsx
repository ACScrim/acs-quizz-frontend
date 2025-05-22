import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

function DiscordCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const user = queryParams.get("user");

    if (user) {
      login(JSON.parse(user));
      navigate("/");
    }
  }, [location, navigate]);

  return <></>;
}

export default DiscordCallbackPage;
