# 🔐 Expired Token Handling

## Cara Kerja

### 1️⃣ Auto-Refresh Token di Middleware

Middleware akan **otomatis refresh token** jika akan expired dalam **10 menit**:

```typescript
// middleware.ts
if (expiresAt && expiresAt - now < 600) {
  await supabase.auth.refreshSession();
}
```

### 2️⃣ Client-Side Session Monitor

`SessionMonitor` component di dashboard akan **check session setiap 5 menit**:

```typescript
// Sudah otomatis aktif di dashboard layout
<SessionMonitor />
```

### 3️⃣ Auto-Redirect pada Expired Session

Jika session expired, user akan **otomatis redirect ke login page**.

---

## 📝 Cara Pakai

### Di Client Components

Gunakan `fetchWithAuth` untuk semua API calls:

```typescript
import { fetchWithAuth, post, get } from '@/lib/fetch';

// GET request
const users = await get('/api/users');

// POST request
const result = await post('/api/auth/login', { email, password });

// Manual fetch
const response = await fetchWithAuth('/api/data');
```

### Manual Session Check

```typescript
import { validateSession } from '@/lib/session';

const { valid, user, session } = await validateSession();
if (!valid) {
  // Session expired
  redirect('/login');
}
```

---

## 🔄 Token Lifecycle

```
Login → Token diperoleh (valid 1 jam)
  ↓
Middleware check setiap request
  ↓
Jika akan expired < 10 menit → Auto refresh
  ↓
Client monitor check tiap 5 menit
  ↓
Jika expired → Redirect ke login
```

---

## ⚙️ Konfigurasi

### Ubah interval check di client

```typescript
// hooks/use-session.ts
const interval = setInterval(checkSession, 5 * 60 * 1000); // 5 menit
```

### Ubah threshold refresh di middleware

```typescript
// middleware.ts
if (expiresAt - now < 600) // 600 detik = 10 menit
```

---

## 🛡️ Security Features

✅ Auto-refresh token sebelum expired  
✅ Auto-logout jika refresh gagal  
✅ Protected routes dengan middleware  
✅ Session validation di server-side  
✅ Type-safe dengan TypeScript

---

## 📊 Files yang Terlibat

- `middleware.ts` - Auto-refresh di server
- `lib/session.ts` - Session validation utilities
- `lib/fetch.ts` - Fetch wrapper dengan retry
- `hooks/use-session.ts` - Client-side monitoring
- `components/session-monitor.tsx` - React component
- `app/api/auth/session/route.ts` - Session check API
