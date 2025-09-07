import express, { response } from "express";
import crypto from "crypto";
import { MlKem768 } from "mlkem"; 
import axios from "axios";
import { encryptData } from "./encryption.js";
import { performance } from 'perf_hooks';

const app = express();
app.use(express.json());
const PORT = 4000;

let skR; // Private key
let ssR; // Shared secret (doctor's copy)
let iv = crypto.randomBytes(16);
let cid;
// Step 1: Doctor generates a key pair (pkR, skR)
app.get("/generateKeyPair", async (req, res) => {
  const doctor = new MlKem768();
  const [pkR, skRLocal] = await doctor.generateKeyPair();
  console.log(typeof(pkR));
  skR = skRLocal;
  console.log("Doctor generated key pair");
  res.send({ pkR, iv });
});

// async function generateKeyPair() {
//     const doctor = new MlKem768();
//     const [pkR, skRLocal] = await doctor.generateKeyPair();
//     skR = skRLocal;
//     console.log("Doctor generated key pair");
//     res.json({ pkR });
// }

// Step 3: Receive ciphertext from Patient and decapsulate to get shared secret
app.post("/decapsulate", async (req, res) => {
  const { ct } = req.body;
  const ct_arr = new Uint8Array(Object.values(ct));
  const doctor = new MlKem768();
  ssR = await doctor.decap(ct_arr, skR); // Decapsulate using private key
  console.log("Shared secret established at Doctor:", Buffer.from(ssR).toString('hex'));
  res.send({ sharedSecret: Buffer.from(ssR).toString('hex') });
});

app.get("/encrypt", async (req, res) => {
    const startTime = performance.now();
    try {
        await encryptData(ssR, iv);
        const endTime_encrypt = performance.now();
        console.log(`Encryption took: ${endTime_encrypt - startTime} ms`);
        // upload to ipfs
        const res_ipfs = await axios.get("http://localhost:3003/upload");
        const endTime_upload = performance.now();
        console.log(`Upload to IPFS took: ${endTime_upload - endTime_encrypt}`);
        cid = res_ipfs.data;

    } catch (error) {
        console.log(`${error} has occured`);
    }
    res.send({cid});
    
})

app.get('/cid', async(req, res) => {
    res.json({cid : cid});
  })
  

// Start the server
app.listen(PORT, () => {
  console.log(`Doctor server running at http://localhost:${PORT}`);
//   generateKeyPair();
});
