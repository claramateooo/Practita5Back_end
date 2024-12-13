export type StudentModel = {
  name: string;
  email: string;
  enrolledCourses: string[];
};

export type TeacherModel = {
  name: string;
  email: string;
  coursesTaught: string[];
};

export type CourseModel = {
  title: string;
  description: string;
  teacherId: string;
  studentIds: string[];
};

export type Student = StudentModel & { id: string };
export type Teacher = TeacherModel & { id: string };
export type Course = CourseModel & { id: string };