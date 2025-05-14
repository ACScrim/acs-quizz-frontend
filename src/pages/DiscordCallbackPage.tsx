import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";

function DiscordCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");
    const user = queryParams.get("user");

    if (accessToken && user) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", user);
      navigate("/");
    }
  }, [location, navigate]);

  return <></>;
}

export default DiscordCallbackPage;
