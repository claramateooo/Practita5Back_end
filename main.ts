import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { MongoClient, Collection } from "mongodb";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import { StudentModel, TeacherModel, CourseModel } from "./types.ts";

type ContextType = {
  StudentsCollection: Collection<StudentModel>;
  TeachersCollection: Collection<TeacherModel>;
  CoursesCollection: Collection<CourseModel>;
};

const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) throw new Error("Please provide a MONGO_URL");

const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();

const db = mongoClient.db("schoolManagement");
const context: ContextType = {
  StudentsCollection: db.collection<StudentModel>("students"),
  TeachersCollection: db.collection<TeacherModel>("teachers"),
  CoursesCollection: db.collection<CourseModel>("courses"),
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  context: async (): Promise<ContextType> => context,
});

console.info(`Server ready at http://localhost:4000/`);  // Asegúrate de que esté en localhost o 127.0.0.1