import React, { useState, useEffect } from "react";
import { User, Check, X, Edit2, Trash2, Search } from "lucide-react";
import { db } from "./komponen/firebase";
import { ref as dbRef, onValue, update, remove } from "firebase/database";
import Sidebar from "./komponen/Sidebaradmin";

export default function AdminDashboard() {
  const [registrants, setRegistrants] = useState([]);
  const [filteredRegistrants, setFilteredRegistrants] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, data: null });

  useEffect(() => {
    const usersRef = dbRef(db, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (!usersData) {
        setRegistrants([]);
        setFilteredRegistrants([]);
        return;
      }

      const arr = [];
      Object.keys(usersData).forEach((uid) => {
        if (usersData[uid].role === "admin") return;
        const anggotaData = usersData[uid].anggota || {};
        Object.keys(anggotaData).forEach((key) => {
          const data = anggotaData[key];
          arr.push({
            no: arr.length + 1,
            uid,
            key,
            nama: data.nama || "-",
            alamat: data.alamat || "-",
            telpon: data.telpon || "-",
            nik: data.nik || "-",
            pekerjaan: data.pekerjaan || "-",
            status: data.status || "Belum Ditanggapi",
            foto: data.foto || null,
          });
        });
      });

      setRegistrants(arr);
      setFilteredRegistrants(arr);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = registrants.filter((person) =>
      person.nama.toLowerCase().includes(search.toLowerCase()) ||
      person.alamat.toLowerCase().includes(search.toLowerCase()) ||
      person.nik.toLowerCase().includes(search.toLowerCase()) ||
      person.pekerjaan.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRegistrants(filtered);
  }, [search, registrants]);

  const handleApprove = (uid, key) => update(dbRef(db, `users/${uid}/anggota/${key}`), { status: "Disetujui" });
  const handleReject = (uid, key) => update(dbRef(db, `users/${uid}/anggota/${key}`), { status: "Ditolak" });
  const handleDelete = (uid, key) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      remove(dbRef(db, `users/${uid}/anggota/${key}`));
    }
  };
  const handleEdit = (person) => setEditModal({ open: true, data: { ...person } });
  const saveEdit = () => {
    const { uid, key, nama, alamat, telpon, nik, pekerjaan } = editModal.data;
    update(dbRef(db, `users/${uid}/anggota/${key}`), { nama, alamat, telpon, nik, pekerjaan });
    setEditModal({ open: false, data: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Disetujui": return "bg-green-100 text-green-800";
      case "Ditolak": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="relative min-h-screen bg-blue-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 -z-10"></div>
      <div className="relative flex min-h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 p-2 sm:p-3 bg-blue-900 text-white rounded-lg shadow-lg z-50 hover:bg-blue-800 transition-colors text-xl sm:text-2xl"
        >
          {isOpen ? "×" : "☰"}
        </button>

        <main className={`flex-1 transition-all duration-300 ${isOpen ? "md:ml-[288px]" : "md:ml-0"} ml-0`}>
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 md:py-6 px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h2>
                <p className="text-blue-100 mt-1 text-xs sm:text-sm md:text-base">Kelola pendaftaran anggota perpustakaan</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-blue-900">
                  <User size={18} className="sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-xs sm:text-sm md:text-base">ADMIN</span>
              </div>
            </div>
          </header>

          {/* Search & Kelola */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="max-w-full mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari anggota..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <button
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap ${
                    isManageMode ? "bg-yellow-400 text-white" : "bg-blue-900 text-white"
                  } hover:opacity-90 transition-all shadow-md`}
                >
                  {isManageMode ? "Mode Kelola Aktif" : "Kelola"}
                </button>
              </div>

              {/* Table Desktop - Hidden on Mobile */}
              <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Foto</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">NIK</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Telepon</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Alamat</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Pekerjaan</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredRegistrants.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                            Belum ada data anggota
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrants.map((person, index) => (
                          <tr key={person.key} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-4 py-3">
                              {person.foto ? (
                                <img 
                                  src={person.foto} 
                                  alt="Foto" 
                                  className="w-12 h-16 object-cover border border-gray-200 rounded"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded border border-gray-200">
                                  No Foto
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{person.nama}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{person.nik}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{person.telpon}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                              <div className="line-clamp-2">{person.alamat}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{person.pekerjaan}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(person.status)}`}>
                                {person.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                {!isManageMode ? (
                                  <>
                                    <button
                                      onClick={() => handleApprove(person.uid, person.key)}
                                      disabled={person.status === "Disetujui"}
                                      className={`p-2 rounded-lg transition-all ${
                                        person.status === "Disetujui"
                                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                          : "bg-green-500 text-white hover:bg-green-600"
                                      }`}
                                      title="Setujui"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleReject(person.uid, person.key)}
                                      disabled={person.status === "Ditolak"}
                                      className={`p-2 rounded-lg transition-all ${
                                        person.status === "Ditolak"
                                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                          : "bg-red-500 text-white hover:bg-red-600"
                                      }`}
                                      title="Tolak"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEdit(person)}
                                      className="p-2 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(person.uid, person.key)}
                                      className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all"
                                      title="Hapus"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards Mobile/Tablet - Hidden on Desktop */}
              <div className="lg:hidden space-y-3 sm:space-y-4">
                {filteredRegistrants.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <p className="text-gray-500">Belum ada data anggota</p>
                  </div>
                ) : (
                  filteredRegistrants.map((person, index) => (
                    <div key={person.key} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4">
                          {/* Foto */}
                          <div className="flex-shrink-0">
                            {person.foto ? (
                              <img 
                                src={person.foto} 
                                alt="Foto" 
                                className="w-16 h-20 sm:w-20 sm:h-24 object-cover border-2 border-gray-200 rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-lg border-2 border-gray-200">
                                No Foto
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate pr-2">
                                {person.nama}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${getStatusColor(person.status)}`}>
                                {person.status}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-[11px] sm:text-xs text-gray-600 mb-3">
                              <div className="flex">
                                <span className="font-semibold text-gray-700 w-20 flex-shrink-0">NIK:</span>
                                <span className="break-all">{person.nik}</span>
                              </div>
                              <div className="flex">
                                <span className="font-semibold text-gray-700 w-20 flex-shrink-0">Telepon:</span>
                                <span>{person.telpon}</span>
                              </div>
                              <div className="flex">
                                <span className="font-semibold text-gray-700 w-20 flex-shrink-0">Alamat:</span>
                                <span className="break-words">{person.alamat}</span>
                              </div>
                              <div className="flex">
                                <span className="font-semibold text-gray-700 w-20 flex-shrink-0">Pekerjaan:</span>
                                <span>{person.pekerjaan}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {!isManageMode ? (
                                <>
                                  <button
                                    onClick={() => handleApprove(person.uid, person.key)}
                                    disabled={person.status === "Disetujui"}
                                    className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded-lg font-medium flex-1 ${
                                      person.status === "Disetujui"
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                    }`}
                                  >
                                    <Check size={12} /> Setujui
                                  </button>
                                  <button
                                    onClick={() => handleReject(person.uid, person.key)}
                                    disabled={person.status === "Ditolak"}
                                    className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded-lg font-medium flex-1 ${
                                      person.status === "Ditolak"
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                    }`}
                                  >
                                    <X size={12} /> Tolak
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(person)}
                                    className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 font-medium flex-1"
                                  >
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(person.uid, person.key)}
                                    className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded-lg bg-gray-500 text-white hover:bg-gray-600 font-medium flex-1"
                                  >
                                    <Trash2 size={12} /> Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Modal Edit */}
          {editModal.open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Edit Data Anggota</h3>
                {["nama", "alamat", "telpon", "nik", "pekerjaan"].map((field) => (
                  <div key={field} className="mb-2.5 sm:mb-3 md:mb-4">
                    <label className="block text-gray-700 font-medium mb-1 sm:mb-1.5 text-xs sm:text-sm md:text-base">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={editModal.data[field]}
                      onChange={(e) =>
                        setEditModal({
                          ...editModal,
                          data: { ...editModal.data, [field]: e.target.value },
                        })
                      }
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm md:text-base"
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
                  <button
                    onClick={() => setEditModal({ open: false, data: null })}
                    className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-lg bg-gray-300 hover:bg-gray-400 font-medium text-xs sm:text-sm md:text-base transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 font-medium text-xs sm:text-sm md:text-base transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}