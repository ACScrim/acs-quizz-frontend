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
    console.log({ accessToken, user });
    if (accessToken && user) {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("user", user);
      navigate("/");
    }
  }, [location, navigate]);

  return <></>;
}

export default DiscordCallbackPage;
