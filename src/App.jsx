 import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Router from "./features/Router";

function App() {
  const value = useMemo(() => ({}), []);
  return (
    <Provider store={store} value={value}>
      <Router />
    </Provider>
  );
}

export default App;
