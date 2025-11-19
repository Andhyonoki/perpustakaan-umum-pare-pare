// Login.jsx
import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./komponen/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref as dbRef, get } from "firebase/database";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Mohon isi email dan password!");

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const roleRef = dbRef(db, `users/${user.uid}/role`);
      const snapshot = await get(roleRef);
      const role = snapshot.exists() ? snapshot.val() : null;

      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "user") navigate("/PendaftaranAnggota");
      else alert("Role tidak valid!");
    } catch (error) {
      alert("Login gagal! Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/rak.jpg')" }}
    >
      {/* Overlay gelap di belakang */}
     <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>


      {/* Container form solid */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="bg-[#DCEAF5] flex flex-col items-center justify-center px-8 py-12 text-black">
          <img 
            src="/logo12.png" 
            alt="PustakaGO Logo"
            className="w-64 h-40 object-contain mb-4 drop-shadow-lg"
          />

          <h2 className="text-3xl font-bold text-center">Selamat Datang!</h2>
          <p className="mt-3 text-center text-gray-700">
            Sistem Informasi Pustaka Online
          </p>

          <div className="w-16 h-1 bg-[#0A3353] rounded-full mt-4 mb-6"></div>

          <p className="text-gray-700 mb-3">Belum punya akun?</p>

          <Link
            to="/register"
            className="bg-[#0A3353] text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-[#062439] transition"
          >
            Daftar Sekarang
          </Link>

          <p className="mt-10 text-xs text-gray-700">© 2024 PustakaGO. All rights reserved.</p>
        </div>

        {/* RIGHT PANEL (LOGIN FORM) */}
        <div className="relative px-10 py-14">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-extrabold text-black text-center">
              Masuk Ke Akun Anda
            </h2>

            <p className="text-gray-700 text-center mt-2 mb-10">
              Silakan masukkan kredensial Anda untuk melanjutkan
            </p>

            {/* Email */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="email"
                placeholder="Masukkan Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl 
                           focus:outline-blue-600 text-black placeholder-black bg-white"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="password"
                placeholder="Masukkan Kata Sandi Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl 
                           focus:outline-blue-600 text-black placeholder-black bg-white"
              />
            </div>

            <p className="text-right text-blue-700 font-medium cursor-pointer hover:underline">
              Lupa kata sandi?
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-[#0A2A43] hover:bg-[#0C355A] text-white 
                         font-bold rounded-xl shadow-md transition text-lg disabled:opacity-50"
            >
              {loading ? "Loading..." : "Masuk Sekarang"}
            </button>

            <p className="text-center text-gray-700 mt-4">
              Belum punya akun?
              <Link to="/register" className="text-blue-700 font-bold ml-1">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
