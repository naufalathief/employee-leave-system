# Prompt History — Employee Leave Management System
> Vibe Coding Workshop · Jun 2026

Dokumen ini mencatat seluruh prompt/instruksi yang diberikan selama sesi pengembangan aplikasi Employee Leave Management System berbasis Next.js.

---

## Sesi 1 — Perbaikan Halaman Code Review

### Prompt 1
> *"Perubahanmu sudah betul, namun posisinya menjadi berantakan, tolong perbaiki setiap page pada setiap menu yang ada di code-review"*

**Aksi yang dilakukan:**
- Memperbaiki layout grid pada halaman `/code-review`
- Menambahkan CSS classes responsif: `.cr-nav-desktop`, `.cr-nav-mobile`, `.cr-grid-3`, `.cr-grid-2`
- Menambahkan `@media` breakpoints (≤900px, ≤600px) untuk grid responsiveness
- Mengganti `auto-fill minmax()` dengan `repeat(3, 1fr)` dan `repeat(2, 1fr)` agar kolom selalu simetris

---

### Prompt 2
> *"Pada Bagian Overview, di bagian Review sampai Repo itu tidak simetris dengan konten lain, tolong sesuaikan lagi"*

**Aksi yang dilakukan:**
- Mengubah meta info row (Reviewer, Date, App, Version, Repo) dari 5 kartu terpisah menjadi satu kartu full-width dengan `.cr-meta-strip` grid (5 kolom, divider antar item)
- Menyamakan tinggi semua card Overview menggunakan `display: flex; flexDirection: column`

---

### Prompt 3
> *"Pada Menu findings, saat menekan salah satu findings, muncul error styyling nya. Tolong Sesuaikan kembali agar tidak muncul issue"*

**Aksi yang dilakukan:**
- Mengganti `<button>` dengan `<div role="button" tabIndex={0}>` pada `FindingCard`
- Menambahkan keyboard handler (`onKeyDown`) untuk aksesibilitas
- Menambahkan CSS `[role="button"]:focus-visible` ring
- Root cause: browser default button styles (outline, background on focus/active) menimpa inline styles

---

### Prompt 4
> *"Updating a style property during rerender (border) when a conflicting property is set (borderLeft)... Bantu saya untuk melakukan fixing terhadap issue yang muncul"*

**Aksi yang dilakukan:**
- Mengganti `border` shorthand + `borderLeft` dengan empat properti individu:
  ```tsx
  borderTop:    `1px solid ...`,
  borderRight:  `1px solid ...`,
  borderBottom: `1px solid ...`,
  borderLeft:   `4px solid ${s.dot}`,
  ```
- Root cause: React memperingatkan bahwa CSS shorthand `border` konflik dengan `borderLeft` non-shorthand pada rerender

---

## Sesi 2 — Redesign UI/UX Aplikasi Utama

### Prompt 5
> *"Oke sekarang kita fokus ke Aplikasi nya. Pada Login, itu desain UI/UX nya menurut saya kurang, dan fontnya tidak enak dimata. Lalu pada Main Page nya, seperti dashboard dan menu lainnya itu menurut saya kurang. Tolong dirapikan sesuai dengan tema yang kita buat di code review, minimalis tapi futuristik"*

**Aksi yang dilakukan:**
- **Font swap**: Geist + Geist Mono → Inter + JetBrains Mono (`src/app/layout.tsx`)
- **Design token system** di `globals.css`: `--background: #f8fafc`, `--primary: #1e293b`, `--border: #e2e8f0`
- **Login page redesign**: Split layout — left dark branding panel + right white form panel
- **Navbar redesign**: Brand icon box, active nav item `bg-[#1e293b]`, user avatar dengan initials
- **StatCard redesign**: Hapus gradient, tambah 4px accent left-border per variant
- **Page headers**: Tambah `pb-6 border-b border-slate-100` pada Dashboard, Employees, Leave pages

---

### Prompt 6
> *"Base UI: A component is changing the uncontrolled value state of Select to be controlled... muncul error seperti ini pada saat menambahkan my leave request, serta pada bagian form itu approver nya masih menampilkan nilai ID, tolong sesuaikan. Dan juga pada Login Page itu lamannya menurut saya kurang enak dilihat, tolong ubah juga UI/UX nya"*

**Aksi yang dilakukan:**

**Fix React Select warning:**
- Semua `<Select>` di `LeaveForm.tsx` dibungkus dengan `<Controller>` dari React Hook Form
- `defaultValues` diset ke string kosong `""` (bukan `undefined`) agar selalu controlled
- Root cause: `value={watch("x") || undefined}` — string kosong adalah falsy, sehingga `|| undefined` mengembalikan `undefined` pada render pertama

**Fix approver menampilkan ID:**
- `SelectItem` menampilkan `{emp.name} — {emp.position}` dengan pola Controller yang benar sehingga Radix dapat mencocokkan value (ID) ke label

**Login page redesign (revisi):**
- Left panel: dot-grid overlay, glow blobs, 3 feature bullets (Users, CalendarCheck, Shield)
- Right panel: dot-grid background, white card dengan `border-radius: 16px`, custom inputs dengan 1.5px border dan focus ring

---

## Sesi 3 — Koneksi MongoDB Atlas

### Prompt 7
> *"Mas bro, bisakah kamu sambungkan database MongoDB yang saya buat pada @employee-leave-system/atlas-credentials.env ke aplikasi @employee-leave-system/ ini?"*

**Aksi yang dilakukan:**
- Membaca semua file sumber untuk memahami scope migrasi:
  - `atlas-credentials.env`, `src/types/index.ts`, `src/services/auth-storage.ts`
  - `src/services/employee-storage.ts`, `src/services/leave-storage.ts`
  - `src/constants/index.ts`, halaman-halaman terkait
- Merencanakan migrasi penuh: MongoDB Atlas + Next.js API routes + bcrypt + JWT HttpOnly cookies

---

### Prompt 8
> *"oke lanjurkan, sudah saya ubah credentialsnya"*

**Aksi yang dilakukan:**

**Setup:**
- Membuat `.env.local` dengan MongoDB URI yang benar
- Install dependencies: `mongoose`, `bcryptjs`, `jsonwebtoken`, `jose`, beserta type definitions

**Dibuat baru:**
- `src/lib/mongodb.ts` — connection utility dengan global caching untuk Next.js hot reload
- `src/models/User.ts` — Mongoose schema untuk admin user + bcrypt hash
- `src/models/Employee.ts` — Mongoose schema untuk data karyawan
- `src/models/LeaveRequest.ts` — Mongoose schema untuk leave request

**API Routes:**
- `POST /api/auth/login` — autentikasi, kembalikan JWT dalam HttpOnly cookie
- `POST /api/auth/logout` — hapus cookie
- `GET /api/auth/session` — validasi JWT, kembalikan session
- `GET /api/employees` — list semua karyawan
- `POST /api/employees` — tambah karyawan baru
- `GET /api/employees/[id]` — detail karyawan
- `PUT /api/employees/[id]` — update karyawan
- `DELETE /api/employees/[id]` — hapus karyawan
- `GET /api/leave` — list semua leave request
- `POST /api/leave` — buat leave request baru
- `PATCH /api/leave/[id]` — approve/reject leave
- `DELETE /api/leave/[id]` — hapus leave request
- `POST /api/seed` — seed admin user pertama kali

**Diupdate:**
- `src/services/auth-storage.ts` — localStorage → fetch `/api/auth/*`
- `src/services/employee-storage.ts` — localStorage → fetch `/api/employees`
- `src/services/leave-storage.ts` — localStorage → fetch `/api/leave`
- `src/hooks/use-employees.ts` — semua method menjadi async/await
- `src/hooks/use-leave-requests.ts` — semua method menjadi async/await
- `src/components/shared/AuthGuard.tsx` — cek session via API (async)
- `src/components/shared/Navbar.tsx` — session dan role check via API (async)
- `src/components/leave/LeaveForm.tsx` — load employees dan session via API (async)
- `src/components/leave/LeaveTable.tsx` — load employees dan session via API (async)
- `src/app/login/page.tsx` — onSubmit menjadi async
- `src/app/dashboard/page.tsx` — load stats dari API (async)
- `src/app/employees/page.tsx` — role check via API (async)
- `src/app/leave/page.tsx` — role check via API (async)
- `src/app/leave/new/page.tsx` — submit via API (async/try-catch)
- `src/app/register/page.tsx` — create employee via API (async)

---

### Prompt 9
> *"jalankan dev server, serta buatkan saya file prompt history dalam bentuk markdown (md) yang telah saya kalukan pada percakapan ini"*

**Aksi yang dilakukan:**
- Menjalankan dev server (`npm run dev`) di background
- Membuat file `PROMPT_HISTORY.md` ini

---

## Arsitektur Akhir

```
employee-leave-system/
├── .env.local                          # MongoDB URI + JWT secret
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── session/route.ts
│   │   │   ├── employees/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── leave/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   └── seed/route.ts
│   │   ├── code-review/
│   │   ├── dashboard/page.tsx
│   │   ├── employees/
│   │   ├── leave/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   └── mongodb.ts                  # DB connection (mongoose)
│   ├── models/
│   │   ├── Employee.ts
│   │   ├── LeaveRequest.ts
│   │   └── User.ts
│   ├── services/
│   │   ├── auth-storage.ts             # → /api/auth/*
│   │   ├── employee-storage.ts         # → /api/employees
│   │   └── leave-storage.ts            # → /api/leave
│   └── components/
│       ├── shared/
│       │   ├── AuthGuard.tsx
│       │   └── Navbar.tsx
│       ├── dashboard/StatCard.tsx
│       ├── employee/
│       └── leave/
```

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Auth | JWT + HttpOnly Cookie (`jose`) |
| Password | bcryptjs |
| UI | Tailwind CSS + Radix UI |
| Forms | React Hook Form + Zod |
| Font | Inter + JetBrains Mono |

---

*Dibuat otomatis oleh CodeBuddy Code · 11 Jun 2026*

---

### Prompt 10
> *"jalankan dev server, serta buatkan saya file prompt history dalam bentuk markdown (md) yang telah saya kalukan pada percakapan ini"*

**Aksi yang dilakukan:**
- Menjalankan dev server (`npm run dev`) di background
- Membuat file `PROMPT_HISTORY.md` ini berisi seluruh riwayat prompt dari awal sesi

---

### Prompt 11
> *"Oke, setiap saya melakukan prompting, lakukan perubahan atau penyesuaian pada isi PROMPT_HISTORY.md di file yang sama itu"*

**Aksi yang dilakukan:**
- Menyimpan instruksi ke memory (`feedback_prompt_history.md`) agar berlaku di semua sesi ke depan
- Setiap prompt baru akan ditambahkan ke file ini secara otomatis

---

### Prompt 12
> *"npm error code ENOENT ... Could not read package.json ... open 'D:\Training\Vibe Coding\package.json'"*

**Masalah:**
- Terminal berada di folder `D:\Training\Vibe Coding\` bukan di subfolder `employee-leave-system`
- npm tidak menemukan `package.json` karena direktori salah

**Solusi yang diberikan:**
```bash
cd "D:\Training\Vibe Coding\employee-leave-system"
npm run dev
```

---

### Prompt 13
> *"404 This page could not be found."*

**Masalah:**
- `/login` mengembalikan 404 meski file `src/app/login/page.tsx` ada
- Log menunjukkan error: `No link element found for chunk /_next/static/chunks/...css` — Turbopack cache korup

**Solusi yang diberikan:**
- Stop dev server
- Hapus folder `.next` (cache build)
- Restart `npm run dev` — Next.js rebuild dari awal

---

### Prompt 14
> *"bantu saya untuk melakukan stop dev server, mengapus folder .next nya"*

**Aksi yang dilakukan:**
- Temukan PID dev server di port 3000 (PID 11952) dan port 3001 (PID 30400)
- `taskkill /PID 11952 /F` dan `taskkill /PID 30400 /F` — keduanya berhasil dihentikan
- `rm -rf .next` — folder cache build berhasil dihapus
- Instruksi untuk jalankan ulang: `cd "D:\Training\Vibe Coding\employee-leave-system" && npm run dev`

---

### Prompt 15
> *"saat awal login, itu muncul error invalid username or password untuk akun admin"*

**Masalah:**
- Admin user belum ada di MongoDB Atlas — database kosong, belum pernah di-seed

**Aksi yang dilakukan:**
- Verifikasi dev server berjalan di port 3000
- Jalankan `POST /api/seed` via curl
- Response: `{"message":"Admin user created successfully"}`
- Admin user berhasil dibuat dengan username `admin` dan password `admin123` (bcrypt hash)

---

### Prompt 16
> *"untuk file README.md, tolong tambahkan isi dari summary aplikasi yang telah kita buat. Jelaskan aplikasi ini apa, lalu apa yang telah kita buat, dan konfigurasi" nya seperti apa dan bagaimana"*

**Aksi yang dilakukan:**
- Menulis ulang `README.md` dari default Next.js template menjadi dokumentasi lengkap meliputi:
  - Deskripsi aplikasi dan fitur utama
  - Tech stack dengan versi
  - Diagram arsitektur folder project
  - Panduan konfigurasi `.env.local` dan MongoDB Atlas
  - Langkah instalasi, menjalankan server, dan seed admin user
  - Alur penggunaan (Admin vs Employee)
  - Tabel semua API endpoints
  - Design system token (warna, font)
  - Catatan development

---

### Prompt 17
> *"Oke, sekarang saya ingin melakukan deployment ke Vercel, terangkan padaku apa yang harus dilakukan agar dapat melakukan deployment tersebut?"*

**Aksi yang dilakukan:**
- Menjelaskan langkah-langkah deployment ke Vercel:
  1. Push project ke GitHub (git init, commit, remote, push)
  2. Import repository di Vercel
  3. Set environment variables: `MONGODB_URI` dan `JWT_SECRET`
  4. Whitelist semua IP di MongoDB Atlas Network Access (`0.0.0.0/0`)
  5. Redeploy setelah env vars dikonfigurasi
  6. Seed admin user via `POST /api/seed` di URL production

---

### Prompt 18
> *"boleh kamu bantu untuk langkah pertamanya"*

**Aksi yang dilakukan:**
- Cek status git — semua file baru dan yang dimodifikasi sudah teridentifikasi
- Pastikan `atlas-credentials.env` tidak ikut commit (tambah ke `.gitignore`)
- `git add -A` untuk stage semua file
- Deteksi GitHub CLI (`gh`) belum terinstall
- Memberikan instruksi manual:
  1. Buat repo baru di github.com/new (tanpa README/gitignore/license)
  2. `git commit -m "feat: Employee Leave Management System with MongoDB Atlas backend"`
  3. `git remote add origin https://github.com/<username>/employee-leave-system.git`
  4. `git branch -M main && git push -u origin main`

---

### Prompt 19
> *"tolong buatkan .gitignore nya, nanti akan saya commit"*

**Aksi yang dilakukan:**
- Menulis ulang `.gitignore` dengan struktur yang lebih lengkap dan rapi:
  - Dependencies: `node_modules`, `.pnp`, `.yarn`
  - Next.js build: `.next/`, `/out/`, `/build`
  - Env files: `.env`, `.env.*`, `*.env`, `.env.local`, `atlas-credentials.env`
  - Vercel: `.vercel`
  - TypeScript: `*.tsbuildinfo`, `next-env.d.ts`
  - OS & Editor: `.DS_Store`, `Thumbs.db`, `.idea/`, `.vscode/`
  - Debug logs
- Verifikasi bahwa `atlas-credentials.env`, `.env.local`, dan `.env` semua terkena ignore rule
