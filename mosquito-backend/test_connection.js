const http = require('http');

console.log("Testing connectivity to http://localhost:5000/ ...");

const req = http.get('http://localhost:5000/', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
