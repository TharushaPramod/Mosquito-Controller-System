const { exec } = require('child_process');

const ports = [5001, 5173, 5174];

ports.forEach(port => {
    // Windows command to find and kill process by port
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (stdout) {
            const lines = stdout.trim().split('\n');
            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1]; // PID is the last element

                if (pid && /^\d+$/.test(pid) && pid !== '0') {
                    console.log(`Killing PID ${pid} on port ${port}...`);
                    exec(`taskkill /F /PID ${pid}`, (killErr) => {
                        // Ignore errors (process might be gone or access denied)
                    });
                }
            });
        }
    });
});
