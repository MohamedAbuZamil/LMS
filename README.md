# LMS Monorepo

منصّة LMS متكاملة بثلاث واجهات منفصلة + توثيق قاعدة بيانات كامل (PostgreSQL).

## البنية

```
lms/
├─ Student_Frontend/   ← واجهة الطالب  (Next.js, port 3000)
├─ Teacher_Frontend/   ← واجهة المدرس والسكرتارية (Next.js, port 3002)
├─ Admin_Frontend/     ← واجهة الأدمن  (Next.js, port 3001)
├─ db/                 ← lms.sql (PostgreSQL — Schema + Views + Seed)
└─ docs/database/      ← README.md + schema.md + story.md + erd.md
```

## التشغيل المحلي

كل مشروع فرونت مستقل:

```powershell
cd Student_Frontend ; npm install ; npm run dev   # http://localhost:3000
cd Teacher_Frontend ; npm install ; npm run dev   # http://localhost:3002
cd Admin_Frontend   ; npm install ; npm run dev   # http://localhost:3001
```

قاعدة البيانات (Postgres 15+):

```powershell
createdb lms_dev
psql -d lms_dev -f db/lms.sql
```

## التوثيق

- **`docs/database/README.md`** — نظرة عامة + اتفاقيات + الأدوار
- **`docs/database/schema.md`** — مرجع كل جدول وعمود
- **`docs/database/story.md`** — قصة كاملة بسيناريوهات SQL لكل مرحلة
- **`docs/database/erd.md`** — مخطط Mermaid

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind + lucide-react
- **DB:** PostgreSQL 15+ (Prisma متوقّع)
- **Auth:** JWT + refresh tokens
- **i18n:** Arabic-first (RTL)
