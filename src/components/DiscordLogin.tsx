function DiscordLogin() {
  const handleLogin = () => {
    // Redirect to Discord OAuth URL
    window.location.href = "http://localhost:3000/api/auth/discord";
  };
  return <button onClick={handleLogin}>Connexion</button>;
}

export default DiscordLogin;
