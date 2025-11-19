import React, { useState, useEffect } from "react";
import { FiX, FiLogOut, FiUser, FiUserPlus, FiClipboard, FiMessageSquare } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { ref, get } from "firebase/database";

export default function Sidebar({ isOpen, setIsOpen, activeMenu }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const dbPath = ref(db, "users/" + currentUser.uid);
        const snapshot = await get(dbPath);

        if (snapshot.exists()) {
          setUser(snapshot.val());
        } else {
          setUser({
            email: currentUser.email,
            nama: "Pengguna",
          });
        }
      }
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: "pendaftaran", label: "Pendaftaran Anggota", path: "/pendaftarananggota", icon: <FiUserPlus size={18} /> },
    { name: "hasil", label: "Hasil Pendaftaran", path: "/hasil", icon: <FiClipboard size={18} /> },
    { name: "saran", label: "Masukan dan Saran", path: "/saran", icon: <FiMessageSquare size={18} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white text-gray-800 flex flex-col 
      transition-all duration-300 shadow-2xl z-40 ${isOpen ? "w-72" : "w-0 overflow-hidden"}`}
    >
      <button
        className="absolute top-4 right-4 p-2 text-gray-600 md:hidden"
        onClick={() => setIsOpen(false)}
      >
        <FiX size={24} />
      </button>

      <div className="px-6 pt-8 pb-4 flex items-center justify-center border-b border-gray-200">
        <img src="/logo12.png" alt="Logo" className="w-44 h-auto object-contain drop-shadow-xl" />
      </div>

      <nav className="flex-1 px-8 space-y-4 mt-8">
       {menuItems.map((item) => (
        <button
          key={item.name}
          onClick={() => navigate(item.path)}
          className={`w-full px-6 py-3 rounded-lg font-semibold flex flex-row items-center gap-3
            text-sm
            transition-all shadow-md hover:shadow-lg ${
              activeMenu === item.name
                ? "bg-blue-900 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </button>
      ))}


      </nav>

      <div className="border-t border-gray-300 bg-white">
        <div className="px-8 py-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <FiUser size={24} className="text-yellow-600" />
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500">Selamat datang,</p>
            <p className="font-bold text-base truncate">{user?.nama || "Pengguna"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
          </div>
        </div>

        <div className="px-8 pb-4">
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center gap-3 font-semibold text-white shadow-lg"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>

        <div className="text-center text-[10px] text-gray-500 py-3 px-4 border-t border-gray-300 leading-tight">
          © {new Date().getFullYear()} Perpustakaan Umum Pare-Pare  
          <br />
          Semua Hak Dilindungi
        </div>
      </div>
    </aside>
  );
}
