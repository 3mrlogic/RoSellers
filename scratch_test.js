const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENCRYPTION_KEY = 'RoSellersSecureKey32BytesForAES!';
const IV_LENGTH = 16;

function decryptData(text) {
    try {
        const trimmed = text.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            return text;
        }
        const textParts = text.split(':');
        if (textParts.length < 2) return text;
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption error:', e.message);
        return text;
    }
}

const filePath = path.join(__dirname, 'config/products-admin.json');
if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const decrypted = decryptData(rawData);
    fs.writeFileSync(filePath, decrypted, 'utf8');
    console.log('Successfully decrypted products-admin.json back to plain-text!');
} else {
    console.log('File does not exist.');
}
