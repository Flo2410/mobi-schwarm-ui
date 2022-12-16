import React from "react";
import { P5Canvas } from "./components/P5Canvas";
import { StatsDisplay } from "./components/StatsDisplay";

function App() {
  return (
    <div className="relative">
      <StatsDisplay />
      <P5Canvas />
    </div>
  );
}

export default App;
