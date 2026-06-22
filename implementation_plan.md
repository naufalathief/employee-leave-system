# Implementation Plan - Employee Leave Management System

Dokumen ini menjelaskan rencana pelaksanaan dan detail implementasi fitur-fitur baru serta perbaikan bug kritis yang telah diintegrasikan ke dalam **Employee Leave Management System**.

---

## 1. Fitur Utama & Peningkatan UI/UX

### A. Collapsible Sidebar
* **Deskripsi**: Sidebar dapat di-retract (diciutkan) secara dinamis agar area konten utama menjadi lebih luas dan tidak kaku.
* **Detail Implementasi**:
  * Menggunakan state React untuk melacak status collapse.
  * Sidebar bertransisi secara mulus menggunakan CSS transitions (`transition-all duration-300`).
  * Mencegah kelap-kelip/flicker saat berpindah halaman dengan menjaga state sidebar tetap sinkron atau kaku pada area logo saat melakukan collapse.
  * Trigger collapse diikat ke klik pada **Brand Icon/Logo Leave System** itu sendiri, sehingga navigasi terasa lebih natural tanpa menggeser/shift layout secara kasar.

### B. Expandable Table Rows (Manager View)
* **Deskripsi**: Pada tabel data cuti untuk role Manager, kolom alasan cuti yang panjang terkadang terpotong. Dibuat baris tabel yang dapat diekspansi untuk melihat detail alasan secara lengkap.
* **Detail Implementasi**:
  * Baris tabel dapat diklik untuk melakukan toggle ekspansi baris baru di bawahnya.
  * Baris ekspansi menampilkan alasan cuti secara penuh dengan format rapi tanpa merusak struktur kolom tabel utama.

### C. Icon-Only Action Buttons
* **Deskripsi**: Menghapus label teks pada tombol aksi (Actions) di tabel list data karyawan untuk role Manager agar tampilan lebih bersih (clean) dan efisien.
* **Detail Implementasi**:
  * Mengubah tombol aksi Edit dan Delete menjadi tombol berbasis ikon saja (menggunakan tooltip/aria-label untuk aksesibilitas) tanpa label teks.

### D. Date Picker Overflow Fix
* **Deskripsi**: Date picker sering terpotong (overflow hidden) ke bawah form saat memilih tanggal.
* **Detail Implementasi**:
  * Menyesuaikan penempatan date picker menggunakan react portal atau styling kontainer dengan penyesuaian z-index agar melayang di atas elemen form lainnya tanpa terpotong oleh `overflow: hidden` pada induk kontainer.

---

## 2. Perbaikan Bug Kritis & Keamanan

### A. Deduksi Kuota Cuti Otomatis (Atomic Operations)
* **Deskripsi**: Sebelumnya kuota cuti tahunan (`leaveBalance`) tidak terdeduksi secara konsisten saat Manager melakukan approval, atau tidak tersinkronisasi kembali saat request dibatalkan/dihapus/ditolak.
* **Detail Implementasi**:
  * Mengganti metode `.save()` manual pada model Mongoose menjadi operasi atomik menggunakan `Employee.findByIdAndUpdate` dengan operator `$inc` (misal: `$inc: { leaveBalance: -days }`).
  * Menyetel opsi `{ runValidators: false }` pada Mongoose update untuk menghindari kegagalan validasi schema (seperti pembatasan nilai min/max secara ketat yang dapat memblokir proses penyimpanan).
  * Memastikan deduksi kuota hanya berjalan untuk cuti tipe **ANNUAL** dan hanya dikurangi sekali saat status berubah menjadi **APPROVED** (tidak berlaku untuk SICK, MATERNITY, atau UNPAID).
  * Mengimplementasikan pemulihan kuota (restore balance) secara otomatis ketika pengajuan cuti yang sudah disetujui kemudian dihapus (DELETE) atau ditolak (REJECTED).

### B. Masalah Sinkronisasi Form Admin & Next.js Caching
* **Deskripsi**: Admin mengedit balance karyawan ke `0` atau `12` lewat form, namun di database nilainya tidak sinkron atau dashboard tetap menampilkan nilai `12` yang lama.
* **Detail Implementasi**:
  * **Next.js Route Cache**: Next.js secara default meng-cache endpoint GET static secara agresif. Ditambahkan `export const dynamic = "force-dynamic";` di bagian atas API routes (`/api/employees`, `/api/employees/[id]`, `/api/leave`, dan `/api/leave/[id]`) agar data selalu diambil dari MongoDB secara real-time.
  * **Outdated Browser JWT Cookie**: Jika session cookie JWT milik user belum diperbarui sejak penambahan relasi database, field `employeeId` tidak terisi dalam session payload JWT. Diperbaiki dengan melakukan lookup dinamis berdasarkan username pada `/api/auth/session` untuk mendapatkan `employeeId` dari database jika field tersebut kosong pada JWT cookie.

---

## 3. Hasil Pengujian Akhir
1. **Update Form Admin**: Perubahan kuota cuti karyawan melalui Admin Panel (Edit Karyawan) terbukti langsung masuk dan tersinkronisasi di MongoDB.
2. **Approval Flow**: Pengajuan cuti tipe `ANNUAL` oleh Junior Staff yang disetujui langsung oleh Manager terbukti mengurangi `leaveBalance` secara real-time di database.
3. **Dashboard Real-time**: Karyawan yang masuk (login) akan langsung melihat sisa kuota cuti tahunan yang akurat dan ter-update di dashboard mereka tanpa adanya delay caching.
