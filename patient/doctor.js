import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import axios from "axios";
import { encryptData } from "./encryption.js";
import { uploadData } from "./ipfs.js";
import { performance } from 'perf_hooks';

const app = express();
app.use(bodyParser.json());

let geekDoc = crypto.createECDH("secp521r1");
let publicKeyDoc;
let publicKeyPatient;
let secretKeyDoc;
let iv;
let cid;


async function fetchKeys() {
  try {
    const startTime = performance.now();
    const response = await axios.get("http://localhost:3002/keys/doctor");
    geekDoc.setPrivateKey(response.data.privateKey, "base64");
    publicKeyDoc = response.data.publicKey;
    publicKeyPatient = response.data.otherPublicKey;
    iv = response.data.iv;
    
    secretKeyDoc = geekDoc.computeSecret(publicKeyPatient, "base64", "base64");
    console.log("Doctor Public Key:", publicKeyDoc);
    console.log("Patient Public Key:", publicKeyPatient);
    console.log("Doctor Secret Key:", secretKeyDoc);
    
    // console.log("iv", Buffer.from(iv.data));
    let ivc = Buffer.from(iv.data);
    
    await encryptData(secretKeyDoc, ivc);
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log('Encryption Operation took ' + duration + ' milliseconds.');
    const upload = await axios.get("http://localhost:3003/upload")
    cid = upload.data;
    
  } catch (error) {
    console.error("Error fetching keys:", error);
  }
}

app.get('/cid', async(req, res) => {
  res.json({cid : cid});
})


app.get("/public-key", (req, res) => {
  res.json({ publicKey: publicKeyDoc });
});

app.listen(3000, () => {
  console.log("Doctor Node running on port 3000");
  fetchKeys();
});
