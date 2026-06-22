# Employee Leave Management System

Aplikasi manajemen cuti karyawan berbasis web yang dibangun dengan Next.js 15, MongoDB Atlas, dan Tailwind CSS. Dibuat sebagai proyek praktik pada **Vibe Coding Workshop** (Juni 2026).

---

## Tentang Aplikasi

**Employee Leave Management System** adalah sistem portal terpadu untuk mengelola pengajuan dan persetujuan cuti karyawan dalam sebuah organisasi. Aplikasi ini dirancang dengan pendekatan **minimalis dan futuristik** — antarmuka bersih, tipografi tajam, dan sistem warna konsisten berbasis token desain.

### Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| **Autentikasi** | Login dengan JWT yang disimpan di HttpOnly cookie + bcrypt password hashing |
| **Role-Based Access** | Tiga role: `ADMIN`, `MANAGER`, `EMPLOYEE` dengan tampilan dan akses berbeda |
| **Manajemen Karyawan** | CRUD lengkap: tambah, lihat, edit, hapus karyawan |
| **Registrasi Karyawan** | Self-registration untuk karyawan baru (otomatis buat Employee + User account) |
| **Pengajuan Cuti** | Buat dan pantau leave request dengan 4 jenis cuti |
| **Multi-Level Approval** | Alur bertingkat: Team Lead → Check → Manager → Approve/Reject |
| **Dashboard Statistik** | Ringkasan real-time: total karyawan, pending, checked, approved, rejected |
| **Leave Balance** | Tracking sisa kuota cuti tahunan per karyawan dengan deduksi atomik |
| **Business Days** | Penghitungan hari cuti otomatis (exclude weekend & hari libur nasional Indonesia) |
| **Code Review Page** | Halaman analisis kode dengan radar chart, donut chart, findings, dan analytics |
| **Error Boundary** | React Error Boundary di root layout untuk menangkap error secara graceful |
| **Collapsible Sidebar** | Sidebar yang bisa diciutkan untuk area konten lebih luas |

### Jenis Cuti

- **Annual** — Cuti tahunan (memotong saldo cuti, dihitung hari kerja)
- **Sick** — Cuti sakit (tidak memotong saldo)
- **Maternity** — Cuti melahirkan (tidak memotong saldo)
- **Unpaid** — Cuti tanpa bayaran (tidak memotong saldo)

---

## Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Framework | Next.js 15 (App Router) | React 19, TypeScript |
| Database | MongoDB Atlas | Cloud-hosted NoSQL |
| ODM | Mongoose | Schema-based modeling |
| Auth | JWT (jose) + HttpOnly Cookie | Server-side authentication |
| Password Hashing | bcryptjs | Salt rounds: 10 |
| UI Components | shadcn/ui + Radix UI | Accessible, composable |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Forms | React Hook Form + Zod | Validated form handling |
| Font | Inter + JetBrains Mono | Google Fonts (variable) |
| Icons | Lucide React | Consistent icon set |
| Deployment | Vercel | Auto-deploy from GitHub |

---

## Arsitektur Aplikasi

```
employee-leave-system/
├── src/
│   ├── app/
│   │   ├── api/                        # Next.js API Routes (force-dynamic)
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts      # POST — autentikasi, set JWT cookie
│   │   │   │   ├── logout/route.ts     # POST — hapus cookie
│   │   │   │   ├── session/route.ts    # GET  — validasi JWT + auto-lookup employeeId
│   │   │   │   └── seed/route.ts       # POST — seed admin user pertama kali
│   │   │   ├── employees/
│   │   │   │   ├── route.ts            # GET list, POST create (+User account)
│   │   │   │   └── [id]/route.ts       # GET, PUT, DELETE per karyawan
│   │   │   └── leave/
│   │   │       ├── route.ts            # GET list, POST create (business days calc)
│   │   │       ├── [id]/route.ts       # PATCH status (approve/reject), DELETE
│   │   │       └── reset/route.ts      # POST — reset semua leave balance
│   │   ├── code-review/                # Halaman static code review analysis
│   │   ├── dashboard/page.tsx          # Dashboard statistik + leave balance
│   │   ├── employees/                  # List, Add, Edit karyawan
│   │   ├── leave/                      # List, Add cuti
│   │   ├── login/page.tsx              # Halaman login
│   │   ├── register/page.tsx           # Halaman registrasi karyawan baru
│   │   ├── layout.tsx                  # Root layout + ErrorBoundary + font
│   │   └── globals.css                 # Global styles + design tokens
│   ├── components/
│   │   ├── shared/
│   │   │   ├── AppLayout.tsx           # Layout wrapper dengan collapsible sidebar
│   │   │   ├── Navbar.tsx              # Sidebar desktop + mobile sheet
│   │   │   ├── ErrorBoundary.tsx       # React Error Boundary (class component)
│   │   │   └── ClientErrorBoundary.tsx # Client wrapper untuk server component
│   │   ├── employee/EmployeeForm.tsx   # Form karyawan (create/edit)
│   │   └── leave/LeaveForm.tsx         # Form pengajuan cuti
│   ├── constants/index.ts              # DEFAULT_ANNUAL_LEAVE_DAYS, DEPARTMENTS, POSITIONS
│   ├── hooks/
│   │   └── use-leave-requests.ts       # Hook: state + approve/reject cuti
│   ├── lib/
│   │   ├── mongodb.ts                  # Koneksi MongoDB dengan global caching
│   │   ├── holidays.ts                 # countBusinessDays + hari libur Indonesia
│   │   └── utils.ts                    # Utility functions (cn)
│   ├── models/
│   │   ├── Employee.ts                 # Schema: data karyawan
│   │   ├── User.ts                     # Schema: akun login (bcrypt hash)
│   │   └── Leave.ts                    # Schema: leave request
│   ├── services/
│   │   ├── auth-storage.ts             # Client: fetch /api/auth/*
│   │   ├── employee-storage.ts         # Client: fetch /api/employees
│   │   └── leave-storage.ts            # Client: fetch /api/leave
│   ├── types/index.ts                  # TypeScript types (Employee tanpa password)
│   └── validators/
│       ├── employee-validator.ts       # Zod: create + edit employee
│       ├── leave-validator.ts          # Zod: leave request + past-date validation
│       └── login-validator.ts          # Zod: login form
├── implementation_plan.md              # Dokumentasi implementasi lengkap
├── .env.local                          # Environment variables (tidak di-commit)
└── README.md                           # Dokumentasi ini
```

---

## Konfigurasi & Instalasi

### 1. Environment Variables

Buat file `.env.local` di root project:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secret — ganti dengan string random yang kuat di production
JWT_SECRET=your-super-secret-jwt-key
```

### 2. MongoDB Atlas Setup

1. Buat cluster di [MongoDB Atlas](https://cloud.mongodb.com)
2. Buat database user dengan akses `Read and Write`
3. Whitelist IP address (atau `0.0.0.0/0` untuk development)
4. Salin connection string ke `MONGODB_URI` di `.env.local`

### 3. Instalasi & Menjalankan

```bash
cd employee-leave-system
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`

### 4. Seed Admin User (Wajib — Pertama Kali)

Setelah dev server berjalan, jalankan seed untuk membuat akun admin:

```bash
curl -X POST http://localhost:3000/api/auth/seed
```

Atau buka URL tersebut di browser/REST client (Postman, Thunder Client, dll).

**Kredensial default:**
```
Username : admin
Password : admin123
```

> ⚠️ Ganti password setelah pertama kali login di production.

---

## Alur Penggunaan

### Sebagai Admin
1. Login dengan akun `admin`
2. Tambahkan data karyawan di menu **Employees**
3. Pantau semua leave request di menu **Leave Requests**
4. Approve atau reject request yang masuk
5. Lihat code review di menu **Code Review**

### Sebagai Manager
1. Login dengan akun Manager yang sudah didaftarkan
2. Lihat pengajuan cuti yang masuk di **Leave Requests**
3. Approve (final approval) atau reject pengajuan cuti
4. Leave balance karyawan otomatis terdeduksi saat cuti ANNUAL di-approve

### Sebagai Employee
1. **Registrasi** akun baru di halaman `/register`
2. Login dengan akun employee
3. Lihat sisa kuota cuti di **Dashboard**
4. Ajukan cuti baru di **Leave Requests → New Request**
5. Pilih jenis cuti, tanggal, approver, dan alasan
6. Hari cuti dihitung otomatis (business days, exclude weekend & libur nasional)
7. Pantau status pengajuan (PENDING → CHECKED → APPROVED/REJECTED)

---

## Alur Persetujuan Cuti (Approval Workflow)

```
Employee mengajukan cuti
        │
        ▼
   [PENDING] ─────────────────────────┐
        │                             │
   Team Lead "Check"             Manager langsung "Approve"
        │                             │
        ▼                             ▼
   [CHECKED] ──── Manager ────► [APPROVED] ──► Balance terdeduksi
        │                                      (hanya tipe ANNUAL)
        │
   Manager "Reject"
        │
        ▼
   [REJECTED]
```

- Deduksi balance menggunakan **atomic operation** (`$inc`) pada MongoDB
- Hanya cuti tipe **ANNUAL** yang memotong `leaveBalance`
- Jika cuti yang sudah APPROVED dihapus, balance otomatis di-restore

---

## API Endpoints

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/api/auth/login` | Login, set JWT HttpOnly cookie |
| `POST` | `/api/auth/logout` | Logout, hapus cookie |
| `GET`  | `/api/auth/session` | Cek session aktif + auto-lookup employeeId |
| `POST` | `/api/auth/seed` | Seed admin user (sekali saja) |
| `GET`  | `/api/employees` | List semua karyawan |
| `POST` | `/api/employees` | Tambah karyawan + buat User account |
| `GET`  | `/api/employees/:id` | Detail karyawan |
| `PUT`  | `/api/employees/:id` | Update karyawan + password |
| `DELETE` | `/api/employees/:id` | Hapus karyawan + User account |
| `GET`  | `/api/leave` | List semua leave request |
| `GET`  | `/api/leave?employeeId=x` | Leave request per karyawan |
| `POST` | `/api/leave` | Buat leave request (auto business days calc) |
| `PATCH` | `/api/leave/:id` | Update status: APPROVED/REJECTED/CHECKED |
| `DELETE` | `/api/leave/:id` | Hapus leave request + restore balance |
| `POST` | `/api/leave/reset` | Reset semua leave balance ke default |

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Authentication** | JWT + HttpOnly cookie (tidak bisa diakses dari JS/DevTools) |
| **Password** | Hashed dengan bcrypt (salt rounds: 10), tidak disimpan di client |
| **Employee Type** | Field `password` dihapus dari public type — hanya ada di server-side User model |
| **API Caching** | `force-dynamic` di semua routes — data selalu fresh dari MongoDB |
| **Error Boundary** | React Error Boundary di root layout — crash satu komponen tidak crash semua |
| **Validation** | Zod schema: past-date check, password policy, required fields |
| **Credentials** | Tidak ada hardcoded credentials di source code |

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

- Semua API routes menggunakan `export const dynamic = "force-dynamic"` untuk menghindari Next.js route caching
- TypeScript strict mode aktif — jalankan `npx tsc --noEmit` untuk cek tipe
- Implementasi detail tercatat di `implementation_plan.md`
- File `.env.local` tidak di-commit karena berisi kredensial
- Folder `.next` tidak perlu di-commit (sudah ada di `.gitignore`)

---

*Employee Leave Management System — Vibe Coding Workshop © 2026*
