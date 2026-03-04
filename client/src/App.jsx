
import { useState, useCallback } from "react";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [viewProps, setViewProps] = useState({});

  const navigate = useCallback((target, props = {}) => {
    setView(target);
    setViewProps(props);
  }, []);

  function handleLogout() {
    setUser(null);
    setView("dashboard");
    setViewProps({});
  }

  if (!user) {
    return <LoginPage onAuthSuccess={setUser} />;
  }

  return <GamePage user={user} view={view} viewProps={viewProps} navigate={navigate} onLogout={handleLogout} />;
}

export default App;