const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());

const geekDoc = crypto.createECDH("secp521r1");
const publicKeyDoc = geekDoc.generateKeys("base64");
console.log("Doctor Public Key:", publicKeyDoc);

let publicKeyPatient;
let secretKeyDoc;

async function fetchAndComputeSecret() {
  try {
    const response = await axios.get("http://localhost:3001/public-key");
    publicKeyPatient = response.data.publicKey;
    console.log("Received Patient Public Key:", publicKeyPatient);
    secretKeyDoc = geekDoc.computeSecret(publicKeyPatient, "base64", "base64");
    console.log("Doctor Secret Key:", secretKeyDoc);
  } catch (error) {
    console.error("Error fetching public key or computing secret:", error);
  }
}

app.get("/public-key", (req, res) => {
  res.json({ publicKey: publicKeyDoc });
});

app.listen(3000, () => {
  console.log("Doctor Node running on port 3000");
  setTimeout(fetchAndComputeSecret, 2000);
});
