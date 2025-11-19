// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import "./komponen/firebase";

import Login from "./login";
import Register from "./register";
import Dashboard from "./PendaftaranAnggota";
import Saran from "./saran";
import HasilPendaftaran from "./hasil";
import AdminDashboard from "./adminklolah";
import SaranAdmin from "./saranadmin"; // import halaman saran admin

function App() {
  return (
    <Routes>
      {/* Route umum */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pendaftarananggota" element={<Dashboard />} />
      <Route path="/saran" element={<Saran />} />
      <Route path="/hasil" element={<HasilPendaftaran />} />

      {/* Route untuk halaman admin */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/saran-admin" element={<SaranAdmin />} />
    </Routes>
  );
}

export default App;
