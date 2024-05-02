import express from "express";
import bodyParser from "body-parser";
import crypto from "crypto";
import axios from "axios";
const app = express();
app.use(bodyParser.json());

let geekPatient = crypto.createECDH("secp521r1");
let publicKeyPatient;
let publicKeyDoc;
let secretKeyPatient;

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
    console.log("Patient Public Key:", publicKeyPatient);
    console.log("Doctor Public Key:", publicKeyDoc);
    console.log("Patient Secret Key:", secretKeyPatient);
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
