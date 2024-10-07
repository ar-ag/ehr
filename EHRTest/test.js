import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import { performance } from 'perf_hooks';
// import { createNode } from "./ipfs.js";

const app = express();
app.use(bodyParser.json());

const startTime = performance.now();
let iv = crypto.randomBytes(16)
// let node;
let geekDoc = crypto.createECDH("secp521r1");
let publicKeyDoc = geekDoc.generateKeys("base64");
let privateKeyDoc = geekDoc.getPrivateKey("base64");

let geekPatient = crypto.createECDH("secp521r1");
let publicKeyPatient = geekPatient.generateKeys("base64");
let privateKeyPatient = geekPatient.getPrivateKey("base64");

const endTime = performance.now();
const duration = endTime - startTime;

app.get("/keys/doctor", (req, res) => {
  res.json({
    publicKey: publicKeyDoc,
    otherPublicKey: publicKeyPatient,
    privateKey: privateKeyDoc,
    iv: iv,
    // node: node
  });
});

app.get("/keys/patient", (req, res) => {
  res.json({
    publicKey: publicKeyPatient,
    otherPublicKey: publicKeyDoc,
    privateKey: privateKeyPatient,
    iv:iv,
    // node:node
  });
});

app.listen(3002, () => {
  // node = await createNode();
  // console.log(node)
  console.log("Key Server running on port 3002");
  console.log('Key Generation Operation took ' + duration + ' milliseconds.');
});
