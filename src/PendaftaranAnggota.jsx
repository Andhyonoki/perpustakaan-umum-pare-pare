// PustakaGO.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./komponen/Sidebar";
import { auth, db } from "./komponen/firebase";
import { ref as dbRef, set } from "firebase/database";

export default function PustakaGO() {
  const [activeMenu, setActiveMenu] = useState("pendaftaran");
  const [isOpen, setIsOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    telpon: "",
    nik: "",
    pekerjaan: "",
    foto: null,
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);
    });
    return () => unsub();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, foto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!currentUser) return alert("Login dulu!");

    const required = ["nama", "alamat", "telpon", "nik", "pekerjaan"];
    for (const r of required) {
      if (!formData[r]) return alert("Lengkapi semua data!");
    }

    try {
      const anggotaRef = dbRef(
        db,
        `users/${currentUser.uid}/anggota/${Date.now()}`
      );

      await set(anggotaRef, {
        ...formData,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert("Data berhasil dikirim!");

      setFormData({
        nama: "",
        alamat: "",
        telpon: "",
        nik: "",
        pekerjaan: "",
        foto: null,
      });
    } catch (err) {
      console.log(err);
      alert("Gagal menyimpan data!");
    }
  };

  return (
    <div className="relative min-h-screen">

      {/* Background */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='80' height='80' fill='none' stroke='%23ffffff10' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      ></div>

       <div className="absolute inset-0 bg-blue-50 backdrop-blur-sm"></div>

      {/* Layout */}
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

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 transition-all duration-300 
            ${isOpen ? "md:ml-[288px]" : "md:ml-0"} 
            ml-0
          `}
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 md:py-6 px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-lg">
            <h2 className="text-4xl font-bold font-poppins">Pendaftaran Anggota</h2>
            <p className="mt-1 text-lg w-full font-poppins">
              Pusat Pendaftaran Anggota Koleksi Perpustakaan Online
            </p>
          </header>

          {/* Form */}
          <div className="p-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-lg p-8 max-w-3xl mx-auto">

              <h3 className="text-xl font-bold mb-4 font-poppins">Data Anggota</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["nama", "alamat", "telpon", "nik", "pekerjaan"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 font-poppins">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>

                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      placeholder={`Masukkan ${field}`}
                      className="w-full px-3 py-2 border-2 border-blue-900 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold mt-8 mb-3 font-poppins">Unggah Dokumen</h3>

              <label className="text-sm font-medium font-poppins">Foto 3x4</label>

              <div className="flex items-center gap-4 mt-2">
                <label className="px-5 py-2 bg-white border-2 border-blue-900 text-blue-900 rounded-lg cursor-pointer hover:bg-blue-50 text-sm font-poppins">
                  Pilih Foto
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-sm font-poppins">{formData.foto ? "File dipilih" : "Belum ada file"}</span>
              </div>

              {formData.foto && (
                <img src={formData.foto} alt="Preview" className="mt-3 w-28 h-36 object-cover border rounded" />
              )}

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmit}
                  className="px-12 py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 text-sm font-poppins"
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
