"use client";
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { getCourse, getCourseContent, isLessonLocked } from "@/lib/data/courseContent";
import { buildQuestions } from "@/lib/data/questions";

export default function AssignmentRunnerPage() {
  const params = useParams<{ teacherId: string; courseId: string; lessonId: string; assignmentId: string }>();

  const data = useMemo(() => {
    const { teacher, course } = getCourse(params.teacherId, params.courseId);
    if (!teacher || !course) return null;
    const content = getCourseContent(teacher.id, course.id);
    const lesson = content.lessons.find((l) => l.id === params.lessonId);
    if (!lesson) return null;
    if (isLessonLocked(lesson)) return null;
    const assignment = lesson.assignments.find((a) => a.id === params.assignmentId);
    if (!assignment) return null;
    return { teacher, course, lesson, assignment };
  }, [params.teacherId, params.courseId, params.lessonId, params.assignmentId]);

  if (!data) return notFound();
  const { teacher, course, lesson, assignment } = data;

  // Build a smaller question set for assignments (10 questions)
  const questions = useMemo(
    () => buildQuestions(assignment.id, 10, assignment.fullMark),
    [assignment.id, assignment.fullMark]
  );

  const backHref = `/dashboard/my-teachers/${teacher.id}/${course.id}`;
  const reviewHref = `/review/assignment/${teacher.id}/${course.id}/${lesson.id}/${assignment.id}`;

  return (
    <ExamRunner
      mode="assignment"
      title={assignment.title}
      durationMinutes={120} // assignments default to 2 hours
      questions={questions}
      fullMark={assignment.fullMark}
      backHref={backHref}
      runnerId={`assignment:${assignment.id}`}
      reviewHref={reviewHref}
    />
  );
}
