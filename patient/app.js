import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import axios from "axios";
import { retrieveData } from "./ipfs.js";
import { decryptData } from "./encryption.js";
import { performance } from 'perf_hooks';

const app = express();
app.use(bodyParser.json());

let geekPatient = crypto.createECDH("secp521r1");
let publicKeyPatient;
let publicKeyDoc;
let secretKeyPatient;
let iv;


async function fetchKeys() {
  try {
    
    const response = await axios.get("http://localhost:3002/keys/patient");
    geekPatient.setPrivateKey(response.data.privateKey, "base64");
    publicKeyPatient = response.data.publicKey;
    publicKeyDoc = response.data.otherPublicKey;
    secretKeyPatient = geekPatient.computeSecret(
      publicKeyDoc,
      "base64",
      "base64"
    );
    iv = response.data.iv;
    // node = response.data.node;
    console.log("Patient Public Key:", publicKeyPatient);
    console.log("Doctor Public Key:", publicKeyDoc);
    console.log("Patient Secret Key:", secretKeyPatient);
    // console.log(node);
    let ivc = Buffer.from(iv.data);
    const cid_res = await axios.get("http://localhost:3000/cid");
    const cid = cid_res.data.cid;
    console.log(cid)
    const data = {cid: cid};
    const retrieve = await axios.get("http://localhost:3003/fetch", {params:data})
    const startTime = performance.now();
    // const startTime = performance.now();
    await decryptData(secretKeyPatient, ivc);
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log('Decryption Operation took ' + duration + ' milliseconds.');

    // console.log("hello")
  } catch (error) {
    console.error("Error fetching keys:", error);
  }
}

app.get("/public-key", (req, res) => {
  res.json({ publicKey: publicKeyPatient });
});

app.listen(3001, () => {
  console.log("Patient Node running on port 3001");
  fetchKeys();
});
