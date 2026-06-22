# Implementation Plan - Employee Leave Management System

Dokumen ini menjelaskan rencana pelaksanaan dan detail implementasi fitur-fitur, arsitektur, serta perbaikan yang telah diintegrasikan ke dalam **Employee Leave Management System**.

**Repository**: [github.com/naufalathief/employee-leave-system](https://github.com/naufalathief/employee-leave-system)  
**Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, MongoDB Atlas, Mongoose, JWT (jose), bcryptjs  
**Deployment**: Vercel  

---

## 1. Arsitektur & Infrastruktur

### A. Database — MongoDB Atlas
* **Deskripsi**: Seluruh data persistence menggunakan MongoDB Atlas (cloud database) menggantikan localStorage pada versi awal.
* **Detail Implementasi**:
  * Koneksi database melalui `src/lib/mongodb.ts` menggunakan Mongoose dengan connection pooling dan caching (`global._mongoosePromise`).
  * Environment variable `MONGODB_URI` menyimpan connection string (tidak di-hardcode).
  * Tiga model Mongoose:
    * `src/models/Employee.ts` — data karyawan (name, username, email, department, position, leaveBalance).
    * `src/models/User.ts` — akun login (username, password hash, role, employeeId reference).
    * `src/models/Leave.ts` — pengajuan cuti (employeeId, approverId, type, startDate, endDate, reason, status, days).

### B. API Routes (Server-Side)
* **Deskripsi**: Seluruh operasi CRUD dilakukan melalui Next.js API Routes yang berinteraksi langsung dengan MongoDB, bukan di client-side.
* **Detail Implementasi**:
  * `src/app/api/employees/route.ts` — GET (list semua karyawan), POST (buat karyawan + akun User).
  * `src/app/api/employees/[id]/route.ts` — GET (detail), PUT (update karyawan + password), DELETE (hapus karyawan + akun User).
  * `src/app/api/leave/route.ts` — GET (list cuti, filter by employeeId), POST (buat pengajuan cuti).
  * `src/app/api/leave/[id]/route.ts` — PATCH (approve/reject/check cuti), DELETE (hapus cuti + restore balance).
  * `src/app/api/leave/reset/route.ts` — POST (reset semua leave balance ke DEFAULT_ANNUAL_LEAVE_DAYS).
  * `src/app/api/auth/login/route.ts` — POST (login dengan bcrypt verification, set JWT HttpOnly cookie).
  * `src/app/api/auth/logout/route.ts` — POST (hapus auth_token cookie).
  * `src/app/api/auth/session/route.ts` — GET (verifikasi JWT, lookup employeeId dinamis dari DB).
  * `src/app/api/auth/seed/route.ts` — POST (seed admin account jika belum ada).
  * Semua API routes menggunakan `export const dynamic = "force-dynamic"` untuk menghindari Next.js caching.

### C. Service Layer (Client-Side)
* **Deskripsi**: Client-side service layer yang berkomunikasi dengan API routes via `fetch()`.
* **Detail Implementasi**:
  * `src/services/employee-storage.ts` — CRUD karyawan (getAll, getById, create, update, delete, search).
  * `src/services/leave-storage.ts` — CRUD cuti (getAll, getById, create, updateStatus, delete, getByStatus, getByEmployeeId, getStats).
  * `src/services/auth-storage.ts` — Autentikasi (login, logout, getSession).

---

## 2. Sistem Autentikasi & Keamanan

### A. Backend Authentication (JWT + bcrypt)
* **Deskripsi**: Autentikasi dilakukan sepenuhnya di server-side menggunakan JWT dan bcrypt, menggantikan sistem localStorage pada versi awal.
* **Detail Implementasi**:
  * Password di-hash menggunakan `bcryptjs` dengan salt rounds 10 sebelum disimpan di MongoDB (model User).
  * Login menghasilkan JWT token yang ditandatangani dengan `JWT_SECRET` (environment variable) menggunakan library `jose`.
  * JWT disimpan di **HttpOnly cookie** (`auth_token`) yang tidak dapat diakses dari JavaScript/DevTools browser.
  * Cookie settings: `httpOnly: true`, `secure: true` (production), `sameSite: "lax"`, `maxAge: 86400` (24 jam).
  * Session verification di `/api/auth/session` membaca cookie, memverifikasi JWT, dan melakukan lookup `employeeId` dinamis dari database jika field tersebut kosong pada JWT payload.

### B. Role-Based Access
* **Deskripsi**: Sistem mendukung tiga role: ADMIN, MANAGER, dan EMPLOYEE.
* **Detail Implementasi**:
  * Role disimpan di model User dan dimasukkan ke JWT payload.
  * Admin dapat mengelola semua karyawan dan melihat semua data.
  * Manager dapat approve/reject pengajuan cuti.
  * Employee hanya dapat mengakses data diri sendiri dan mengajukan cuti.

### C. Admin Seed
* **Deskripsi**: Endpoint `/api/auth/seed` untuk membuat akun admin default jika belum ada di database.
* **Detail Implementasi**:
  * Membuat User dengan username `admin`, password di-hash dengan bcrypt, dan role `ADMIN`.
  * Endpoint ini hanya membuat akun jika belum ada user dengan username `admin`.

---

## 3. Fitur Utama & Peningkatan UI/UX

### A. Collapsible Sidebar
* **Deskripsi**: Sidebar dapat di-retract (diciutkan) secara dinamis agar area konten utama menjadi lebih luas.
* **Detail Implementasi**:
  * Menggunakan `useState` di `AppLayout` (`src/components/shared/AppLayout.tsx`) untuk melacak status collapse.
  * Sidebar bertransisi secara mulus menggunakan CSS transitions (`transition-[width] duration-300`).
  * Lebar sidebar: 256px (expanded) → 64px (collapsed).
  * Padding pada NavLink dan tombol Logout dibuat **statis** untuk mencegah layout shift/flicker saat collapse.
  * Trigger collapse diikat ke klik pada **Brand Icon/Logo** itu sendiri.

### B. Expandable Table Rows (Manager View)
* **Deskripsi**: Pada tabel data cuti untuk role Manager, baris tabel dapat diekspansi untuk melihat detail alasan cuti secara lengkap.
* **Detail Implementasi**:
  * Baris tabel dapat diklik untuk toggle ekspansi baris detail di bawahnya.
  * Baris ekspansi menampilkan alasan cuti secara penuh tanpa merusak struktur kolom tabel utama.

### C. Icon-Only Action Buttons
* **Deskripsi**: Tombol aksi (Edit, Delete) di tabel list karyawan menggunakan ikon saja tanpa label teks.
* **Detail Implementasi**:
  * Tombol menggunakan tooltip/`aria-label` untuk aksesibilitas.

### D. Date Picker Overflow Fix
* **Deskripsi**: Date picker yang sebelumnya terpotong (overflow hidden) sudah diperbaiki.
* **Detail Implementasi**:
  * Menggunakan z-index dan penempatan yang tepat agar calendar melayang di atas elemen form lainnya.

### E. Halaman Dashboard
* **Deskripsi**: Dashboard menampilkan ringkasan data cuti dan sisa kuota cuti karyawan.
* **Detail Implementasi**:
  * Menampilkan statistik: total cuti pending, checked, approved, rejected.
  * Menampilkan sisa leave balance karyawan yang sedang login.
  * Data diambil real-time dari API (bukan cached).

### F. Halaman Registrasi Karyawan
* **Deskripsi**: Form registrasi mandiri untuk karyawan baru.
* **Detail Implementasi**:
  * Halaman `/register` dengan form: Full Name, Username, Email, Password, Department, Position.
  * Validasi username unik sebelum submit.
  * Membuat Employee + User account sekaligus melalui API.
  * Redirect ke halaman login setelah berhasil.

### G. Halaman Login
* **Deskripsi**: Login page dengan desain modern dan responsif.
* **Detail Implementasi**:
  * Form login dengan username dan password.
  * Toggle show/hide password.
  * Validasi menggunakan Zod schema (`src/validators/login-validator.ts`).
  * Redirect ke dashboard setelah login berhasil.

### H. Halaman Code Review (Static)
* **Deskripsi**: Halaman yang menampilkan hasil static code review lengkap dengan visualisasi.
* **Detail Implementasi**:
  * Tiga tab: Overview, Findings, Analytics.
  * **Overview**: Radar chart, donut chart, health score, summary table, conclusion box.
  * **Findings**: Filter by category dan severity, expandable finding cards dengan code snippets.
  * **Analytics**: Radar chart, score breakdown, risk summary cards.
  * Semua 17 findings telah di-update dengan status ✅ FIXED beserta deskripsi before/after.
  * Header badge: "ALL RESOLVED" (hijau), conclusion box: "All Issues Resolved" (hijau).

---

## 4. Penghitungan Hari Cuti — Business Days & Hari Libur Indonesia

### A. Shared Utility `countBusinessDays`
* **Deskripsi**: Fungsi shared untuk menghitung hari cuti yang memperhitungkan hari kerja (exclude weekend) dan hari libur nasional Indonesia.
* **Detail Implementasi**:
  * File: `src/lib/holidays.ts`.
  * Menghitung hanya hari kerja (Senin-Jumat), mengecualikan Sabtu-Minggu.
  * Mengecualikan hari libur nasional Indonesia tahun 2025-2026 (termasuk Idul Fitri, Natal, Tahun Baru, dll).
  * Digunakan di `src/components/leave/LeaveForm.tsx` dan `src/app/api/leave/route.ts`.
  * Menggantikan fungsi `calculateDays` yang sebelumnya duplikat di dua file (fix DRY principle).

---

## 5. Alur Persetujuan Cuti (Approval Workflow)

### A. Multi-Level Approval
* **Deskripsi**: Sistem approval cuti bertingkat dengan status PENDING → CHECKED → APPROVED/REJECTED.
* **Detail Implementasi**:
  * **Team Lead**: Dapat melakukan "Check" pada pengajuan cuti (status: PENDING → CHECKED), lalu forward ke Manager.
  * **Manager**: Dapat melakukan approval final (CHECKED → APPROVED) atau langsung approve dari PENDING.
  * **Reject**: Team Lead dan Manager dapat menolak pengajuan cuti kapan saja.
  * Status yang tersedia: `PENDING`, `CHECKED`, `APPROVED`, `REJECTED`.

### B. Deduksi Kuota Cuti Otomatis (Atomic Operations)
* **Deskripsi**: Kuota cuti tahunan (`leaveBalance`) terdeduksi secara konsisten saat approval.
* **Detail Implementasi**:
  * Menggunakan operasi atomik Mongoose `Employee.findByIdAndUpdate` dengan operator `$inc` (misal: `$inc: { leaveBalance: -days }`).
  * Opsi `{ runValidators: false }` untuk menghindari kegagalan validasi schema min/max.
  * Deduksi kuota hanya berlaku untuk cuti tipe **ANNUAL** saat status berubah ke **APPROVED**.
  * Pemulihan kuota (restore balance) otomatis ketika cuti yang sudah disetujui kemudian dihapus (DELETE).
  * Console logging untuk setiap operasi deduksi/restore balance.

---

## 6. Perbaikan Bug & Keamanan (Code Review Fixes)

### A. SEC-01: Hardcoded Credentials Dihapus
* `AUTH_CREDENTIALS` (username: "admin", password: "admin123") dihapus dari `src/constants/index.ts`.
* Autentikasi admin sekarang menggunakan bcrypt hash di MongoDB via `/api/auth/login`.

### B. MAINT-02: Magic Number Diganti Named Constant
* Angka `12` untuk default leave balance diganti dengan konstanta `DEFAULT_ANNUAL_LEAVE_DAYS` di `src/constants/index.ts`.
* Konstanta digunakan di 9 file: API routes, dashboard, employee form, leave form, edit page, reset route.
* Mongoose schema dan Zod validator tetap menggunakan literal `12` (requirement library) dengan komentar referensi.

### C. TYPE-02: Password Dihapus dari Public Employee Type
* Field `password` dihapus dari type `Employee` di `src/types/index.ts`.
* Password hanya ada di server-side User model (di-hash dengan bcrypt).
* Service layer (`create`, `update`) menggunakan extended type `Omit<Employee, "id"> & { password?: string }` untuk mengirim password ke API.

### D. VAL-02: Past Date Validation pada Leave Request
* Ditambahkan `.refine()` di `src/validators/leave-validator.ts` yang memvalidasi `startDate >= hari ini`.
* Error message: "Start date cannot be in the past".

### E. ERR-02: React Error Boundary
* `src/components/shared/ErrorBoundary.tsx` — Class component Error Boundary.
* `src/components/shared/ClientErrorBoundary.tsx` — Client wrapper untuk digunakan di server component layout.
* Dipasang di `src/app/layout.tsx` membungkus `{children}`.
* Menampilkan fallback UI dengan tombol "Try Again" jika terjadi error.

### F. Next.js API Caching Fix
* Ditambahkan `export const dynamic = "force-dynamic"` di semua API routes.
* Memastikan data selalu diambil fresh dari MongoDB, tidak menggunakan Next.js route cache.

### G. Session Auto-Lookup
* `/api/auth/session` melakukan lookup `employeeId` dinamis dari database berdasarkan username jika field tersebut kosong pada JWT payload.
* Memperbaiki bug session login lama yang tidak memiliki `employeeId`.

### H. Sidebar Flicker Fix
* Padding pada NavLink dan tombol Logout di `src/components/shared/Navbar.tsx` dibuat statis (tidak berubah saat collapse).
* Mencegah layout shift/flicker saat sidebar berpindah antara expanded dan collapsed.

---

## 7. Validasi & Type Safety

### A. Zod Validators
* `src/validators/employee-validator.ts` — Schema untuk create (`employeeSchema`) dan edit (`employeeEditSchema`) karyawan. Password wajib saat create, opsional saat edit.
* `src/validators/leave-validator.ts` — Schema pengajuan cuti dengan validasi: endDate > startDate, startDate >= today.
* `src/validators/login-validator.ts` — Schema login (username dan password required).

### B. TypeScript Types
* `src/types/index.ts` — Definisi type: `Employee` (tanpa password), `LeaveRequest`, `LeaveStatus`, `LeaveType`, `AuthSession`, `UserRole`.
* `useState<AuthSession | null>(null)` digunakan di semua komponen (bukan `useState<any>`).

---

## 8. Struktur Folder Aplikasi

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # login, logout, session, seed
│   │   ├── employees/     # CRUD karyawan
│   │   └── leave/         # CRUD cuti + reset balance
│   ├── code-review/       # Halaman static code review
│   ├── dashboard/         # Dashboard utama
│   ├── employees/         # List, Add, Edit karyawan
│   ├── leave/             # List, Add cuti
│   ├── login/             # Halaman login
│   ├── register/          # Halaman registrasi
│   ├── layout.tsx         # Root layout + ErrorBoundary
│   └── globals.css        # Global styles
├── components/
│   ├── employee/          # EmployeeForm
│   ├── leave/             # LeaveForm
│   ├── shared/            # AppLayout, Navbar, ErrorBoundary
│   └── ui/                # shadcn/ui components
├── constants/             # DEFAULT_ANNUAL_LEAVE_DAYS, DEPARTMENTS, POSITIONS
├── hooks/                 # useLeaveRequests custom hook
├── lib/                   # mongodb.ts, holidays.ts, utils.ts
├── models/                # Employee, User, Leave (Mongoose)
├── services/              # employee-storage, leave-storage, auth-storage
├── types/                 # TypeScript type definitions
└── validators/            # Zod schemas
```

---

## 9. Hasil Pengujian & Status Deployment

1. **Update Form Admin**: Perubahan kuota cuti karyawan melalui Admin Panel (Edit Karyawan) langsung tersinkronisasi di MongoDB.
2. **Approval Flow**: Pengajuan cuti tipe ANNUAL yang disetujui oleh Manager mengurangi `leaveBalance` secara real-time di database menggunakan atomic operations.
3. **Dashboard Real-time**: Karyawan yang login langsung melihat sisa kuota cuti tahunan yang akurat tanpa delay caching.
4. **Code Review**: Semua 17 findings dari code review awal telah diperbaiki dan diperbarui di halaman code review.
5. **Security**: Autentikasi menggunakan JWT + HttpOnly cookie + bcrypt. Tidak ada hardcoded credentials di source code.
6. **Deployment**: Aplikasi berhasil di-deploy di Vercel dengan auto-deploy dari GitHub repository.
