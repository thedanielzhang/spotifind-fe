import React from "react";

import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from "react-dom/client";
import { Playlist } from "./pages/Playlist";
import { Admin } from "./pages/Admin";
import App from "./App";



const container = document.getElementById("app");
const root = createRoot(container)
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/playlist" element={<Playlist />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
    </BrowserRouter>
);
