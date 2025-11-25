const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('File content length:', content.length);
    console.log('First 20 characters:', JSON.stringify(content.slice(0, 20)));
    console.log('Hex of first 10 bytes:', Buffer.from(content.slice(0, 10)).toString('hex'));

    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.trim()) {
            console.log(`Line ${i + 1}: ${JSON.stringify(line)}`);
            const [key, val] = line.split('=');
            if (key) console.log(`  Key: "${key.trim()}"`);
            if (val) console.log(`  Val: "${val.trim()}"`);
        }
    });

} catch (err) {
    console.error('Error reading file:', err);
}
