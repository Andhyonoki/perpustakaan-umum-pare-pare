import React, { useState, useEffect } from 'react';
import { User, Check, X } from 'lucide-react';
import { db } from './komponen/firebase';
import { ref as dbRef, onValue, update, remove } from 'firebase/database';

export default function AdminDashboard() {
  const [registrants, setRegistrants] = useState([]);

  // Ambil data dari Firebase realtime
  useEffect(() => {
    const registrantsRef = dbRef(db, 'users'); // data pendaftar tersimpan di /users
    const unsubscribe = onValue(registrantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.keys(data).map((key, index) => ({
          no: index + 1,
          uid: key,
          nama: data[key].nama,
          alamat: data[key].alamat,
          telpon: data[key].telpon,
          nik: data[key].nik,
          pekerjaan: data[key].pekerjaan,
          status: data[key].status || 'Belum Ditanggapi',
        }));
        setRegistrants(arr);
      } else {
        setRegistrants([]);
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  // Approve → ubah status
  const handleApprove = (uid) => {
    const statusRef = dbRef(db, `users/${uid}`);
    update(statusRef, { status: 'Disetujui' });
  };

  // Reject → hapus data
  const handleReject = (uid) => {
    const userRef = dbRef(db, `users/${uid}`);
    remove(userRef);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Disetujui':
        return 'bg-green-100 text-green-800';
      case 'Ditolak':
        return 'bg-red-100 text-red-800';
      case 'Ditanggapi':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">PustakaGO</h1>
            <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-900">
              <User size={24} />
            </div>
            <span className="font-semibold">ADMIN</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-6 px-8">
            <h2 className="text-3xl font-bold">Data Pendaftar</h2>
            <p className="text-blue-100 mt-1">Kelola pendaftaran anggota perpustakaan</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="py-4 px-4 text-left font-semibold">No</th>
                  <th className="py-4 px-4 text-left font-semibold">Nama</th>
                  <th className="py-4 px-4 text-left font-semibold">Alamat</th>
                  <th className="py-4 px-4 text-left font-semibold">No. Telpon</th>
                  <th className="py-4 px-4 text-left font-semibold">NIK</th>
                  <th className="py-4 px-4 text-left font-semibold">Pekerjaan</th>
                  <th className="py-4 px-4 text-left font-semibold">Status</th>
                  <th className="py-4 px-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {registrants.map((person, index) => (
                  <tr
                    key={person.uid}
                    className={`${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition-colors`}
                  >
                    <td className="py-4 px-4 font-medium">{index + 1}</td>
                    <td className="py-4 px-4 font-medium">{person.nama}</td>
                    <td className="py-4 px-4">{person.alamat}</td>
                    <td className="py-4 px-4">{person.telpon}</td>
                    <td className="py-4 px-4">{person.nik}</td>
                    <td className="py-4 px-4">{person.pekerjaan}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(person.uid)}
                          disabled={person.status === 'Disetujui'}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all ${
                            person.status === 'Disetujui'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <Check size={16} /> Setujui
                        </button>
                        <button
                          onClick={() => handleReject(person.uid)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
                        >
                          <X size={16} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex gap-8 text-sm">
              <div>
                <span className="text-gray-600">Total Pendaftar: </span>
                <span className="font-bold text-blue-900">{registrants.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Disetujui: </span>
                <span className="font-bold text-green-600">{registrants.filter(p => p.status === 'Disetujui').length}</span>
              </div>
              <div>
                <span className="text-gray-600">Ditolak: </span>
                <span className="font-bold text-red-600">{registrants.filter(p => p.status === 'Ditolak').length}</span>
              </div>
              <div>
                <span className="text-gray-600">Belum Ditanggapi: </span>
                <span className="font-bold text-yellow-600">{registrants.filter(p => p.status === 'Belum Ditanggapi').length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
