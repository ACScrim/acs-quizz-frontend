import CreateLobby from "../components/CreateLobby";
import DiscordLogin from "../components/DiscordLogin";
import LobbyList from "../components/LobbyList";
import { useAuth } from "../hooks/useAuth";

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="pt-8 pb-20">
      {!user && <DiscordLogin />}
      {user && (
        <div className="space-y-12">
          <CreateLobby />
          <LobbyList />
        </div>
      )}
    </div>
  )
}

export default HomePage;