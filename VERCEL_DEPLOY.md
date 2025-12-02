# 🚀 Деплой LegalMind Frontend на Vercel

Інструкція з деплою React додатку на Vercel.

---

## 📋 Передумови

1. Обліковий запис на [Vercel](https://vercel.com)
2. Git репозиторій (GitHub, GitLab або Bitbucket)
3. Vercel CLI (опціонально)

---

## 🎯 Метод 1: Через Vercel Dashboard (найпростіший)

### Крок 1: Підготовка проекту

```bash
# Переконайтеся що проект збирається локально
npm install
npm run build

# Переконайтеся що немає помилок
npm run lint
```

### Крок 2: Push до Git

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Крок 3: Імпорт проекту в Vercel

1. Відкрийте [vercel.com](https://vercel.com)
2. Натисніть **"Add New Project"**
3. Імпортуйте ваш Git репозиторій
4. Vercel автоматично визначить Vite проект

### Крок 4: Налаштування Environment Variables

У Vercel Dashboard → Settings → Environment Variables додайте:

```env
VITE_API_URL=https://your-backend-api.com
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Крок 5: Deploy

1. Натисніть **"Deploy"**
2. Чекайте ~2-3 хвилини
3. Ваш додаток буде доступний на `your-project.vercel.app`

---

## 🎯 Метод 2: Через Vercel CLI

### Крок 1: Встановлення Vercel CLI

```bash
npm install -g vercel
```

### Крок 2: Логін

```bash
vercel login
```

### Крок 3: Перший Deploy

```bash
# З кореневої папки проекту
cd C:\Users\Eugen1189\legalmind-frontend
vercel
```

Відповідайте на питання:
- **Set up and deploy?** → Yes
- **Which scope?** → Ваш аккаунт
- **Link to existing project?** → No
- **Project name?** → legalmind-frontend
- **Directory?** → `./`
- **Override settings?** → No

### Крок 4: Production Deploy

```bash
vercel --prod
```

---

## ⚙️ Автоматичний Deploy

### GitHub Integration (рекомендовано)

Після першого деплою через Dashboard:

1. **Кожен push в `main`** → автоматичний production deploy
2. **Кожен pull request** → автоматичний preview deploy
3. **Rollback** → одним кліком у Dashboard

### Налаштування гілок

У Vercel Dashboard → Settings → Git:
- **Production Branch:** `main`
- **Preview Branches:** Усі інші гілки

---

## 🔧 Конфігурація (vercel.json)

Проект вже має налаштований `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Що це робить:

- **buildCommand** — команда для збірки
- **outputDirectory** — папка з результатом збірки
- **rewrites** — SPA routing (всі роути → index.html)
- **headers** — кешування статичних файлів

---

## 🌐 Custom Domain

### Додавання власного домену

1. Vercel Dashboard → Project → Settings → Domains
2. Додайте ваш домен (наприклад, `legalmind.com`)
3. Налаштуйте DNS записи:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Чекайте верифікації (~24 години)

---

## 🔐 Environment Variables

### Локальні змінні (.env.local) - НЕ коммітити!

```env
VITE_API_URL=http://localhost:8000
```

### Production змінні (.env.production) - можна коммітити

```env
VITE_API_URL=https://api.legalmind.com
```

### Налаштування у Vercel

**Settings → Environment Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.legalmind.com` | Production |
| `VITE_API_URL` | `https://api-staging.legalmind.com` | Preview |
| `VITE_APP_VERSION` | `1.0.0` | All |

---

## 📊 Моніторинг

### Vercel Analytics

У Dashboard можна побачити:
- 📈 Відвідування
- ⚡ Швидкість завантаження
- 🌍 Географія користувачів
- 🐛 Помилки

### Логи

```bash
# Переглянути логи останнього deploy
vercel logs

# Переглянути логи production
vercel logs --prod
```

---

## 🚨 Troubleshooting

### Помилка: "Build failed"

**Рішення:**
```bash
# Перевірте локально
npm run build

# Перевірте логи у Vercel Dashboard
```

### Помилка: "404 on page refresh"

**Рішення:** Переконайтеся що `vercel.json` містить rewrites для SPA routing.

### Помилка: "Environment variables not working"

**Рішення:**
1. Змінні повинні починатися з `VITE_`
2. Додайте їх у Vercel Dashboard → Settings → Environment Variables
3. Redeploy проект

### Білий екран після deploy

**Рішення:**
```bash
# Перевірте console в браузері
# Часто проблема з шляхами до статичних файлів

# У vite.config.ts додайте:
base: './'
```

---

## 🎨 Preview Deployments

Кожен Pull Request автоматично отримує preview URL:

```
https://legalmind-frontend-git-feature-xyz.vercel.app
```

**Переваги:**
- Тестування перед мерджем
- Поділитися з командою
- Автоматичне видалення після мерджу

---

## 🔄 Rollback

Якщо щось пішло не так:

1. Vercel Dashboard → Deployments
2. Знайдіть попередню робочу версію
3. Натисніть "⋯" → "Promote to Production"

---

## 📱 Progressive Web App (PWA)

Ваш проект вже має PWA plugin. Після deploy на Vercel:

1. Відкрийте сайт на мобільному
2. З'явиться пропозиція "Add to Home Screen"
3. Додаток працюватиме як нативний

---

## ⚡ Оптимізація Performance

### 1. Кешування

Vercel автоматично кешує:
- ✅ Статичні файли (CSS, JS, зображення)
- ✅ Build результат
- ✅ CDN по всьому світу

### 2. Code Splitting

```typescript
// Lazy loading для React Router
const Chat = lazy(() => import('./pages/Chat'));
const Login = lazy(() => import('./pages/Login'));
```

### 3. Compression

Vercel автоматично використовує Brotli/Gzip компресію.

---

## 📈 Best Practices

### 1. Використовуйте Environment Variables

```typescript
// Правильно
const API_URL = import.meta.env.VITE_API_URL;

// Неправильно (хардкод)
const API_URL = 'https://api.example.com';
```

### 2. Тестуйте перед deploy

```bash
npm run build
npm run preview  # Локальний preview production збірки
```

### 3. Використовуйте Preview Deployments

- Створюйте feature branches
- Перевіряйте preview URL
- Мерджте після тестування

### 4. Моніторте метрики

- Перевіряйте Vercel Analytics
- Оптимізуйте bundle size
- Стежте за Core Web Vitals

---

## 🔗 Корисні посилання

- [Vercel Documentation](https://vercel.com/docs)
- [Vite + Vercel Guide](https://vercel.com/guides/deploying-vite-with-vercel)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

## ✅ Checklist перед deploy

- [ ] `npm run build` працює без помилок
- [ ] `npm run lint` не показує критичних помилок
- [ ] `.env.production` містить правильні URL
- [ ] `vercel.json` налаштований
- [ ] Git репозиторій створений
- [ ] Код закомічений і запушений
- [ ] Backend API доступний (CORS налаштований)

---

## 🎉 Готово!

Після deploy ваш додаток буде доступний на:

```
https://your-project.vercel.app
```

Або на власному домені:

```
https://legalmind.com
```

**Автоматичний deploy на кожен push в main гілку!** 🚀

---

**Успішного деплою!** 🎊

