import React, { useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";

const CreateLobby: React.FC = () => {
  const [lobbyName, setLobbyName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const { accessToken } = useAuth();
  const socket = useSocket("http://localhost:3000", {
    path: "/lobbies",
    auth: {
      token: accessToken,
    },
  });
  const handleCreateLobby = () => {
    const lobbyData = {
      name: lobbyName,
      isPublic: !isPrivate,
    };

    console.log("Lobby created:", lobbyData);
    socket.emit("create-lobby", { lobbyData });
  };

  return (
    <div className="create-lobby">
      <h2>Create a Lobby</h2>
      <div>
        <label htmlFor="lobbyName">Lobby Name:</label>
        <input
          type="text"
          id="lobbyName"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
        />
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Private Lobby
        </label>
      </div>
      <button onClick={handleCreateLobby}>Create Lobby</button>
    </div>
  );
};

export default CreateLobby;
