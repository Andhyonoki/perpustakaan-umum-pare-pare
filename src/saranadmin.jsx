import React, { useState, useEffect } from "react";
import { Trash2, Search } from "lucide-react";
import { db } from "./komponen/firebase";
import { ref as dbRef, onValue, remove } from "firebase/database";
import Sidebar from "./komponen/Sidebaradmin";

export default function MasukanSaran() {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const feedbackRef = dbRef(db, "saran"); // Sesuaikan nama node di Firebase
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setFeedback([]);
        setFilteredFeedback([]);
        return;
      }

      const arr = Object.keys(data).map((key) => ({
        key,
        nama: data[key].namaAnggota || "-",
        masukan: data[key].masukan || "-",
        tanggal: data[key].createdAt || "-",
      }));

      arr.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

      setFeedback(arr);
      setFilteredFeedback(arr);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = feedback.filter(
      (item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.masukan.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFeedback(filtered);
  }, [search, feedback]);

  const handleDelete = (key) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus masukan/saran ini?")) {
      remove(dbRef(db, `saran/${key}`));
    }
  };

  return (
    <div className="relative min-h-screen bg-blue-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 -z-10"></div>
      <div className="relative flex min-h-screen">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 p-2 sm:p-3 bg-blue-900 text-white rounded-lg shadow-lg z-50 hover:bg-blue-800 transition-colors text-xl sm:text-2xl"
        >
          {isOpen ? "×" : "☰"}
        </button>

        <main className={`flex-1 transition-all duration-300 ${isOpen ? "md:ml-[288px]" : "md:ml-0"} ml-0`}>
          <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 md:py-6 px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  Masukan & Saran
                </h2>
                <p className="text-blue-100 mt-1 text-xs sm:text-sm md:text-base">
                  Kelola masukan dan saran dari pengguna
                </p>
              </div>
            </div>
          </header>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="max-w-full mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau masukan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total: {filteredFeedback.length} masukan
                </div>
              </div>

              {/* Tabel Desktop */}
              <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold w-16">No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold w-48">Nama</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Masukan/Saran</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredFeedback.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                            Belum ada masukan atau saran
                          </td>
                        </tr>
                      ) : (
                        filteredFeedback.map((item, index) => (
                          <tr key={item.key} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-800">{item.nama}</td>
                            <td className="px-4 py-4 text-sm text-gray-700">{item.masukan}</td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleDelete(item.key)}
                                  className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards Mobile */}
              <div className="lg:hidden space-y-3 sm:space-y-4">
                {filteredFeedback.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <p className="text-gray-500">Belum ada masukan atau saran</p>
                  </div>
                ) : (
                  filteredFeedback.map((item, index) => (
                    <div key={item.key} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-bold">
                                #{index + 1}
                              </span>
                              <h3 className="font-bold text-sm sm:text-base text-gray-800">{item.nama}</h3>
                            </div>
                            {item.tanggal && (
                              <p className="text-[10px] sm:text-xs text-gray-500">{new Date(item.tanggal).toLocaleString()}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(item.key)}
                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all flex-shrink-0"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{item.masukan}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
