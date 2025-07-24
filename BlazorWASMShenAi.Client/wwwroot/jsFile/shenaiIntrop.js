window.measurementFinished = false;
window.WakeLock = null;

window.initializeShenAI = async function (apiKey, userId) {
    try {
        const granted = await navigator.storage.persist();
        console.log("Persistent storage granted:", granted);
        const CreateShenaiSDK = (await import('/shenai-sdk/index.mjs')).default;
        const shenai = await CreateShenaiSDK({
            onRuntimeInitialized: () => console.log("Shen.AI SDK ready"),
            locateFile: (path) =>
                path === 'shenai_sdk.wasm' ? '/shenai-sdk/shenai_sdk.wasm' : path,
        });

        window.shenaiInstance = shenai;
        shenai.setCustomMeasurementConfig({
            durationSeconds: 30,
            instantMetrics: [shenai.Metric.HEART_RATE],
            summaryMetrics: [shenai.Metric.SYSTOLIC_BP, shenai.Metric.DIASTOLIC_BP]
        });
        return new Promise((resolve) => {
            shenai.initialize(
                apiKey,
                userId,
                {
                    canvasId: "mxcanvas",
                    measurementPreset: shenai.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
                    initializationMode: shenai.InitializationMode.MEASUREMENT,
                    precisionMode: shenai.PrecisionMode.RELAXED,
                    //measurementPreset: undefined,
                    //initializationMode: shenai.InitializationMode.CALIBRATED_MEASUREMENT,
                    /*measurementPreset: shenai.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,*/
                    //measurementPreset: shenai.MeasurementPreset.FOURTY_FIVE_SECONDS_UNVALIDATED,
                    eventCallback: (event) => console.log("Shen.AI event:", event),
                    onCameraError: () => console.error("Camera error inside SDK"),
                },
                (result) => {
                    const stageEl = document.getElementById("stage");
                    if (result === shenai.InitializationResult.OK) {
                        console.log("Shen.AI initialized successfully");
                        document.getElementById("stage").className = "state-loaded";
                        resolve(true);
                    } else {
                        console.error("Shen.AI initialization failed:", result.toString());
                        resolve(false);
                    }
                }
            );
        });
    } catch (error) {
        console.error("SDK initialization error:", error);
        return false;
    }
};

window.startMeasurement = async function () {
    if (!window.shenaiInstance) {
        console.error("SDK not initialized");
        return false;
    }
    try {
        window.measurementFinished = false;
        // Request wake lock
        if ("wakeLock" in navigator && !window.wakeLock) {
            try {
                window.wakeLock = await navigator.wakeLock.request("screen");
                console.log("Wake lock granted");
            } catch (err) {
                console.warn("Wake lock request failed:", err);
            }
        }
        window.shenaiInstance.setPrecisionMode("relaxed");
        window.shenaiInstance.setOperatingMode(window.shenaiInstance.OperatingMode.MEASURE);
        return true;
    } catch (err) {
        console.error("Measurement crash detected:", err);
        alert("Measurement crashed. Trying again...");
        window.shenaiInstance.stopMeasurement();
        setTimeout(() => window.shenaiInstance.setOperatingMode(window.shenaiInstance.OperatingMode.MEASURE), 2000);
        return false;
    }
};



// Poll for heart rate
window.getHeartRate = function () {
    if (!window.shenaiInstance || window.measurementFinished) return null;
    return window.shenaiInstance.getHeartRate10s();
};

// Get face position instructions
window.getFacePosition = function () {
    if (!window.shenaiInstance || window.measurementFinished) return "";
    const faceState = window.shenaiInstance.getFaceState();
    switch (faceState) {
        case window.shenaiInstance.FaceState.OK: return "Face well positioned";
        case window.shenaiInstance.FaceState.NOT_CENTERED: return "Move to center";
        case window.shenaiInstance.FaceState.TOO_CLOSE: return "Move away from camera";
        case window.shenaiInstance.FaceState.TOO_FAR: return "Move closer to camera";
        case window.shenaiInstance.FaceState.UNSTABLE: return "Too much movement";
        default: return "";
    }
};

// Get measurement progress
window.getProgress = function () {
    if (!window.shenaiInstance || window.measurementFinished) return 0;
    return window.shenaiInstance.getMeasurementProgressPercentage();
};

// Check if measurement is complete
window.isMeasurementComplete = function () {
    if (!window.shenaiInstance) return true;
    if (window.shenaiInstance.getMeasurementState() === window.shenaiInstance.MeasurementState.FINISHED) {
        window.measurementFinished = true;
        return true;
    }
    return false;
};

// Get final results
window.getResults = function () {
    if (!window.shenaiInstance || !window.measurementFinished) return null;
    const results = window.shenaiInstance.getMeasurementResults();
    return {
        heartRate: results.heart_rate_bpm,
        hrvSdnn: results.hrv_sdnn_ms,
        hrvLnRmssd: results.hrv_lnrmssd_ms,
        breathingRate: results.breathing_rate_bpm,
        heartbeats: results.heartbeats
    };
};

window.checkMemoryPressure = async function () {
    const estimate = await navigator.storage.estimate();
    console.log(`Storage used: ${estimate.usage}, quota: ${estimate.quota}`);
    if (estimate.usage / estimate.quota > 0.8) {
        console.warn("Warning: High memory pressure—SDK may freeze.");
    }
};