import React, { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "./komponen/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Realtime database
import { getDatabase, ref, set } from "firebase/database";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!nama || !email || !password || !confirm) {
      alert("Mohon isi semua data!");
      return;
    }

    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }

    if (password !== confirm) {
      alert("Password dan konfirmasi tidak sama!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const db = getDatabase();
      await set(ref(db, "users/" + user.uid), {
        uid: user.uid,
        nama: nama,
        email: email,
        role: "user",
        createdAt: new Date().toISOString(),
      });

      alert("Registrasi berhasil!");
      navigate("/");
    } catch (error) {
      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        alert("Email sudah digunakan!");
      } else {
        alert("Gagal register: " + error.message);
      }
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

        {/* LEFT PANEL (FORM REGISTER) */}
        <div className="px-10 py-14">
          <h2 className="text-4xl font-extrabold text-black text-center">
            Buat Akun Baru
          </h2>
          <p className="text-gray-600 text-center mt-2 mb-10">
            Silakan isi data berikut untuk membuat akun
          </p>

          <div className="space-y-6">

            {/* Nama */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="text"
                placeholder="Nama Lengkap"
                onChange={(e) => setNama(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-blue-700"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-blue-700"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-blue-700"
              />
            </div>

            {/* Konfirmasi Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700" />
              <input
                type="password"
                placeholder="Konfirmasi Password"
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-14 pr-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-blue-700"
              />
            </div>

            {/* Tombol Register */}
            <button
              onClick={handleRegister}
              className="w-full py-3 bg-[#0A3353] hover:bg-[#062439] text-white 
             font-bold rounded-xl shadow-md transition text-lg disabled:opacity-50"
>
            
              REGISTER
            </button>

            {/* Link ke login */}
            <p className="text-center text-gray-600 mt-4">
              Sudah punya akun?
              <Link to="/" className="text-blue-700 font-bold ml-1">
                Login
              </Link>
            </p>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#DCEAF5] flex flex-col items-center justify-center px-8 py-12 text-blue-900">
          <img
            src="/logo12.png"
            alt="PustakaGO Logo"
            className="w-64 h-40 object-contain mb-6 drop-shadow-lg"
          />
          <h2 className="text-3xl font-bold text-center text-black">Ayo Bergabung!</h2>
          <p className="mt-3 text-center text-gray-700">
            Sistem Informasi Pustaka Online
          </p>

         <div className="w-16 h-1 bg-[#0A3353] rounded-full mt-4 mb-6"></div>
         
                   <p className="text-gray-700 mb-3">Sudah Punya Akun?</p>
         
                   <Link
                     to="/"
                     className="bg-[#0A3353] text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-[#062439] transition"
                   >
                     Masuk Sekarang
                   </Link>

           <p className="mt-10 text-xs text-gray-700">© 2024 PustakaGO. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
