"use client";
import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { AnswerKeyReview } from "@/components/exam/AnswerKeyReview";
import { getCourse, getCourseContent } from "@/lib/data/courseContent";
import {
  buildQuestions,
  generateDemoAnswers,
  loadAttempt,
  type Answer,
} from "@/lib/data/questions";

export default function AssignmentReviewPage() {
  const params = useParams<{ teacherId: string; courseId: string; lessonId: string; assignmentId: string }>();

  const data = useMemo(() => {
    const { teacher, course } = getCourse(params.teacherId, params.courseId);
    if (!teacher || !course) return null;
    const content = getCourseContent(teacher.id, course.id);
    const lesson = content.lessons.find((l) => l.id === params.lessonId);
    if (!lesson) return null;
    const assignment = lesson.assignments.find((a) => a.id === params.assignmentId);
    if (!assignment) return null;
    return { teacher, course, lesson, assignment };
  }, [params.teacherId, params.courseId, params.lessonId, params.assignmentId]);

  const questions = useMemo(() => {
    if (!data) return [];
    return buildQuestions(data.assignment.id, 10, data.assignment.fullMark);
  }, [data]);

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeSpentSec, setTimeSpentSec] = useState<number | undefined>(undefined);
  const [submittedAt, setSubmittedAt] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!data) return;
    const stored = loadAttempt(`assignment:${data.assignment.id}`);
    if (stored) {
      setAnswers(stored.answers);
      setTimeSpentSec(stored.timeSpentSec);
      setSubmittedAt(stored.submittedAt);
    } else {
      setAnswers(generateDemoAnswers(questions, data.assignment.id));
    }
  }, [data, questions]);

  if (!data) return notFound();
  const { teacher, course, assignment } = data;

  return (
    <AnswerKeyReview
      mode="assignment"
      title={assignment.title}
      questions={questions}
      answers={answers}
      fullMark={assignment.fullMark}
      durationMinutes={120}
      timeSpentSec={timeSpentSec}
      submittedAt={submittedAt}
      backHref={`/dashboard/my-teachers/${teacher.id}/${course.id}`}
    />
  );
}
