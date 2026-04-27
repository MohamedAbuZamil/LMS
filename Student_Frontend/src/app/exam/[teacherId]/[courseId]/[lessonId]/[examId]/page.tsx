"use client";
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { getCourse, getCourseContent, isLessonLocked } from "@/lib/data/courseContent";
import { buildQuestions, parseDurationMinutes } from "@/lib/data/questions";

export default function ExamRunnerPage() {
  const params = useParams<{ teacherId: string; courseId: string; lessonId: string; examId: string }>();

  const data = useMemo(() => {
    const { teacher, course } = getCourse(params.teacherId, params.courseId);
    if (!teacher || !course) return null;
    const content = getCourseContent(teacher.id, course.id);
    const lesson = content.lessons.find((l) => l.id === params.lessonId);
    if (!lesson) return null;
    if (isLessonLocked(lesson)) return null;
    const exam = lesson.exams.find((e) => e.id === params.examId);
    if (!exam) return null;
    return { teacher, course, lesson, exam };
  }, [params.teacherId, params.courseId, params.lessonId, params.examId]);

  if (!data) return notFound();
  const { teacher, course, lesson, exam } = data;

  // Build a 40-question mock bank for this exam (deterministic from id)
  const questions = useMemo(
    () => buildQuestions(exam.id, 40, exam.fullMark),
    [exam.id, exam.fullMark]
  );

  const durationMinutes = parseDurationMinutes(exam.duration);
  const backHref = `/dashboard/my-teachers/${teacher.id}/${course.id}`;
  const reviewHref = `/review/exam/${teacher.id}/${course.id}/${lesson.id}/${exam.id}`;

  return (
    <ExamRunner
      mode="exam"
      title={exam.title}
      durationMinutes={durationMinutes}
      questions={questions}
      fullMark={exam.fullMark}
      backHref={backHref}
      runnerId={`exam:${exam.id}`}
      reviewHref={reviewHref}
    />
  );
}
