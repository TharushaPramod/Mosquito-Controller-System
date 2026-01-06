const fs = require('fs');
const http = require('http');
const path = require('path');

const boundary = '--------------------------1234567890';
const fileContent = 'mock pickle content for testing connection stability'.repeat(100);
const fileName = 'test_model.pkl';

const postDataHead = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`;
const postDataTail = `\r\n--${boundary}--\r\n`;

const req = http.request({
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/upload-model',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postDataHead) + Buffer.byteLength(fileContent) + Buffer.byteLength(postDataTail)
    }
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postDataHead);
req.write(fileContent);
req.write(postDataTail);
req.end();
