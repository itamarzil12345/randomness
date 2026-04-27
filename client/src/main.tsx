import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { App } from "./App";
import { ColorModeProvider } from "./app/colorMode";
import { SidebarProvider } from "./app/sidebar";
import { store } from "./app/store";
import "@xyflow/react/dist/style.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ColorModeProvider>
        <SidebarProvider>
          <BrowserRouter>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              closeOnClick={false}
              pauseOnHover
              draggable={false}
              newestOnTop
              theme="colored"
            />
          </BrowserRouter>
        </SidebarProvider>
      </ColorModeProvider>
    </Provider>
  </React.StrictMode>,
);
