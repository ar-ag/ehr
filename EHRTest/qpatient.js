import express from "express";
import { MlKem768 } from "mlkem"; 
import axios from "axios";
import { decryptData } from "./encryption.js";
import { performance } from 'perf_hooks';
import { error } from "console";

const app = express();
app.use(express.json());
const PORT = 4001;
let iv;
let sss;

// Step 2: Patient receives pkR, encapsulates shared secret, and sends ciphertext to Doctor
app.get("/startKeyExchange", async (req, res) => {
  try {
    const startTime_total = performance.now();
    // 1. Get the public key (pkR) from the Doctor server
    const response = await axios.get("http://localhost:4000/generateKeyPair");
    const pkR_json = response.data.pkR;
    let iv_obj = response.data.iv;
    iv = Buffer.from(iv_obj.data);
    const pkR = new Uint8Array(Object.values(pkR_json));

    console.log("Received Doctor's public key (pkR)", pkR);
    const endTime_step1 = performance.now();
    console.log(`Step 1: Generating Key Pair ---- ${endTime_step1 - startTime_total}`);

    // 2. Encapsulate a shared secret using pkR
    const patient = new MlKem768();
    const [ct, ssS] = await patient.encap(pkR);
    sss = ssS;
    console.log("Patient's shared secret:", Buffer.from(ssS).toString('hex'));
    const endTime_step2 = performance.now();
    console.log(`Step 2: Encapsulate ---- ${endTime_step2 - endTime_step1}`);
    

    const res_decap = await axios.post("http://localhost:4000/decapsulate", { ct });
    // 3. Send ciphertext to Doctor
    console.log("Sent ciphertext to Doctor");
    const endTime_step3 = performance.now();
    console.log(`Step 3: Decapsulate ---- ${endTime_step3 - endTime_step2}`);

    const sss_doctor = res_decap.data.sharedSecret; // Assuming the shared secret is returned in `data`
    const sss_string = Buffer.from(ssS).toString('hex');
    
    // Compare the shared secrets
    if (sss_doctor === sss_string) {
        res.send("Key exchange process complete");
    } else {
        // Throw an error if the secrets do not match
        throw new Error("Key exchange process failed: Shared secrets do not match");
    }
    const endTime_total = performance.now();
    const duration_total = endTime_total - startTime_total;

    console.log(`Total Key Generation and Exchange Time: ${duration_total} ms`);
    
  } catch (error) {
    console.error("Error during key exchange:", error.message);
    res.status(500).send("Key exchange failed");
  }
});

app.get("/decrypt", async(req, res) => {
    const startTime = performance.now();
    try {
        const cid_res = await axios.get("http://localhost:4000/cid");
        const cid = cid_res.data.cid;
        const data = {cid:cid};
        const retrieve = await axios.get("http://localhost:3003/fetch", {params:data});
        const endTime_retrieve = performance.now();
        console.log(`Retrieve IPFS took: ${endTime_retrieve - startTime} ms`);
        await decryptData(sss, iv);
        const endTime_decrypt = performance.now();
        console.log(`Decryption took: ${endTime_decrypt - endTime_retrieve} ms`);
        console.log(`File DEcrypted successfully`);
        res.status(200).send('Success');
    } catch (error) {
        console.log(`${error} has occured`);
        res.status(500).send(`${error} has occured`);
    }
})

// Start the server
app.listen(PORT, () => {
  console.log(`Patient server running at http://localhost:${PORT}`);
});
