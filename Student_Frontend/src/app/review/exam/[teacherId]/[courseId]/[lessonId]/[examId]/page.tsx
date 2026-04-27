"use client";
import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { AnswerKeyReview } from "@/components/exam/AnswerKeyReview";
import { getCourse, getCourseContent } from "@/lib/data/courseContent";
import {
  buildQuestions,
  generateDemoAnswers,
  loadAttempt,
  parseDurationMinutes,
  type Answer,
} from "@/lib/data/questions";

export default function ExamReviewPage() {
  const params = useParams<{ teacherId: string; courseId: string; lessonId: string; examId: string }>();

  const data = useMemo(() => {
    const { teacher, course } = getCourse(params.teacherId, params.courseId);
    if (!teacher || !course) return null;
    const content = getCourseContent(teacher.id, course.id);
    const lesson = content.lessons.find((l) => l.id === params.lessonId);
    if (!lesson) return null;
    const exam = lesson.exams.find((e) => e.id === params.examId);
    if (!exam) return null;
    return { teacher, course, lesson, exam };
  }, [params.teacherId, params.courseId, params.lessonId, params.examId]);

  const questions = useMemo(() => {
    if (!data) return [];
    return buildQuestions(data.exam.id, 40, data.exam.fullMark);
  }, [data]);

  // Load saved attempt (or fall back to demo answers)
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeSpentSec, setTimeSpentSec] = useState<number | undefined>(undefined);
  const [submittedAt, setSubmittedAt] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!data) return;
    const stored = loadAttempt(`exam:${data.exam.id}`);
    if (stored) {
      setAnswers(stored.answers);
      setTimeSpentSec(stored.timeSpentSec);
      setSubmittedAt(stored.submittedAt);
    } else {
      setAnswers(generateDemoAnswers(questions, data.exam.id));
    }
  }, [data, questions]);

  if (!data) return notFound();
  const { teacher, course, exam } = data;

  return (
    <AnswerKeyReview
      mode="exam"
      title={exam.title}
      questions={questions}
      answers={answers}
      fullMark={exam.fullMark}
      durationMinutes={parseDurationMinutes(exam.duration)}
      timeSpentSec={timeSpentSec}
      submittedAt={submittedAt}
      backHref={`/dashboard/my-teachers/${teacher.id}/${course.id}`}
    />
  );
}
