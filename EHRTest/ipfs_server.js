import express from "express";
const app = express();
app.use(express.json());
import * as filesys from "node:fs/promises";
import { unixfs } from "@helia/unixfs";
import { createHelia } from "helia";
import { CID } from 'multiformats/cid'
import { performance } from 'perf_hooks';

async function createNode() {
    const helia = await createHelia();
    const fs = unixfs(helia);
    return fs;
}

app.get('/upload', async (req, res) => {
    const startTime = performance.now();
    const fs = await createNode();
    // we will use this TextEncoder to turn strings into Uint8Arrays
  const encoder = new TextEncoder();

  //getting contents of file in a unit8 array
  const fileContent = await filesys.readFile("encrypted.txt");

  // add the bytes to your node and receive a unique content identifier
  // const cid = await fs.addBytes(encoder.encode('Hello World 301'))
  const cid = await fs.addBytes(fileContent);
//   console.log(typeof cid)
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log('upload to IPFS Operation took ' + duration + ' milliseconds.');
    console.log("Added file:", cid.toString());
    res.status(201).send(cid);
})


app.get('/fetch', async (req, res) => {
    const startTime = performance.now();
    const fs2 = await createNode();
    
    const cidString = req.query.cid; // cidString is a string or an object
    let c;
    console.log("hey from fetch ipfs");
    // Check if cidString is an object
    if (typeof cidString === 'object') {
        // Extract the value from the object
        const values = Object.values(cidString);
        // Assign the first value to cid
        c = values[0];
    } else {
        // If cidString is already a string, assign it directly to cid
        c = cidString;
    }
    const decoder = new TextDecoder();
    let text = "";
    const cid = CID.parse(c);
    console.log(cid);
    
    // use the second Helia node to fetch the file from the first Helia node
    for await (const chunk of fs2.cat(cid)) {
        console.log(chunk)
        text += decoder.decode(chunk, {
        stream: true,
        });
    }

    // Write the fetched file contents to 'encrypted_ipfs.txt' file
    try {
        await filesys.writeFile('encrypted_ipfs.txt', text);
        console.log("File 'encrypted_ipfs.txt' written successfully.");
        res.status(200).send('success');
    } catch (error) {
        console.error("Error writing file:", error);
        res.status(500).send('error');
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log('Retreival from IPFS Operation took ' + duration + ' milliseconds.');
});

app.listen(3003, () => {
    console.log('server listening at port 3003');
})
