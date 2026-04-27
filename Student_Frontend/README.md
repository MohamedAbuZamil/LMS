# Student_Frontend (LMS)

منصة تعليمية - الواجهة الأمامية للطلاب مبنية بـ **Next.js 14** + **React** + **TailwindCSS** بدعم RTL كامل وخط Tajawal.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح http://localhost:3000

## البناء

```bash
npm run build
npm start
```

## الهيكل

- `src/app/` - Next.js App Router (layout, page, globals.css)
- `src/components/` - مكونات الواجهة (Navbar, Hero, Stats, Categories, Courses, Features, CTA, Footer)
- `tailwind.config.ts` - ألوان العلامة التجارية والظلال

> الرسومات (Hero illustration, course covers, logo) كلها SVG داخلية، لا تحتاج صور خارجية.
