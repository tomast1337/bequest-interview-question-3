import express from "express";
import cors from "cors";

interface Database {
  data: string;
}

const createApp = (database: Database) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.get("/", (req, res) => {
    res.json(database);
  });

  app.post("/", (req, res) => {
    database.data = req.body.data;
    res.sendStatus(200);
  });

  return app;
};

export default createApp;
