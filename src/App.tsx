import DiscordLogin from "./components/DiscordLogin";
import Navbar from "./components/Navbar";
import CreateLobby from "./components/CreateLobby";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      {!user && <DiscordLogin />}
      <CreateLobby />
    </>
  );
}

export default App;
