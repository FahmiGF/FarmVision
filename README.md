# FARMVISION — Intelligent Agriculture & Crop Optimization Platform

> **Full-Scale Precision Agriculture Architecture**  
> *AI + Computer Vision + IoT + Geospatial NDVI + Predictive Analytics + Agronomist Intelligence*

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.7-F7931E.svg)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-10B981.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Pytest-14%20Passed-16A34A.svg)]()

---

## 🌾 Ringkasan Eksekutif & Visi Produk

**FarmVision** adalah platform *Smart Agriculture* generasi terdepan yang mengintegrasikan kecerdasan buatan (*Artificial Intelligence*), *Internet of Things* (IoT), *geospatial multispectral analytics* (Sentinel-2 NDVI/NDWI), dan pemodelan prediktif untuk membantu petani, pengelola perkebunan, agronomis, serta korporasi agrikultur mengambil keputusan berbasis data secara tepat waktu.

Platform dirancang sebagai sistem *production-oriented* mencakup **24 Fase Masterplan FarmVision**, memadukan modul pengelolaan multi-lahan (*farm management*), klasifikasi penyakit daun berbasis computer vision, irigasi presisi standar FAO-56 Penman-Monteith, prakiraan hasil panen (*yield forecasting*), manajemen saprodi/inventaris, dan penugasan kerja lapangan.

---

## 🎨 Precision Agriculture Design System & Palet Warna

FarmVision mengadopsi visual identity berstandar dark-canvas pertanian modern:

| Token | Nilai Hex | Fungsi pada Platform |
| :--- | :--- | :--- |
| **Canvas Background** | `#061A14` | Deep Emerald Soil — Canvas Utama Dashboard |
| **Surface Container** | `#0B251D` | Surface Card, Table Wrapper, Modal Dialog |
| **Primary Emerald** | `#10B981` | Tombol Aksi Utama, Tab Navigasi Aktif, Status Sehat |
| **Accent Cyan** | `#06B6D4` | Modul Irigasi Air, Lengas Tanah & NDWI |
| **Warning Amber** | `#F59E0B` | Perhatian Agronomis (Defisiensi NPK, Hawar Daun Ringan) |
| **Danger Rust** | `#EF4444` | Penyakit Kritis (Antraknosa), Sensor Offline |
| **AI Violet** | `#8B5CF6` | AI Computer Vision Scanner, Asisten Cerdas RAG |
| **Neutral Slate** | `#94A3B8` | Teks Sekunder, Unit Ukuran (ha, ton, °C, %), Timestamp |

---

## 🧠 Model Kecerdasan Buatan & Matematika Agrikultur

1. **AI Plant Disease Pathology (Computer Vision)**:
   - Mengadopsi arsitektur *EfficientNet-B0* dan *MobileNetV3*.
   - Mendiagnosis penyakit tanaman tropis utama di Indonesia: Hawar Daun Dini Tomat (*Alternaria solani*), Blas Padi (*Pyricularia oryzae*), Antraknosa Cabai (*Colletotrichum gloeosporioides*), Hawar Daun Jagung (*Exserohilum turcicum*), dan Kontrol Daun Sehat.
   - Memberikan estimasi persentase keparahan jaringan daun (*Severity Index %*) dan rekomendasi Pengendalian Hama Terpadu (PHT) hayati vs kimiawi terukur.
   - Dilengkapi alur verifikasi resmi ahli agronomi (*Human-in-the-Loop Review*).

2. **Evapotranspirasi Standar FAO-56 Penman-Monteith & Irigasi Presisi**:
   $$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$
   - Mengkalkulasi kebutuhan air harian ($ET_c = ET_0 \times K_c$), kontribusi hujan efektif, dan defisit lengas tanah per petak.
   - Menghitung volume air rekomendasi dalam liter dan durasi operasi pompa irigasi.
   - Dilengkapi proteksi pompa otomatis (*auto cut-off*) dan tombol *Manual Override*.

3. **Machine Learning Crop Yield Forecasting (Ensemble XGBoost)**:
   - Memproyeksikan produktivitas ton/hektar dan total tonase panen dengan interval kepercayaan 95% (*confidence interval*).
   - Menyediakan simulator skenario interaktif (*What-If Analysis*) untuk menguji sensitivitas terhadap pH tanah, ketersediaan pupuk NPK, dan curah hujan musiman.

4. **Geospatial Sentinel-2 NDVI & NDWI Analytics**:
   - Menghasilkan visualisasi *raster heatmap* resolusi 10 meter untuk setiap petak lahan.
   - Indeks vegetasi NDVI mengukur klorofil kanopi dan mendeteksi titik stres air sebelum gejala visual tampak di mata telanjang.

---

## 👥 Modul Fitur Terintegrasi

1. **Dashboard Overview**: Ringkasan KPI eksekutif (luas lahan, petak aktif, % kesehatan tanaman, status ESP32 online, proyeksi tonase panen), widget cuaca mikro, dan antrean peringatan operasional.
2. **Farm & Field Management System**: Tata kelola multi-lahan (Subang, Lembang, Kediri), poligon batas petak, varietas tanaman, dan pencatatan fase pertumbuhan.
3. **AI Disease Scanner**: Pemindai foto daun berkecepatan tinggi, estimasi luas lesi daun, serta resep pengendalian ramah lingkungan.
4. **IoT Soil & Environmental Network**: Monitoring sensor ESP32 secara *real-time* (kelembapan, suhu, pH, NPK, EC, level baterai) dengan simulator anomali kekeringan kritis dan deteksi node *offline*.
5. **Intelligent Irrigation Prediction**: Kalkulator evapotranspirasi presisi dan jadwal jendela waktu penyiraman (*irrigation window*).
6. **Crop Yield Prediction**: Proyeksi hasil panen dengan *driver contribution bars* dan simulator *what-if*.
7. **Satellite NDVI & Geospatial Intelligence**: Peta kerapatan vegetasi multispektral satelit dan rasio air kanopi NDWI.
8. **Smart Planting Calendar & Agro-Climate**: Kalender tanam musiman Indonesia (Rendengan & Gadu), rekomendasi pergiliran tanaman, dan prakiraan cuaca 7 hari.
9. **Harvest & Operations ERP**: Buku besar hasil panen riil, sertifikasi grading mutu (Super/A/B), stok persediaan saprodi, dan penugasan kerja lapangan.
10. **Agronomist Clinical Review Center**: Tinjauan klinis diagnosis AI dan penerbitan persetujuan resep resmi.
11. **System Stress Benchmark**: Pengujian ketahanan telemetri (hingga 1.000 TPS) dengan metrik latensi p50/p95/p99.
12. **AI Agricultural Assistant (RAG Chatbot)**: Asisten cerdas dwibahasa yang terhubung langsung ke telemetri sensor dan basis pengetahuan agronomi tropis.

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan Launcher 1-Klik (Windows Batch)
Cukup klik dua kali file berikut:
```bash
Buka_FarmVision.bat
```
Peramban Anda akan otomatis membuka: **`http://127.0.0.1:8081`**

### Cara 2: Menjalankan via Terminal
1. **Backend Server**:
   ```powershell
   cd "C:\Kuliah Sisfor\Github Project\farmvision-platform\backend"
   python run.py
   ```
2. **Frontend Development Mode**:
   ```powershell
   cd "C:\Kuliah Sisfor\Github Project\farmvision-platform\frontend"
   npm run dev
   ```

---

## 🧪 Pengujian Otomatis (Automated Testing)

Uji seluruh endpoint dan logika inferensi dengan **pytest**:
```powershell
cd "C:\Kuliah Sisfor\Github Project\farmvision-platform\backend"
python -m pytest tests/ -v
```
Hasil uji: **14 passed (100% OK, 1.82 detik)**.
