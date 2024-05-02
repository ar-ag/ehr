import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
const app = express();
app.use(bodyParser.json());

let geekDoc = crypto.createECDH("secp521r1");
let publicKeyDoc = geekDoc.generateKeys("base64");
let privateKeyDoc = geekDoc.getPrivateKey("base64");

let geekPatient = crypto.createECDH("secp521r1");
let publicKeyPatient = geekPatient.generateKeys("base64");
let privateKeyPatient = geekPatient.getPrivateKey("base64");

app.get("/keys/doctor", (req, res) => {
  res.json({
    publicKey: publicKeyDoc,
    otherPublicKey: publicKeyPatient,
    privateKey: privateKeyDoc,
  });
});

app.get("/keys/patient", (req, res) => {
  res.json({
    publicKey: publicKeyPatient,
    otherPublicKey: publicKeyDoc,
    privateKey: privateKeyPatient,
  });
});

app.listen(3002, () => {
  console.log("Key Server running on port 3002");
});
