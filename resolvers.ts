import { Collection, ObjectId } from "mongodb";
import { StudentModel, TeacherModel, CourseModel, Student, Teacher, Course } from "./types.ts";

export const resolvers = {
  Query: {
    students: async (_: unknown, __: unknown, { StudentsCollection }: { StudentsCollection: Collection<StudentModel> }): Promise<Student[]> => {
      const students = await StudentsCollection.find().toArray();
      return students.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    },
    student: async (_: unknown, { id }: { id: string }, { StudentsCollection }: { StudentsCollection: Collection<StudentModel> }): Promise<Student | null> => {
      const student = await StudentsCollection.findOne({ _id: new ObjectId(id) });
      return student ? { id: student._id.toString(), ...student } : null;
    },
    teachers: async (_: unknown, __: unknown, { TeachersCollection }: { TeachersCollection: Collection<TeacherModel> }): Promise<Teacher[]> => {
      const teachers = await TeachersCollection.find().toArray();
      return teachers.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    },
    teacher: async (_: unknown, { id }: { id: string }, { TeachersCollection }: { TeachersCollection: Collection<TeacherModel> }): Promise<Teacher | null> => {
      const teacher = await TeachersCollection.findOne({ _id: new ObjectId(id) });
      return teacher ? { id: teacher._id.toString(), ...teacher } : null;
    },
    courses: async (_: unknown, __: unknown, { CoursesCollection }: { CoursesCollection: Collection<CourseModel> }): Promise<Course[]> => {
      const courses = await CoursesCollection.find().toArray();
      return courses.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
    },
    course: async (_: unknown, { id }: { id: string }, { CoursesCollection }: { CoursesCollection: Collection<CourseModel> }): Promise<Course | null> => {
      const course = await CoursesCollection.findOne({ _id: new ObjectId(id) });
      return course ? { id: course._id.toString(), ...course } : null;
    },
  },
  Mutation: {
    createStudent: async (_: unknown, { name, email }: { name: string; email: string }, { StudentsCollection }: { StudentsCollection: Collection<StudentModel> }): Promise<Student> => {
      const { insertedId } = await StudentsCollection.insertOne({ name, email, enrolledCourses: [] });
      return { id: insertedId.toString(), name, email, enrolledCourses: [] };
    },
    createTeacher: async (_: unknown, { name, email }: { name: string; email: string }, { TeachersCollection }: { TeachersCollection: Collection<TeacherModel> }): Promise<Teacher> => {
      const { insertedId } = await TeachersCollection.insertOne({ name, email, coursesTaught: [] });
      return { id: insertedId.toString(), name, email, coursesTaught: [] };
    },
    createCourse: async (_: unknown, { title, description, teacherId }: { title: string; description: string; teacherId: string }, { CoursesCollection, TeachersCollection }: { CoursesCollection: Collection<CourseModel>; TeachersCollection: Collection<TeacherModel> }): Promise<Course> => {
      const teacher = await TeachersCollection.findOne({ _id: new ObjectId(teacherId) });
      if (!teacher) throw new Error("Teacher not found");
      const { insertedId } = await CoursesCollection.insertOne({ title, description, teacherId, studentIds: [] });
      await TeachersCollection.updateOne({ _id: teacher._id }, { $push: { coursesTaught: insertedId.toString() } });
      return { id: insertedId.toString(), title, description, teacherId, studentIds: [] };
    },
    enrollStudentInCourse: async (_: unknown, { studentId, courseId }: { studentId: string; courseId: string }, { StudentsCollection, CoursesCollection }: { StudentsCollection: Collection<StudentModel>; CoursesCollection: Collection<CourseModel> }): Promise<Course> => {
      const student = await StudentsCollection.findOne({ _id: new ObjectId(studentId) });
      const course = await CoursesCollection.findOne({ _id: new ObjectId(courseId) });
      if (!student || !course) throw new Error("Student or course not found");
      await StudentsCollection.updateOne({ _id: student._id }, { $push: { enrolledCourses: courseId } });
      await CoursesCollection.updateOne({ _id: course._id }, { $push: { studentIds: studentId } });
      return { id: course._id.toString(), ...course };
    },
    deleteStudent: async (_: unknown, { id }: { id: string }, { StudentsCollection }: { StudentsCollection: Collection<StudentModel> }): Promise<boolean> => {
      const result = await StudentsCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    },
  },
};