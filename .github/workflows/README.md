# CI/CD — نشر تلقائي على Azure

كل فرونت ينشر على Azure Web App مستقل بمجرد دفع تعديل في فولدره.

## المخطط

```
git push (main)
   │
   ├── تغيير في Student_Frontend/  → deploy-student.yml  → lmszamil
   ├── تغيير في Teacher_Frontend/  → deploy-teacher.yml  → lmszamil-teacher
   └── تغيير في Admin_Frontend/    → deploy-admin.yml    → lmszamil-admin
                                          │
                                          └── يستدعي _deploy-nextjs.yml
                                               (build standalone + ZipDeploy clean)
```

## ملفات الـ Workflows

| الملف | الدور |
| --- | --- |
| `_deploy-nextjs.yml` | **Reusable** — يبني Next.js standalone وينشر على Azure (clean ZipDeploy). |
| `deploy-student.yml` | يطلق على تغييرات `Student_Frontend/` ← يستدعي الـ reusable. |
| `deploy-teacher.yml` | يطلق على تغييرات `Teacher_Frontend/` ← يستدعي الـ reusable. |
| `deploy-admin.yml`   | يطلق على تغييرات `Admin_Frontend/` ← يستدعي الـ reusable. |

## ميزات النشر

- **Path filters** — كل workflow يشتغل بس لو فولدره اتغيّر (مفيش builds غير ضرورية).
- **Standalone output** — Next.js builds بحجم أصغر بـ ~80% (server.js + minimal node_modules فقط).
- **Clean ZipDeploy** — استبدال كامل لـ `/site/wwwroot` ⇒ أيّ ملف اتشال محلياً يتشال من السيرفر تلقائياً.
- **Concurrency control** — مفيش deployments متوازية على نفس Web App (ما فيش race conditions).
- **Manual trigger** — كل workflow عنده `workflow_dispatch` فتقدر تشغّله يدوياً من تبويب Actions.

## الـ Azure Web Apps المطلوبة

| الفرونت | اسم Web App | الحالة |
| --- | --- | --- |
| Student | `lmszamil` | ✅ موجود |
| Teacher | `lmszamil-teacher` | ⏳ يلزم إنشاؤه |
| Admin   | `lmszamil-admin` | ⏳ يلزم إنشاؤه |

> الـ ٣ Web Apps المفروض على نفس **App Service Plan** (ASP-lms-xxxx) عشان السعر يفضل واحد ($13/شهر).

## الـ GitHub Secrets المطلوبة

| اسم الـ Secret | المصدر |
| --- | --- |
| `AZUREAPPSERVICE_PUBLISHPROFILE_LMSZAMIL` | `lmszamil` → Download publish profile |
| `AZUREAPPSERVICE_PUBLISHPROFILE_LMSZAMIL_TEACHER` | `lmszamil-teacher` → Download publish profile |
| `AZUREAPPSERVICE_PUBLISHPROFILE_LMSZAMIL_ADMIN` | `lmszamil-admin` → Download publish profile |

تتضاف من: **Repo → Settings → Secrets and variables → Actions → New repository secret**.

## إعدادات Azure Web App (مرة واحدة لكل Web App)

بعد ما تنشئ Web App جديد:

1. **Configuration → General settings:**
   ```
   Stack:           Node
   Major version:   Node 20 LTS
   Startup Command: npm start
   ```
2. **Configuration → Application settings:** (Environment variables)
   - `WEBSITE_NODE_DEFAULT_VERSION` = `~20`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `false` *(إحنا بنبني في GitHub Actions، Azure ما يحتاجش يبني تاني)*

## كيف تنشئ Teacher + Admin Web Apps بسرعة

```bash
# Azure CLI (لو متثبّت):
az webapp create -g lms -p ASP-lms-9de7 -n lmszamil-teacher --runtime "NODE:20-lts"
az webapp create -g lms -p ASP-lms-9de7 -n lmszamil-admin   --runtime "NODE:20-lts"

# Startup commands:
az webapp config set -g lms -n lmszamil-teacher --startup-file "npm start"
az webapp config set -g lms -n lmszamil-admin   --startup-file "npm start"
```

أو من الـ Portal: **+ Create → Web App** بنفس الـ App Service Plan الموجود.

## كيف الـ Clean Deploy بيتعامل مع ملفات اتمسحت؟

`azure/webapps-deploy@v3` بـ `clean: true` يستخدم **ZipDeploy** + `WEBSITE_RUN_FROM_PACKAGE` flow. النتيجة:

1. الـ artifact (release.zip) يحتوي **بس الملفات اللي اتبنت في الـ commit الحالي**.
2. Azure يستبدل **كامل** محتوى `/home/site/wwwroot` بمحتوى الـ zip.
3. أيّ ملف كان موجود في النشر القديم ومش موجود في الجديد ⇒ **يتشال تلقائياً**.

> ⚠️ ده يعني `wwwroot` **مش مكان للـ user uploads**. لو هتسمح برفع ملفات من المستخدمين، خزّنها في **Azure Blob Storage** مش على الـ Web App نفسه.

## Backend (لما يجي)

نضيف workflow رابع `deploy-backend.yml` بنفس النمط — يستدعي reusable workflow مماثل (هنبنيه لما نعرف stack الـ backend: Express vs NestJS vs FastAPI...).
