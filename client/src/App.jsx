import { useState, useCallback, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import GamePage from "./pages/GamePage";
import { audio } from "./utils/audio";

// Sets body class for background art + plays correct music
function applyScene(view, viewProps, hasUser) {
  const isGameView = view === "game" || view === "history" || view === "summary";
  const scene = !hasUser || (!isGameView)
    ? "home"
    : (viewProps.level || "household");

  // Swap body class
  document.body.className = document.body.className
    .replace(/\bscene-\S+/g, "")
    .trim();
  document.body.classList.add(`scene-${scene}`);

  // Play matching music
  if (scene === "home") {
    audio.playBg("home");
  } else {
    audio.playBg(scene); // "household" | "city" | "country"
  }
}

function App() {
  const [user, setUser]         = useState(null);
  const [view, setView]         = useState("dashboard");
  const [viewProps, setViewProps] = useState({});

  // Apply scene on every state change
  useEffect(() => {
    applyScene(view, viewProps, !!user);
  }, [user, view, viewProps]);

  const navigate = useCallback((target, props = {}) => {
    audio.playClick();
    setView(target);
    setViewProps(props);
  }, []);

  function handleLogout() {
    audio.playClick();
    setUser(null);
    setView("dashboard");
    setViewProps({});
  }

  if (!user) {
    return <LoginPage onAuthSuccess={setUser} />;
  }

  return (
    <GamePage
      user={user}
      view={view}
      viewProps={viewProps}
      navigate={navigate}
      onLogout={handleLogout}
    />
  );
}

export default App;