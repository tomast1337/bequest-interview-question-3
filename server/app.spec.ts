import request from "supertest";
import createApp from "./app";
import { Express } from "express";
import crypto from "crypto";

describe("App", () => {
  let app: Express;
  let database;

  beforeEach(() => {
    database = { data: "Hello World", hash: "", signature: "" };
    app = createApp(database);
  });

  const signData = (data: string) => {
    const privateKey = `-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----`;
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    const sign = crypto.createSign("SHA256");
    sign.update(hash);
    sign.end();
    const signature = sign.sign(privateKey, "base64");
    return { hash, signature };
  };

  test("GET / - should return the default database object", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      data: "Hello World",
      hash: "",
      signature: "",
    });
  });

  test("POST / - should update the database and return status 200", async () => {
    const newData = { data: "New Data" };
    const { hash, signature } = signData(newData.data);
    const postResponse = await request(app).post("/").send(newData);
    expect(postResponse.statusCode).toBe(200);

    const getResponse = await request(app).get("/");
    expect(getResponse.body).toEqual({ data: "New Data", hash, signature });
  });

  test("POST /verify - should verify the data and return valid message", async () => {
    const newData = { data: "New Data" };
    const { hash, signature } = signData(newData.data);
    await request(app).post("/").send(newData);

    const verifyResponse = await request(app)
      .post("/verify")
      .send({ data: newData.data, hash, signature });
    expect(verifyResponse.statusCode).toBe(200);
    expect(verifyResponse.body).toEqual({ message: "Data is valid" });
  });

  test("POST /verify - should return error message for tampered data", async () => {
    const newData = { data: "New Data" };
    const { hash, signature } = signData(newData.data);
    await request(app).post("/").send(newData);

    const tamperedData = { data: "Tampered Data", hash, signature };
    const verifyResponse = await request(app)
      .post("/verify")
      .send(tamperedData);
    expect(verifyResponse.statusCode).toBe(400);
    expect(verifyResponse.body).toEqual({
      message: "Data has been tampered with",
    });
  });
});
