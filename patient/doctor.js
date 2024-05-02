const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());

let geekDoc = crypto.createECDH("secp521r1");
let publicKeyDoc;
let publicKeyPatient;
let secretKeyDoc;

async function fetchKeys() {
  try {
    const response = await axios.get("http://localhost:3002/keys/doctor");
    geekDoc.setPrivateKey(response.data.privateKey, "base64");
    publicKeyDoc = response.data.publicKey;
    publicKeyPatient = response.data.otherPublicKey;
    secretKeyDoc = geekDoc.computeSecret(publicKeyPatient, "base64", "base64");
    console.log("Doctor Public Key:", publicKeyDoc);
    console.log("Patient Public Key:", publicKeyPatient);
    console.log("Doctor Secret Key:", secretKeyDoc);
  } catch (error) {
    console.error("Error fetching keys:", error);
  }
}

app.get("/public-key", (req, res) => {
  res.json({ publicKey: publicKeyDoc });
});

app.listen(3000, () => {
  console.log("Doctor Node running on port 3000");
  fetchKeys();
});
