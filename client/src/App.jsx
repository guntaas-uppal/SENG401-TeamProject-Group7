import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";

function App() {
  const [user, setUser] = useState(null);

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginPage onAuthSuccess={setUser} />;
  }

  return <GamePage user={user} onLogout={handleLogout} />;
}

export default App;