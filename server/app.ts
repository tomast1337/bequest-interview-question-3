import express from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const log = console.log;

interface Database {
  data: string;
  hash: string;
  signature: string;
}

const createApp = (database: Database) => {
  const app = express();

  // Read the private and public keys from the files
  const privateKey = fs.readFileSync(
    path.resolve(__dirname, "private_key.pem"),
    "utf8"
  );
  const publicKey = fs.readFileSync(
    path.resolve(__dirname, "public_key.pem"),
    "utf8"
  );

  log("Private key: %s", privateKey);
  log("Public key: %s", publicKey);

  app.use(cors());
  app.use(express.json());

  const signData = (data: string) => {
    log("Signing data: %s", data);
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    log("Generated hash: %s", hash);
    const sign = crypto.createSign("SHA256");
    sign.update(hash);
    sign.end();
    const signature = sign.sign(privateKey, "base64");
    log("Generated signature: %s", signature);
    return { hash, signature };
  };

  const verifyData = (data: string, hash: string, signature: string) => {
    log("Verifying data: %s", data);
    const computedHash = crypto.createHash("sha256").update(data).digest("hex");
    log("Computed hash: %s", computedHash);
    if (computedHash !== hash) {
      log("Hash mismatch: %s !== %s", computedHash, hash);
      return false;
    }
    const verify = crypto.createVerify("SHA256");
    verify.update(hash);
    verify.end();
    const isValid = verify.verify(publicKey, signature, "base64");
    log("Verification result: %s", isValid);
    return isValid;
  };

  // Routes
  app.get("/", (req, res) => {
    log("GET / request received");
    res.json(database);
  });

  app.post("/", (req, res) => {
    log("POST / request received with body: %O", req.body);
    const { data } = req.body;
    const { hash, signature } = signData(data);
    database.data = data;
    database.hash = hash;
    database.signature = signature;
    log("Database updated: %O", database);
    res.sendStatus(200);
  });

  app.post("/verify", (req, res) => {
    log("POST /verify request received with body: %O", req.body);
    const { data, hash, signature } = req.body;
    const isValid = verifyData(data, hash, signature);
    if (isValid) {
      log("Data is valid");
      res.json({ message: "Data is valid" });
    } else {
      log("Data has been tampered with");
      res.status(400).json({ message: "Data has been tampered with" });
    }
  });

  app.post("/simulate-tampering", (req, res) => {
    database.data = "Tampered Data";
    res.json({ message: "Data has been tampered with" });
  });

  // 404
  app.use((req, res) => {
    log("404 Not Found: %s", req.originalUrl);
    res.status(404).json({ message: "Not found" });
  });

  return app;
};

export default createApp;
