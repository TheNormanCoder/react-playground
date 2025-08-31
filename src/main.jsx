import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import App from "./App.jsx";                  // Playground che hai già
import Users from "./pages/Users.jsx";        // nuova pagina
import RHFForm from "./pages/RHFForm.jsx";    // nuova pagina
import { store } from "./store.js";           // se non l'hai creato, chiedimi lo snippet
import "./index.css";

const qc = new QueryClient();

const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: isActive ? "#e5e7eb" : "#f3f4f6",
    color: "#111",
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={qc}>
                <BrowserRouter>
                    {/* Navbar minimale */}
                    <nav style={{ padding: 16, display: "flex", gap: 10 }}>
                        <NavLink to="/" style={linkStyle} end>Playground</NavLink>
                        <NavLink to="/users" style={linkStyle}>Users (React Query)</NavLink>
                        <NavLink to="/form" style={linkStyle}>Form (RHF + Zod)</NavLink>
                    </nav>

                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/form" element={<RHFForm />} />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    </React.StrictMode>
);
