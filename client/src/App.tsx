import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Room from "./components/Room";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact> <button onClick={() => window.location.href += "room/my-room"}> Get me to a room </button></Route>
        <Route path="/room/:roomID" component={Room} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
