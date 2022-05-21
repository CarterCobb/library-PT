import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import ErrorBoundary from "./code-spliting/error-boundary";
import { legacy_createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "./redux/reducer";

const store = legacy_createStore(reducer);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
