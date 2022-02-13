import React, { createRef, useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { init } from "./canavs";

function App() {
  const canvasRef = createRef<HTMLCanvasElement>();

  useEffect(() => {
    (async () => {
      await init(canvasRef.current as HTMLCanvasElement);
    })();
  }, [canvasRef]);

  return (
    <div className="App">
      <header className="App-header">
        <canvas className="App-logo" ref={canvasRef} />
        <h1 id="title">#teamseas2021.</h1>
        <Gaming />
      </header>
    </div>
  );
}

function Gaming() {
  return <></> 
}

export default App;
