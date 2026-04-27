# LMS — مخطط العلاقات (ERD)

يُرسم باستخدام [Mermaid](https://mermaid.js.org/). يعمل مباشرة داخل GitHub والـ IDE الحديثة.

## 1) النظرة الكاملة

```mermaid
erDiagram
  USERS ||--o{ USERS : "manages (secretary)"
  USERS ||--o{ USER_PERMISSIONS : "has"
  USERS ||--o{ COURSES : "teaches"
  USERS ||--o{ QUESTION_BANKS : "owns"
  USERS ||--o{ PAYMENTS : "records"
  USERS ||--o{ MESSAGES : "sends"
  USERS ||--o{ ATTENDANCE : "marks"

  STUDENTS ||--o{ ENROLLMENTS : "has"
  STUDENTS ||--o{ VIDEO_VIEWS : "watches"
  STUDENTS ||--o{ EXAM_ATTEMPTS : "takes"
  STUDENTS ||--o{ ATTENDANCE : "tracked in"
  STUDENTS ||--o{ MESSAGES : "receives"
  STUDENTS }o--|| GRADES : "in"
  STUDENTS }o--|| GOVERNORATES : "from"

  COURSES ||--o{ LESSONS : "contains"
  COURSES ||--o{ ENROLLMENTS : "has"
  COURSES }o--|| GRADES : "for"

  LESSONS ||--o{ VIDEOS : "has"
  LESSONS ||--o{ FILES : "has"
  LESSONS ||--o{ EXAMS : "has"
  LESSONS ||--o{ ATTENDANCE : "tracked in"

  VIDEOS ||--o{ VIDEO_VIEWS : "viewed in"

  QUESTION_BANKS ||--o{ QUESTIONS : "contains"
  QUESTIONS ||--o{ QUESTION_CHOICES : "has"
  QUESTIONS ||--o{ EXAM_QUESTIONS : "used in"
  QUESTIONS ||--o{ EXAM_ANSWERS : "answered"

  EXAMS ||--o{ EXAM_QUESTIONS : "includes (manual)"
  EXAMS ||--o{ EXAM_RANDOM_RULES : "uses (random)"
  EXAMS ||--o{ EXAM_ATTEMPTS : "has attempts"
  QUESTION_BANKS ||--o{ EXAM_RANDOM_RULES : "sampled"

  EXAM_ATTEMPTS ||--o{ EXAM_ANSWERS : "has"

  ENROLLMENTS ||--o{ PAYMENTS : "receives"
```

## 2) Identity & Access

```mermaid
erDiagram
  USERS {
    bigint id PK
    user_role role
    varchar username UK
    varchar password_hash
    varchar name
    bigint manager_teacher_id FK
    boolean is_active
  }
  USER_PERMISSIONS {
    bigint id PK
    bigint user_id FK
    varchar permission_key
    bigint granted_by FK
  }
  STUDENTS {
    bigint id PK
    varchar code UK
    varchar password_hash
    varchar name
    varchar parent_phone
    smallint grade_id FK
    smallint governorate_id FK
  }
  REFRESH_TOKENS {
    bigint id PK
    bigint user_id FK
    bigint student_id FK
    varchar token_hash UK
    timestamptz expires_at
  }

  USERS ||--o{ USER_PERMISSIONS : has
  USERS ||--o{ USERS : "manages"
  USERS ||--o{ REFRESH_TOKENS : owns
  STUDENTS ||--o{ REFRESH_TOKENS : owns
```

## 3) المحتوى الأكاديمي

```mermaid
erDiagram
  COURSES {
    bigint id PK
    bigint teacher_id FK
    varchar title
    smallint grade_id FK
    numeric price_total
    numeric price_per_lesson
    date start_date
    boolean is_published
  }
  LESSONS {
    bigint id PK
    bigint course_id FK
    varchar title
    int order_index
    timestamptz scheduled_at
  }
  VIDEOS {
    bigint id PK
    bigint lesson_id FK
    varchar title
    video_server server
    text url
    int duration_sec
    int max_views
  }
  FILES {
    bigint id PK
    bigint lesson_id FK
    varchar title
    text url
  }

  COURSES ||--o{ LESSONS : contains
  LESSONS ||--o{ VIDEOS : has
  LESSONS ||--o{ FILES : has
```

## 4) الامتحانات وبنوك الأسئلة

```mermaid
erDiagram
  QUESTION_BANKS {
    bigint id PK
    bigint teacher_id FK
    varchar title
    smallint grade_id FK
  }
  QUESTIONS {
    bigint id PK
    bigint bank_id FK
    question_type type
    text text_content
    numeric score
  }
  QUESTION_CHOICES {
    bigint id PK
    bigint question_id FK
    text text_content
    boolean is_correct
  }
  EXAMS {
    bigint id PK
    bigint lesson_id FK
    varchar title
    timestamptz starts_at
    timestamptz ends_at
    smallint duration_min
    exam_visibility visibility
    exam_select_mode selection_mode
  }
  EXAM_QUESTIONS {
    bigint id PK
    bigint exam_id FK
    bigint question_id FK
    int order_index
  }
  EXAM_RANDOM_RULES {
    bigint id PK
    bigint exam_id FK
    bigint bank_id FK
    smallint count_value
    question_type question_type
  }
  EXAM_ATTEMPTS {
    bigint id PK
    bigint exam_id FK
    bigint student_id FK
    timestamptz started_at
    timestamptz submitted_at
    numeric score
    attempt_status status
  }
  EXAM_ANSWERS {
    bigint id PK
    bigint attempt_id FK
    bigint question_id FK
    bigint choice_id FK
    text answer_text
    boolean is_correct
    numeric score_awarded
  }

  QUESTION_BANKS ||--o{ QUESTIONS : contains
  QUESTIONS ||--o{ QUESTION_CHOICES : has
  EXAMS ||--o{ EXAM_QUESTIONS : "manual"
  EXAMS ||--o{ EXAM_RANDOM_RULES : "random"
  QUESTIONS ||--o{ EXAM_QUESTIONS : "picked in"
  QUESTION_BANKS ||--o{ EXAM_RANDOM_RULES : "sampled from"
  EXAMS ||--o{ EXAM_ATTEMPTS : "taken by"
  EXAM_ATTEMPTS ||--o{ EXAM_ANSWERS : has
  QUESTIONS ||--o{ EXAM_ANSWERS : "answered"
```

## 5) التسجيل والمدفوعات

```mermaid
erDiagram
  ENROLLMENTS {
    bigint id PK
    bigint student_id FK
    bigint course_id FK
    timestamptz enrolled_at
    boolean is_active
    numeric total_due
    numeric paid_total
    bigint created_by FK
  }
  PAYMENTS {
    bigint id PK
    bigint enrollment_id FK
    numeric amount
    payment_method method
    varchar reference
    bigint recorded_by FK
    timestamptz created_at
  }

  STUDENTS ||--o{ ENROLLMENTS : has
  COURSES ||--o{ ENROLLMENTS : has
  ENROLLMENTS ||--o{ PAYMENTS : receives
  USERS ||--o{ PAYMENTS : records
```

## 6) التتبّع (⭐ الحضور التلقائي)

```mermaid
erDiagram
  VIDEO_VIEWS {
    bigint id PK
    bigint student_id FK
    bigint video_id FK
    bigint lesson_id FK
    bigint course_id FK
    timestamptz started_at
    timestamptz last_watched_at
    int watched_seconds
    boolean completed
    inet ip_address
  }
  ATTENDANCE {
    bigint id PK
    bigint lesson_id FK
    bigint student_id FK
    attendance_state status
    bigint marked_by FK
    timestamptz marked_at
  }

  STUDENTS ||--o{ VIDEO_VIEWS : watches
  VIDEOS ||--o{ VIDEO_VIEWS : "viewed in"
  LESSONS ||--o{ ATTENDANCE : "tracked in"
  STUDENTS ||--o{ ATTENDANCE : "tracked in"
  USERS ||--o{ ATTENDANCE : marks
```
