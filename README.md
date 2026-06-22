# Employee Leave Management System

Aplikasi manajemen cuti karyawan berbasis web yang dibangun dengan Next.js 15, MongoDB Atlas, dan Tailwind CSS. Dibuat sebagai proyek praktik pada **Vibe Coding Workshop** (Juni 2026).

---

## Tentang Aplikasi

**Employee Leave Management System** adalah sistem portal terpadu untuk mengelola pengajuan dan persetujuan cuti karyawan dalam sebuah organisasi. Aplikasi ini dirancang dengan pendekatan **minimalis dan futuristik** — antarmuka bersih, tipografi tajam, dan sistem warna konsisten berbasis token desain.

### Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| **Autentikasi** | Login dengan JWT yang disimpan di HttpOnly cookie, aman dari XSS |
| **Role-Based Access** | Role `ADMIN` dan `EMPLOYEE` dengan tampilan berbeda |
| **Manajemen Karyawan** | CRUD lengkap: tambah, lihat, edit, hapus karyawan |
| **Pengajuan Cuti** | Buat dan pantau leave request dengan 4 jenis cuti |
| **Approval Workflow** | Approve/reject leave request oleh approver yang ditunjuk |
| **Dashboard Statistik** | Ringkasan real-time: total karyawan, pending, approved, rejected |
| **Leave Balance** | Tracking sisa kuota cuti tahunan per karyawan |
| **Code Review Page** | Halaman analisis kode dengan radar chart, findings, dan statistik |

### Jenis Cuti

- **Annual** — Cuti tahunan (memotong saldo cuti)
- **Sick** — Cuti sakit
- **Maternity** — Cuti melahirkan
- **Unpaid** — Cuti tanpa bayaran

---

## Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js (App Router) | 16.x |
| Database | MongoDB Atlas | Cloud |
| ODM | Mongoose | Latest |
| Auth | JWT + HttpOnly Cookie | jose |
| Password Hashing | bcryptjs | Latest |
| UI Components | Radix UI | Latest |
| Styling | Tailwind CSS | v4 |
| Forms | React Hook Form + Zod | Latest |
| Font | Inter + JetBrains Mono | Variable |
| Icons | Lucide React | Latest |

---

## Arsitektur Aplikasi

```
employee-leave-system/
├── src/
│   ├── app/
│   │   ├── api/                        # Next.js API Routes
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # POST — autentikasi, set JWT cookie
│   │   │   │   ├── logout/route.ts     # POST — hapus cookie
│   │   │   │   └── session/route.ts    # GET  — validasi JWT, kembalikan session
│   │   │   ├── employees/
│   │   │   │   ├── route.ts            # GET list, POST create
│   │   │   │   └── [id]/route.ts       # GET, PUT, DELETE per karyawan
│   │   │   ├── leave/
│   │   │   │   ├── route.ts            # GET list, POST create
│   │   │   │   └── [id]/route.ts       # PATCH status, DELETE
│   │   │   └── seed/route.ts           # POST — seed admin user pertama kali
│   │   ├── code-review/                # Halaman code review analysis
│   │   ├── dashboard/page.tsx          # Halaman dashboard statistik
│   │   ├── employees/                  # Halaman manajemen karyawan
│   │   ├── leave/                      # Halaman manajemen cuti
│   │   ├── login/page.tsx              # Halaman login (split layout)
│   │   └── layout.tsx                  # Root layout + font setup
│   ├── lib/
│   │   └── mongodb.ts                  # Koneksi MongoDB dengan global caching
│   ├── models/
│   │   ├── User.ts                     # Schema: admin user (username + bcrypt password)
│   │   ├── Employee.ts                 # Schema: data karyawan
│   │   └── LeaveRequest.ts             # Schema: leave request
│   ├── services/
│   │   ├── auth-storage.ts             # Client: fetch /api/auth/*
│   │   ├── employee-storage.ts         # Client: fetch /api/employees
│   │   └── leave-storage.ts            # Client: fetch /api/leave
│   ├── hooks/
│   │   ├── use-employees.ts            # Hook: state + CRUD karyawan
│   │   └── use-leave-requests.ts       # Hook: state + approve/reject cuti
│   ├── components/
│   │   ├── shared/
│   │   │   ├── AuthGuard.tsx           # Proteksi route — redirect jika belum login
│   │   │   ├── AppLayout.tsx           # Layout wrapper dengan sidebar
│   │   │   └── Navbar.tsx              # Sidebar desktop + mobile sheet
│   │   ├── dashboard/StatCard.tsx      # Kartu statistik dengan accent border
│   │   ├── employee/                   # EmployeeForm + EmployeeTable
│   │   └── leave/                      # LeaveForm + LeaveTable
│   ├── types/index.ts                  # TypeScript types global
│   ├── validators/                     # Zod schemas untuk form validation
│   └── constants/index.ts              # Konstanta aplikasi
├── .env.local                          # Variabel lingkungan (tidak di-commit)
├── PROMPT_HISTORY.md                   # Riwayat prompt workshop
└── README.md                           # Dokumentasi ini
```

---

## Konfigurasi

### 1. Environment Variables

Buat file `.env.local` di root project:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secret — ganti dengan string random yang kuat di production
JWT_SECRET=your-super-secret-jwt-key

# Opsional
JWT_EXPIRES_IN=7d
```

### 2. MongoDB Atlas Setup

1. Buat cluster di [MongoDB Atlas](https://cloud.mongodb.com)
2. Buat database user dengan akses `Read and Write`
3. Whitelist IP address (atau `0.0.0.0/0` untuk development)
4. Salin connection string ke `MONGODB_URI` di `.env.local`

### 3. Instalasi Dependencies

```bash
cd employee-leave-system
npm install
```

### 4. Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`

### 5. Seed Admin User (Wajib — Pertama Kali)

Setelah dev server berjalan, jalankan seed untuk membuat akun admin:

```bash
curl -X POST http://localhost:3000/api/seed
```

Atau buka URL tersebut di browser/REST client (Postman, Thunder Client, dll).

**Kredensial default:**
```
Username : admin
Password : admin123
```

> Ganti password setelah pertama kali login di production.

---

## Alur Penggunaan

### Sebagai Admin
1. Login dengan akun `admin`
2. Tambahkan data karyawan di menu **Employees**
3. Pantau semua leave request di menu **Leave Requests**
4. Approve atau reject request yang masuk

### Sebagai Employee
1. Login dengan akun employee (jika fitur employee login diaktifkan)
2. Lihat dashboard personal di **My Dashboard**
3. Ajukan cuti baru di **My Leaves → New Request**
4. Pilih employee (diri sendiri) dan approver (Manager/Director)
5. Pantau status pengajuan

---

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/auth/login` | Login, set JWT cookie |
| `POST` | `/api/auth/logout` | Logout, hapus cookie |
| `GET`  | `/api/auth/session` | Cek session aktif |
| `GET`  | `/api/employees` | List semua karyawan |
| `POST` | `/api/employees` | Tambah karyawan baru |
| `GET`  | `/api/employees/:id` | Detail karyawan |
| `PUT`  | `/api/employees/:id` | Update karyawan |
| `DELETE` | `/api/employees/:id` | Hapus karyawan |
| `GET`  | `/api/leave` | List semua leave request |
| `GET`  | `/api/leave?employeeId=x` | Leave request per karyawan |
| `POST` | `/api/leave` | Buat leave request baru |
| `PATCH` | `/api/leave/:id` | Update status (APPROVED/REJECTED) |
| `DELETE` | `/api/leave/:id` | Hapus leave request |
| `POST` | `/api/seed` | Seed admin user (sekali saja) |

---

## Design System

Aplikasi menggunakan token desain yang konsisten:

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| `--background` | `#f8fafc` | Background halaman |
| `--primary` | `#1e293b` | Warna utama (navbar, button, aktif) |
| `--border` | `#e2e8f0` | Border card dan input |
| `--text` | `#0f172a` | Warna teks utama |
| Font Sans | Inter | Body text, UI |
| Font Mono | JetBrains Mono | Angka statistik, kode |

---

## Catatan Development

- Semua perubahan dari localStorage ke MongoDB Atlas dicatat di `PROMPT_HISTORY.md`
- TypeScript strict mode aktif — jalankan `npx tsc --noEmit` untuk cek tipe
- Folder `.next` tidak perlu di-commit (sudah ada di `.gitignore`)
- File `.env.local` tidak di-commit karena berisi kredensial

---

*Employee Leave Management System — Vibe Coding Workshop © 2026*
