import crypto from 'crypto'
import fs from 'fs';

const inputPath = '50mb.txt';
const outputPath = 'encrypted.txt';
const decrypted = 'decrypted.txt';

// const constantIV = Buffer.from([
//     0x12, 0x34, 0x56, 0x78,
//     0x90, 0xAB, 0xCD, 0xEF,
//     0xFE, 0xDC, 0xBA, 0x98,
//     0x76, 0x54, 0x32, 0x10
// ]);

export async function encryptData(key, iv) {

    const symmKey = await crypto.createHash('sha512').update(key).digest('hex').substring(0, 32)
    
    const cipher = await crypto.createCipheriv('aes-256-cbc', symmKey, iv)

    const input = await fs.createReadStream(inputPath);
    const output = await fs.createWriteStream(outputPath);

    await input.pipe(cipher).pipe(output);
    console.log('File encrypted successfully.');
}


export async function decryptData(key, iv) {
    const symmKey = await crypto.createHash('sha512').update(key).digest('hex').substring(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', symmKey, iv)
    const input = await fs.createReadStream(outputPath);
    const output = await fs.createWriteStream(decrypted);

    await input.pipe(decipher).pipe(output);
    console.log('File decrypted successfully');
}