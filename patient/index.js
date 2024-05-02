const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");
const app = express();
app.use(bodyParser.json());

const geekPatient = crypto.createECDH("secp521r1");
const publicKeyPatient = geekPatient.generateKeys("base64");
console.log("Patient Public Key:", publicKeyPatient);

let publicKeyDoc;
let secretKeyPatient;

async function fetchAndComputeSecret() {
  try {
    const response = await axios.get("http://localhost:3000/public-key");
    publicKeyDoc = response.data.publicKey;
    console.log("Received Doctor Public Key:", publicKeyDoc);
    secretKeyPatient = geekPatient.computeSecret(
      publicKeyDoc,
      "base64",
      "base64"
    );
    console.log("Patient Secret Key:", secretKeyPatient);
  } catch (error) {
    console.error("Error fetching public key or computing secret:", error);
  }
}

app.get("/public-key", (req, res) => {
  res.json({ publicKey: publicKeyPatient });
});

app.listen(3001, () => {
  console.log("Patient Node running on port 3001");
  setTimeout(fetchAndComputeSecret, 2000);
});
