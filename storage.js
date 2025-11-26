// ============================================
// DATA STORAGE UTILITIES
// LocalStorage & IndexedDB Management
// ============================================

class StorageManager {
    constructor() {
        this.dbName = 'AttendanceSystemDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    // Initialize IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('faceDescriptors')) {
                    db.createObjectStore('faceDescriptors', { keyPath: 'rollNumber' });
                }
            };
        });
    }

    // === LocalStorage Operations ===

    // Students
    getStudents() {
        const students = localStorage.getItem('students');
        return students ? JSON.parse(students) : [];
    }

    saveStudents(students) {
        localStorage.setItem('students', JSON.stringify(students));
    }

    addStudent(student) {
        const students = this.getStudents();
        students.push(student);
        this.saveStudents(students);
    }

    updateStudent(rollNumber, updatedData) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.rollNumber === rollNumber);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            this.saveStudents(students);
            return true;
        }
        return false;
    }

    deleteStudent(rollNumber) {
        const students = this.getStudents();
        const filtered = students.filter(s => s.rollNumber !== rollNumber);
        this.saveStudents(filtered);

        // Also delete face descriptor
        this.deleteFaceDescriptor(rollNumber);

        // Delete attendance records
        const attendance = this.getAttendance();
        const filteredAttendance = attendance.filter(a => a.rollNumber !== rollNumber);
        this.saveAttendance(filteredAttendance);
    }

    getStudent(rollNumber) {
        const students = this.getStudents();
        return students.find(s => s.rollNumber === rollNumber);
    }

    // Subjects
    getSubjects() {
        const subjects = localStorage.getItem('subjects');
        return subjects ? JSON.parse(subjects) : [];
    }

    saveSubjects(subjects) {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }

    addSubject(subject) {
        const subjects = this.getSubjects();
        if (!subjects.includes(subject)) {
            subjects.push(subject);
            this.saveSubjects(subjects);
            return true;
        }
        return false;
    }

    deleteSubject(subject) {
        const subjects = this.getSubjects();
        const filtered = subjects.filter(s => s !== subject);
        this.saveSubjects(filtered);

        // Also delete attendance for this subject
        const attendance = this.getAttendance();
        const filteredAttendance = attendance.filter(a => a.subject !== subject);
        this.saveAttendance(filteredAttendance);
    }

    // Attendance Records
    getAttendance() {
        const attendance = localStorage.getItem('attendance');
        return attendance ? JSON.parse(attendance) : [];
    }

    saveAttendance(attendance) {
        localStorage.setItem('attendance', JSON.stringify(attendance));
    }

    addAttendanceRecord(record) {
        const attendance = this.getAttendance();
        attendance.push({
            ...record,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });
        this.saveAttendance(attendance);
    }

    getAttendanceByStudent(rollNumber) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.rollNumber === rollNumber);
    }

    getAttendanceBySubject(subject) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.subject === subject);
    }

    getAttendanceByDate(date) {
        const attendance = this.getAttendance();
        return attendance.filter(a => a.date === date);
    }

    getTodayAttendance() {
        const today = new Date().toLocaleDateString();
        return this.getAttendanceByDate(today);
    }

    // Admin Credentials
    getAdminCredentials() {
        const credentials = localStorage.getItem('adminCredentials');
        return credentials ? JSON.parse(credentials) : { username: 'admin', password: 'admin123' };
    }

    saveAdminCredentials(username, password) {
        localStorage.setItem('adminCredentials', JSON.stringify({ username, password }));
    }

    // === IndexedDB Operations (Face Descriptors) ===

    async saveFaceDescriptor(rollNumber, descriptor) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['faceDescriptors'], 'readwrite');
            const store = transaction.objectStore('faceDescriptors');
            const request = store.put({ rollNumber, descriptor: Array.from(descriptor) });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getFaceDescriptor(rollNumber) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['faceDescriptors'], 'readonly');
            const store = transaction.objectStore('faceDescriptors');
            const request = store.get(rollNumber);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(new Float32Array(request.result.descriptor));
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFaceDescriptors() {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['faceDescriptors'], 'readonly');
            const store = transaction.objectStore('faceDescriptors');
            const request = store.getAll();

            request.onsuccess = () => {
                const descriptors = request.result.map(item => ({
                    rollNumber: item.rollNumber,
                    descriptor: new Float32Array(item.descriptor)
                }));
                resolve(descriptors);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteFaceDescriptor(rollNumber) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['faceDescriptors'], 'readwrite');
            const store = transaction.objectStore('faceDescriptors');
            const request = store.delete(rollNumber);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // === Statistics ===

    getStudentStats(rollNumber) {
        const attendance = this.getAttendanceByStudent(rollNumber);
        const subjects = this.getSubjects();

        const stats = {
            totalClasses: attendance.length,
            subjectWise: {}
        };

        subjects.forEach(subject => {
            const subjectAttendance = attendance.filter(a => a.subject === subject);
            stats.subjectWise[subject] = {
                attended: subjectAttendance.length,
                percentage: 0 // Will be calculated with total classes per subject
            };
        });

        return stats;
    }

    // === Clear All Data ===

    clearAllData() {
        localStorage.clear();
        if (this.db) {
            indexedDB.deleteDatabase(this.dbName);
        }
    }
}

// Initialize storage manager
const storage = new StorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
