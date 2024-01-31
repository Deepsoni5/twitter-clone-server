import express from "express";
import { ApolloServer } from "@apollo/server";
import bodyParser from "body-parser";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "../clients/db";
import { User } from "./user";
export async function initializeServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  const GraphQlServer = new ApolloServer({
    typeDefs: `
        ${User.types}
        type Query{
            ${User.queries}
        }
        
      `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });

  await GraphQlServer.start();

  app.use("/graphql", expressMiddleware(GraphQlServer));

  return app;
}
