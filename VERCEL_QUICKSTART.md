# ⚡ Швидкий Deploy на Vercel

## 3 простих кроки:

### 1️⃣ Перевірте що проект працює

```bash
npm install
npm run build
```

### 2️⃣ Push в Git репозиторій

```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

### 3️⃣ Deploy на Vercel

Відкрийте [vercel.com](https://vercel.com) → **Import Project** → Виберіть ваш репозиторій

**Налаштування Environment Variables в Vercel Dashboard:**

```
VITE_API_URL = https://your-backend-url.com
```

Натисніть **Deploy** ✅

---

## 🎉 Готово!

Ваш сайт буде доступний на: `https://your-project.vercel.app`

Детальні інструкції: [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

