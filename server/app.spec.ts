import request from "supertest";
import createApp from "./app";
import { Express } from "express";
describe("App", () => {
  let app: Express;
  let database;

  beforeEach(() => {
    database = { data: "Hello World" };
    app = createApp(database);
  });

  test("GET / - should return the default database object", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ data: "Hello World" });
  });

  test("POST / - should update the database and return status 200", async () => {
    const newData = { data: "New Data" };
    const postResponse = await request(app).post("/").send(newData);
    expect(postResponse.statusCode).toBe(200);

    const getResponse = await request(app).get("/");
    expect(getResponse.body).toEqual(newData);
  });
});
