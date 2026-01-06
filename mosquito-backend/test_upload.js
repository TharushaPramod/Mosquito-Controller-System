const fs = require('fs');
const http = require('http');
const path = require('path');

// Create a dummy PKL file if not exists
if (!fs.existsSync('dummy_model.pkl')) {
    fs.writeFileSync('dummy_model.pkl', 'dummy content');
}

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const filePath = path.join(__dirname, 'mosquito-backend', 'mosquito_model.pkl');
// const filePath = path.join(__dirname, 'dummy_model.pkl');
const fileStream = fs.createReadStream(filePath);

const options = {
    hostname: 'localhost',
    post: 5000,
    path: '/api/upload-model',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
    }
};

const req = http.request({ ...options, port: 5000 }, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(`--${boundary}\r\n`);
req.write('Content-Disposition: form-data; name="file"; filename="dummy_model.pkl"\r\n');
req.write('Content-Type: application/octet-stream\r\n\r\n');

fileStream.pipe(req, { end: false });

fileStream.on('end', () => {
    req.write(`\r\n--${boundary}--\r\n`);
    req.end();
});
