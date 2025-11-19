// MasukanSaran.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./komponen/Sidebar";
import { useLocation } from "react-router-dom";
import { auth, db } from "./komponen/firebase";
import { ref as dbRef, push, set, get } from "firebase/database";

export default function MasukanSaran() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const [formData, setFormData] = useState({
    namaAnggota: "",
    idAnggota: "",
    masukan: "",
  });

  useEffect(() => {
    if (location.pathname === "/saran") setActiveMenu("saran");

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (!isDesktop) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);

    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Silakan login!");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(dbRef(db, `users/${user.uid}/anggota`));
        if (snapshot.exists()) {
          const anggotaObj = snapshot.val();
          const firstEntry = Object.entries(anggotaObj)[0];
          const [idAnggota, data] = firstEntry;

          setFormData((prev) => ({
            ...prev,
            namaAnggota: data.nama || "",
            idAnggota: idAnggota,
          }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, masukan: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.masukan) return alert("Masukan tidak boleh kosong!");

    const user = auth.currentUser;
    if (!user) return alert("Silakan login dulu!");

    try {
      const newSaranRef = push(dbRef(db, "saran"));
      await set(newSaranRef, {
        ...formData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      alert("Masukan terkirim!");
      setFormData((prev) => ({ ...prev, masukan: "" }));
    } catch (err) {
      console.log(err);
      alert("Gagal mengirim!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-600">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='none' stroke='%23ffffff10' stroke-width='1'/%3E%3C/svg%3E")`,
        }}></div>
       <div className="absolute inset-0 bg-blue-50 backdrop-blur-sm"></div>

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 p-3 bg-blue-900 text-white rounded-lg shadow-lg z-50"
        >
          {isOpen ? "×" : "☰"}
        </button>

        {/* Main */}
        <main
          className={`flex-1 transition-all duration-300 
              ${isOpen ? "md:ml-[288px]" : "md:ml-0"} ml-0`}
        >
          <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 md:py-6 px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-lg">
            <h2 className="text-4xl font-bold">Saran dan Masukan</h2>
            <p className="mt-1 text-lg">Pusat Pendaftaran Anggota Koleksi Perpustakaan Online</p>
          </header>

          <div className="p-10">
            <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-lg p-10 max-w-4xl mx-auto">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-semibold">Nama Anggota</label>
                  <input
                    type="text"
                    value={formData.namaAnggota}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">ID Anggota</label>
                  <input
                    type="text"
                    value={formData.idAnggota}
                    readOnly
                    className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <label className="block text-sm font-semibold mb-2">Masukan dan Saran</label>
              <textarea
                name="masukan"
                value={formData.masukan}
                onChange={handleInputChange}
                rows="6"
                placeholder="Tuliskan masukan..."
                className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg resize-none"
              ></textarea>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  className="px-16 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  SUBMIT
                </button>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
