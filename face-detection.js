// ============================================
// FACE DETECTION SYSTEM
// face-api.js Integration
// ============================================

class FaceDetection {
    constructor() {
        this.modelsLoaded = false;
        this.videoStream = null;
        this.MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
    }

    async loadModels() {
        if (this.modelsLoaded) return true;

        try {
            await faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL);
            this.modelsLoaded = true;
            console.log('Face detection models loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading face detection models:', error);
            return false;
        }
    }

    async startCamera(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 480 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            videoElement.srcObject = stream;
            this.videoStream = stream;

            return new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw new Error('Unable to access camera. Please check permissions.');
        }
    }

    stopCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }

    async detectFace(videoElement) {
        if (!this.modelsLoaded) {
            await this.loadModels();
        }

        const detection = await faceapi
            .detectSingleFace(videoElement)
            .withFaceLandmarks()
            .withFaceDescriptor();

        return detection;
    }

    async captureFace(videoElement) {
        try {
            const detection = await this.detectFace(videoElement);

            if (!detection) {
                throw new Error('No face detected. Please ensure your face is clearly visible.');
            }

            return detection.descriptor;
        } catch (error) {
            console.error('Error capturing face:', error);
            throw error;
        }
    }

    async recognizeFace(videoElement, threshold = 0.6) {
        try {
            const detection = await this.detectFace(videoElement);

            if (!detection) {
                return null;
            }

            // Get all stored face descriptors
            const storedDescriptors = await storage.getAllFaceDescriptors();

            if (storedDescriptors.length === 0) {
                return null;
            }

            // Find best match
            let bestMatch = null;
            let bestDistance = Infinity;

            for (const stored of storedDescriptors) {
                const distance = faceapi.euclideanDistance(detection.descriptor, stored.descriptor);

                if (distance < bestDistance && distance < threshold) {
                    bestDistance = distance;
                    bestMatch = {
                        rollNumber: stored.rollNumber,
                        distance: distance,
                        confidence: (1 - distance) * 100
                    };
                }
            }

            return bestMatch;
        } catch (error) {
            console.error('Error recognizing face:', error);
            throw error;
        }
    }

    async scanMultipleFaces(videoElement, duration = 5000) {
        const results = [];
        const startTime = Date.now();
        const interval = 500; // Scan every 500ms

        return new Promise((resolve) => {
            const scanInterval = setInterval(async () => {
                try {
                    const match = await this.recognizeFace(videoElement);
                    if (match && !results.find(r => r.rollNumber === match.rollNumber)) {
                        results.push(match);
                    }
                } catch (error) {
                    console.error('Scan error:', error);
                }

                if (Date.now() - startTime >= duration) {
                    clearInterval(scanInterval);
                    resolve(results);
                }
            }, interval);
        });
    }

    // Draw face detection overlay
    drawDetection(canvas, videoElement, detection) {
        const displaySize = { width: videoElement.width, height: videoElement.height };
        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetection = faceapi.resizeResults(detection, displaySize);

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetection);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
    }
}

// Initialize face detection
const faceDetection = new FaceDetection();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FaceDetection;
}
