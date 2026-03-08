const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find a usable Python command. Prefer env override `PYTHON_EXEC`.
const findPythonCmd = () => {
    const candidates = [process.env.PYTHON_EXEC, 'python', 'python3', 'py'].filter(Boolean);
    for (const cmd of candidates) {
        try {
            const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
            if (res && res.status === 0) return cmd;
        } catch (e) {
            // ignore
        }
    }
    return candidates[0] || 'python';
};

const PYTHON_CMD = findPythonCmd();
const BACKEND_ROOT = path.join(__dirname, '..');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save to the root of mosquito-backend where the python scripts are
        cb(null, './');
    },
    filename: (req, file, cb) => {
        if (req.path === '/upload') {
            cb(null, 'mosquito_data_temp.csv');
        } else if (req.path === '/upload-model') {
            cb(null, 'mosquito_model_temp.pkl');
        } else {
            cb(null, file.originalname);
        }
    }
});

const upload = multer({ storage: storage });

// Upload CSV Data
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Rename temp to actual
    try {
        fs.renameSync(req.file.path, 'mosquito_data.csv');
        console.log(`CSV Uploaded: ${req.file.size} bytes`);
        res.json({ message: "Data uploaded successfully" });
    } catch (err) {
        console.error("File move error:", err);
        res.status(500).json({ error: "Failed to save file" });
    }
});

// Helper for delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for robust file moving (retries on EPERM/EBUSY)
const moveFileWithRetryAsync = async (source, dest, retries = 5, delay = 500) => {
    try {
        // Helper to kill processes holding the file (Windows specific attempt)
        if (process.platform === 'win32') {
            try {
                // Aggressively kill python instances which might hold the pickle file
                require('child_process').execSync('taskkill /F /IM python.exe');
                await sleep(200); // Wait for OS to release handles
            } catch (e) {
                // Ignore error if no python process running
            }
        }

        // Try to delete dest first
        if (fs.existsSync(dest)) {
            try {
                fs.unlinkSync(dest);
            } catch (e) { console.log("Unlink failed, trying rename anyway..."); }
        }

        fs.renameSync(source, dest);
        return true;
    } catch (err) {
        if (retries > 0 && (err.code === 'EPERM' || err.code === 'EBUSY')) {
            console.log(`File locked (EPERM/EBUSY), retrying move in ${delay}ms... (${retries} attempts left)`);
            await sleep(delay);
            return moveFileWithRetryAsync(source, dest, retries - 1, delay * 1.5);
        }
        throw err;
    }
};

// Upload Model - Now ASYNC
router.post('/upload-model', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.file.size < 100) {
        try { fs.unlinkSync(req.file.path); } catch (e) { }
        return res.status(400).json({ error: "Invalid model file (too small)" });
    }

    try {
        console.log(`Starting secure model update... Temp: ${req.file.path}`);

        // Use the async retry version
        await moveFileWithRetryAsync(req.file.path, 'mosquito_model.pkl');

        console.log(`Model Uploaded Successfully: ${req.file.size} bytes`);
        res.json({ message: "Model updated successfully" });
    } catch (err) {
        console.error("File move fatal error:", err);
        try { fs.unlinkSync(req.file.path); } catch (e) { }
        res.status(500).json({ error: `Failed to save model: ${err.message}` });
    }
});

// Run Prediction
router.get('/predict', (req, res) => {
    const pythonProcess = spawn(PYTHON_CMD, ['predict.py'], { cwd: BACKEND_ROOT });

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`[Python stderr]: ${data}`); // Log stderr to backend console
    });

    pythonProcess.on('close', (code) => {
        // Warning: Python might exit with 0 but still print to stderr (warnings). 
        // We only fail if code != 0 OR if dataString is empty/invalid.

        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            return res.status(500).json({ error: "Prediction process failed", details: errorString });
        }

        try {
            // Attempt to parse. If Python printed warnings to stdout, this will fail.
            const json = JSON.parse(dataString);
            res.json(json);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Python Output:", dataString); // debug what actually came out
            res.status(500).json({ error: "Failed to parse Python output", output: dataString, details: errorString });
        }
    });
});

// Map Data Endpoint
router.get('/map-data', (req, res) => {
    const pythonProcess = spawn(PYTHON_CMD, ['predict_spatial.py'], { cwd: BACKEND_ROOT });

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`[Python stderr]: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Spatial process exited with code ${code}`);
            return res.status(500).json({ error: "Spatial prediction process failed", details: errorString });
        }
        try {
            const json = JSON.parse(dataString);
            res.json(json);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.log("Raw Python Output:", dataString);
            res.status(500).json({ error: "Failed to parse Python output", output: dataString });
        }
    });
});

module.exports = router;
