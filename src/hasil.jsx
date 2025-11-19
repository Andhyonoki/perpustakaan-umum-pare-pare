import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./komponen/Sidebar";
import { Camera, Download, RotateCw } from "lucide-react";
import { auth, db } from "./komponen/firebase";
import { ref as dbRef, get } from "firebase/database";
import html2canvas from "html2canvas";

export default function HasilPendaftaran() {
  const [activeMenu, setActiveMenu] = useState("hasil");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showBack, setShowBack] = useState(false);
  const cardFrontRef = useRef();
  const cardBackRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setRegistrationStatus("failed");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(dbRef(db, `users/${user.uid}/anggota`));
        if (snapshot.exists()) {
          const anggotaObj = snapshot.val();
          const approvedEntry = Object.entries(anggotaObj).find(
            ([timestampKey, data]) => data.status === "Disetujui"
          );

          if (approvedEntry) {
            const [key, data] = approvedEntry;

            // tanggal pendaftaran dari key (asumsi timestamp dalam ms)
            const tglDaftar = new Date(parseInt(key));
            const tgl = String(tglDaftar.getDate()).padStart(2, "0");
            const bln = String(tglDaftar.getMonth() + 1).padStart(2, "0");
            const thn = tglDaftar.getFullYear() + 5;

            const berlakuHingga = `${tgl}-${bln}-${thn}`;

            setUserData({
              ...data,
              uid: user.uid,
              key,
              berlaku: berlakuHingga,
            });
            setRegistrationStatus("success");
          } else {
            setRegistrationStatus("failed");
          }
        } else {
          setRegistrationStatus("failed");
        }
      } catch (err) {
        console.error(err);
        setRegistrationStatus("failed");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!cardFrontRef.current || !cardBackRef.current || !userData) return;
    
    // Capture front
    const canvasFront = await html2canvas(cardFrontRef.current, { scale: 3 });
    const linkFront = document.createElement("a");
    linkFront.download = `${userData.nama || "kartu_anggota"}_depan.png`;
    linkFront.href = canvasFront.toDataURL();
    linkFront.click();
    
    // Small delay before capturing back
    setTimeout(async () => {
      const canvasBack = await html2canvas(cardBackRef.current, { scale: 3 });
      const linkBack = document.createElement("a");
      linkBack.download = `${userData.nama || "kartu_anggota"}_belakang.png`;
      linkBack.href = canvasBack.toDataURL();
      linkBack.click();
    }, 500);
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
          className="fixed top-4 left-4 p-2 sm:p-3 bg-blue-900 text-white rounded-lg shadow-lg z-50 text-xl sm:text-2xl"
        >
          {isOpen ? "×" : "☰"}
        </button>

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isOpen ? "md:ml-[288px]" : "md:ml-0"
          } ml-0`}
        >
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 md:py-6 px-4 md:px-8 lg:px-12 sticky top-0 z-30 shadow-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Hasil Pendaftaran</h2>
            <p className="mt-1 text-xs sm:text-sm md:text-base lg:text-lg">
              Informasi hasil verifikasi pendaftaran anggota
            </p>
          </header>

          {/* CONTENT WRAPPER */}
          <div className="p-3 sm:p-4 md:p-6 flex justify-center items-start min-h-[calc(100vh-120px)]">
            {/* LOADING */}
            {loading ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-lg p-6 sm:p-8 md:p-10 max-w-md text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-4 border-blue-700 border-t-transparent mx-auto mb-4 sm:mb-5"></div>
                <p className="text-sm sm:text-base md:text-lg text-gray-700">Memeriksa data pendaftaran...</p>
              </div>
            ) : registrationStatus === "success" && userData ? (
              <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full flex flex-col items-center max-w-6xl mx-auto">
                {/* Toggle Button */}
                <div className="text-center w-full">
                  <button
                    onClick={() => setShowBack(!showBack)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-900 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-lg"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    {showBack ? "Tampilkan Depan" : "Tampilkan Belakang"}
                  </button>
                </div>

                {/* Container kartu dengan scale responsive */}
                <div className="w-full flex justify-center px-2 sm:px-4">
                  <div className="w-full" style={{ maxWidth: "856px" }}>
                    {/* Wrapper dengan aspect ratio */}
                    <div className="w-full" style={{ aspectRatio: "856/540" }}>
                      {/* KARTU DEPAN */}
                      <div
                        ref={cardFrontRef}
                        className={`transition-opacity duration-300 ${showBack ? 'hidden' : 'block'} w-full h-full`}
                      >
                        <div className="relative w-full h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200"></div>
                        
                        {/* Geometric Patterns */}
                        <svg className="absolute top-0 right-0 w-1/2 h-full opacity-80" viewBox="0 0 400 540">
                          <polygon points="300,0 400,0 400,200" fill="#EC4899" opacity="0.3"/>
                          <polygon points="350,100 400,50 400,150" fill="#F472B6" opacity="0.4"/>
                          <polygon points="250,300 400,300 400,540 250,540" fill="#60A5FA" opacity="0.3"/>
                          <polygon points="300,400 400,400 350,540" fill="#3B82F6" opacity="0.4"/>
                          <polygon points="0,450 150,540 0,540" fill="#10B981" opacity="0.3"/>
                          <polygon points="50,480 150,540 100,540" fill="#34D399" opacity="0.4"/>
                          <polygon points="200,500 300,540 150,540" fill="#FBBF24" opacity="0.3"/>
                        </svg>

                        {/* Header */}
                        <div className="relative pt-[2%] px-[4.5%] flex items-start gap-[1.5%]">
                          {/* Logo */}
                          <div className="w-[9vw] sm:w-[7.5vw] md:w-[6vw] lg:w-[5vw] xl:w-[4.5rem] aspect-square flex items-center justify-center flex-shrink-0">
                            <img 
                              src="kotalogo.png" 
                              alt="Logo Kota Parepare" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          
                          {/* Title */}
                          <div className="flex-1 min-w-0 pt-[0.3%]">
                            <h1 className="text-[4vw] sm:text-[3.2vw] md:text-[2.4vw] lg:text-[2vw] xl:text-4xl font-extrabold text-pink-600 leading-none tracking-wide" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.02em' }}>
                              KARTU ANGGOTA
                            </h1>
                            <p className="text-[1.8vw] sm:text-[1.5vw] md:text-[1.15vw] lg:text-[0.95vw] xl:text-base font-bold text-gray-700 mt-[0.8%] uppercase tracking-tight">PERPUSTAKAAN UMUM KOTA PAREPARE</p>
                            <p className="text-[1.4vw] sm:text-[1.2vw] md:text-[0.9vw] lg:text-[0.75vw] xl:text-sm text-gray-600 mt-[0.3%]">Jl. PINGGIR LAUT, KEL. MALLUSETASI KEC. UJUNG</p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="relative mt-[3.7%] px-[4.5%] flex gap-[2.5%]">
                          {/* Photo */}
                          <div className="flex-shrink-0 ml-[1%]">
                            <div className="w-[16vw] sm:w-[13vw] md:w-[10vw] lg:w-[8.5vw] xl:w-44 aspect-[11/14] bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden border-[0.4vw] sm:border-[0.3vw] md:border-[0.25vw] lg:border-[0.23vw] xl:border-4 border-white shadow-lg">
                              {userData.foto ? (
                                <img src={userData.foto} alt="Foto" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Camera className="w-[6vw] sm:w-[5vw] md:w-[3.5vw] lg:w-[3vw] xl:w-16 h-[6vw] sm:h-[5vw] md:h-[3.5vw] lg:h-[3vw] xl:h-16 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-[1.3%] text-gray-700 min-w-0 pr-[2%]">
                            <div className="flex text-[2vw] sm:text-[1.6vw] md:text-[1.2vw] lg:text-[1vw] xl:text-lg">
                              <span className="w-[13vw] sm:w-[11vw] md:w-[8.5vw] lg:w-[7.5vw] xl:w-36 font-semibold flex-shrink-0">Nomor</span>
                              <span className="mr-[1%] flex-shrink-0">:</span>
                              <span className="font-bold truncate">{userData.key}</span>
                            </div>
                            <div className="flex text-[2vw] sm:text-[1.6vw] md:text-[1.2vw] lg:text-[1vw] xl:text-lg">
                              <span className="w-[13vw] sm:w-[11vw] md:w-[8.5vw] lg:w-[7.5vw] xl:w-36 font-semibold flex-shrink-0">Nama</span>
                              <span className="mr-[1%] flex-shrink-0">:</span>
                              <span className="font-bold uppercase truncate">{userData.nama}</span>
                            </div>
                            <div className="flex text-[2vw] sm:text-[1.6vw] md:text-[1.2vw] lg:text-[1vw] xl:text-lg">
                              <span className="w-[13vw] sm:w-[11vw] md:w-[8.5vw] lg:w-[7.5vw] xl:w-36 font-semibold flex-shrink-0">Jenis</span>
                              <span className="mr-[1%] flex-shrink-0">:</span>
                              <span className="font-semibold truncate">{userData.pekerjaan}</span>
                            </div>
                            <div className="flex text-[2vw] sm:text-[1.6vw] md:text-[1.2vw] lg:text-[1vw] xl:text-lg">
                              <span className="w-[13vw] sm:w-[11vw] md:w-[8.5vw] lg:w-[7.5vw] xl:w-36 font-semibold flex-shrink-0">Lokasi Perpustakaan</span>
                              <span className="mr-[1%] flex-shrink-0">:</span>
                              <span className="truncate">Perpustakaan Umum</span>
                            </div>
                            
                            {/* Berlaku Hingga */}
                            <div className="mt-[2.5%]! pt-[2%] border-t-[0.2vw] sm:border-t-[0.15vw] md:border-t-[0.12vw] lg:border-t-[0.11vw] xl:border-t-2 border-orange-300">
                              <p className="text-[2.2vw] sm:text-[1.8vw] md:text-[1.4vw] lg:text-[1.15vw] xl:text-xl font-bold text-gray-800">
                                Berlaku Hingga {userData.berlaku}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* KARTU BELAKANG */}
                    <div
                      ref={cardBackRef}
                      className={`transition-opacity duration-300 ${!showBack ? 'hidden' : 'block'} w-full h-full`}
                    >
                      <div className="relative w-full h-full bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl overflow-hidden p-[3.5%]">
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200"></div>
                        
                        {/* Geometric Patterns - Mirror of front */}
                        <svg className="absolute top-0 left-0 w-1/2 h-full opacity-80" viewBox="0 0 400 540">
                          <polygon points="0,0 100,0 0,200" fill="#EC4899" opacity="0.3"/>
                          <polygon points="0,50 50,100 0,150" fill="#F472B6" opacity="0.4"/>
                          <polygon points="400,450 250,540 400,540" fill="#10B981" opacity="0.3"/>
                          <polygon points="350,480 250,540 300,540" fill="#34D399" opacity="0.4"/>
                          <polygon points="200,500 100,540 250,540" fill="#FBBF24" opacity="0.3"/>
                        </svg>
                        <svg className="absolute top-0 right-0 w-1/2 h-full opacity-80" viewBox="0 0 400 540">
                          <polygon points="400,300 250,300 250,540 400,540" fill="#60A5FA" opacity="0.3"/>
                          <polygon points="300,400 400,400 350,540" fill="#3B82F6" opacity="0.4"/>
                        </svg>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col justify-center">
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg md:rounded-xl p-[2.3%] space-y-[1.5%]">
                            <ol className="space-y-[1.1%] text-gray-700 text-[1.8vw] sm:text-[1.5vw] md:text-[1.1vw] lg:text-[0.9vw] xl:text-base leading-relaxed">
                              <li>
                                <span className="font-bold">1.</span> Kartu ini adalah milik{" "}
                                <span className="font-bold text-blue-700">Perpustakaan Umum Kota Parepare</span>
                              </li>
                              <li>
                                <span className="font-bold">2.</span> Kartu ini harus selalu dibawa saat berkunjung
                              </li>
                              <li>
                                <span className="font-bold">3.</span> Kartu ini tidak dapat dipinjamkan/dipindahtangankan
                              </li>
                              <li>
                                <span className="font-bold">4.</span> Jika hilang segeralah melapor dengan melampirkan surat keterangan dari pihak berwenang
                              </li>
                              <li>
                                <span className="font-bold">5.</span> Bagi yang menemukan harap dikembalikan kepada{" "}
                                <span className="font-bold italic text-blue-700">Perpustakaan Umum Kota Parepare</span>
                              </li>
                              <li>
                                <span className="font-bold">6.</span> Informasi lebih lanjut, hubungi email :{" "}
                                <span className="font-semibold text-blue-600">layananperpusparepare@gmail.com</span>
                              </li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Download Button */}
                <div className="text-center px-3 mt-4 w-full">
                  <button
                    onClick={handleDownload}
                    className="px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 md:py-3 bg-green-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto shadow-lg"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download Kartu (Depan & Belakang)
                  </button>
                  <p className="text-white text-[10px] sm:text-xs md:text-sm mt-2">Akan mendownload 2 file: depan dan belakang</p>
                </div>
              </div>
            ) : (
              /* FAILED RESULT */
              <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-lg p-6 sm:p-8 md:p-10 max-w-md text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 mb-3">Pendaftaran gagal!</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                  Data belum di-approve oleh admin atau tidak ditemukan.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 md:py-3 bg-blue-700 text-white text-sm sm:text-base rounded-lg hover:bg-blue-800"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}