// ============================================
// ADMIN DASHBOARD
// Complete Admin Functionality
// ============================================

class AdminDashboard {
    constructor() {
        this.currentModule = 'register';
        this.isScanning = false;
        this.init();
    }

    init() {
        if (!this.checkAuth()) {
            return; // Don't init modules if not logged in
        }
        this.setupEventListeners();
        this.loadInitialData();
        this.initializeModules();
    }

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!isLoggedIn) {
            this.showLoginPage();
            return false;
        }
        return true;
    }

    showLoginPage() {
        const container = document.querySelector('.dashboard-container');
        if (!container) return;

        container.innerHTML = `
            <div style="max-width: 500px; margin: 5rem auto; padding: 2rem;">
                <div class="card-glass" style="padding: 3rem; border-radius: var(--radius-xl); text-align: center;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 2rem; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-shield" style="font-size: 2.5rem; color: white;"></i>
                    </div>
                    <h2 style="font-size: var(--text-3xl); margin-bottom: 0.5rem;">Admin Login</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">Enter your credentials to access the dashboard</p>
                    
                    <form id="adminLoginForm" style="text-align: left;">
                        <div class="form-group">
                            <label class="form-label" for="adminUsername">Username</label>
                            <input type="text" class="form-input" id="adminUsername" placeholder="Enter username" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="adminPassword">Password</label>
                            <input type="password" class="form-input" id="adminPassword" placeholder="Enter password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                            <i class="fas fa-sign-in-alt"></i>
                            Login
                        </button>
                    </form>
                    
                    <a href="index.html" class="btn btn-outline" style="width: 100%; margin-top: 1rem; display: inline-block;">
                        <i class="fas fa-arrow-left"></i>
                        Back to Home
                    </a>
                    
                    <p style="margin-top: 1.5rem; font-size: var(--text-sm); color: var(--text-tertiary);">
                        Default: admin/admin123
                    </p>
                </div>
            </div>
        `;

        // Setup login handler
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('adminUsername').value;
                const password = document.getElementById('adminPassword').value;
                const credentials = storage.getAdminCredentials();

                if (username === credentials.username && password === credentials.password) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    window.location.reload(); // Reload to init dashboard
                } else {
                    animationController.showNotification('Invalid credentials', 'error');
                }
            });
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
    }

    logout() {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }

    loadInitialData() {
        this.refreshStudentCount();
        this.refreshSubjectCount();
        this.refreshTodayAttendance();
    }

    initializeModules() {
        try {
            this.initRegisterModule();
            this.initManageModule();
            this.initViewRecordsModule();
            this.initAddClassModule();
            this.initChartModule();
            this.initFaceScanModule();
            console.log('All modules initialized');
        } catch (error) {
            console.error('Error initializing modules:', error);
        }
    }

    // === REGISTER STUDENT MODULE ===
    initRegisterModule() {
        const form = document.getElementById('registerForm');
        const startCameraBtn = document.getElementById('startCameraReg');
        const captureFaceBtn = document.getElementById('captureFaceBtn');
        const video = document.getElementById('registerVideo');

        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', async () => {
                try {
                    animationController.showLoading(document.querySelector('.camera-container'));
                    await faceDetection.loadModels();
                    await faceDetection.startCamera(video);
                    animationController.hideLoading(document.querySelector('.camera-container'));
                    startCameraBtn.style.display = 'none';
                    captureFaceBtn.style.display = 'block';
                    animationController.showNotification('Camera started successfully', 'success');
                } catch (error) {
                    animationController.hideLoading(document.querySelector('.camera-container'));
                    animationController.showNotification(error.message, 'error');
                }
            });
        }

        if (captureFaceBtn) {
            captureFaceBtn.addEventListener('click', async () => {
                try {
                    const descriptor = await faceDetection.captureFace(video);
                    sessionStorage.setItem('capturedFace', JSON.stringify(Array.from(descriptor)));
                    animationController.showNotification('Face captured successfully!', 'success');
                    captureFaceBtn.innerHTML = '<i class="fas fa-check"></i> Face Captured';
                    captureFaceBtn.classList.add('btn-success');
                } catch (error) {
                    animationController.showNotification(error.message, 'error');
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.registerStudent(form);
            });
        }
    }

    async registerStudent(form) {
        const name = form.querySelector('#studentName').value.trim();
        const rollNumber = form.querySelector('#studentRoll').value.trim();
        const faceData = sessionStorage.getItem('capturedFace');

        if (!name || !rollNumber) {
            animationController.showNotification('Please fill all fields', 'error');
            return;
        }

        if (!faceData) {
            animationController.showNotification('Please capture face first', 'error');
            return;
        }

        // Check if student already exists
        const existingStudent = storage.getStudent(rollNumber);
        if (existingStudent) {
            animationController.showNotification('Student with this roll number already exists', 'error');
            return;
        }

        try {
            // Save student data
            const student = { name, rollNumber, registeredDate: new Date().toISOString() };
            storage.addStudent(student);

            // Save face descriptor
            const descriptor = new Float32Array(JSON.parse(faceData));
            await storage.saveFaceDescriptor(rollNumber, descriptor);

            animationController.showNotification('Student registered successfully!', 'success');

            // Reset form
            form.reset();
            sessionStorage.removeItem('capturedFace');
            faceDetection.stopCamera();

            const captureFaceBtn = document.getElementById('captureFaceBtn');
            const startCameraBtn = document.getElementById('startCameraReg');
            if (captureFaceBtn) {
                captureFaceBtn.style.display = 'none';
                captureFaceBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Face';
                captureFaceBtn.classList.remove('btn-success');
            }
            if (startCameraBtn) startCameraBtn.style.display = 'block';

            this.refreshStudentCount();
        } catch (error) {
            console.error('Registration error:', error);
            animationController.showNotification('Registration failed', 'error');
        }
    }

    // === MANAGE STUDENTS MODULE ===
    initManageModule() {
        this.renderStudentsList();

        const searchInput = document.getElementById('searchStudents');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchStudents(e.target.value));
        }
    }

    renderStudentsList(filter = '') {
        const container = document.getElementById('studentsList');
        if (!container) return;

        let students = storage.getStudents();

        if (filter) {
            students = students.filter(s =>
                s.name.toLowerCase().includes(filter.toLowerCase()) ||
                s.rollNumber.toLowerCase().includes(filter.toLowerCase())
            );
        }

        if (students.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-slash empty-icon"></i>
          <p class="empty-text">No students found</p>
        </div>
      `;
            return;
        }

        const tableHTML = `
      <table class="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Registered Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td>${student.name}</td>
              <td>${student.rollNumber}</td>
              <td>${new Date(student.registeredDate).toLocaleDateString()}</td>
              <td>
                <div class="table-actions">
                  <button class="table-btn btn-delete" onclick="adminDashboard.deleteStudent('${student.rollNumber}')">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

        container.innerHTML = tableHTML;
    }

    searchStudents(query) {
        this.renderStudentsList(query);
    }

    deleteStudent(rollNumber) {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            storage.deleteStudent(rollNumber);
            animationController.showNotification('Student deleted successfully', 'success');
            this.renderStudentsList();
            this.refreshStudentCount();
        }
    }

    // === VIEW RECORDS MODULE ===
    initViewRecordsModule() {
        this.renderAttendanceRecords();

        const subjectFilter = document.getElementById('filterSubject');
        const dateFilter = document.getElementById('filterDate');
        const copyBtn = document.getElementById('copyAttendance');
        const excelBtn = document.getElementById('exportExcel');
        const pdfBtn = document.getElementById('exportPDF');

        if (subjectFilter) {
            this.populateSubjectFilter(subjectFilter);
            subjectFilter.addEventListener('change', () => this.renderAttendanceRecords());
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.renderAttendanceRecords());
        }

        if (copyBtn) copyBtn.addEventListener('click', () => this.copyAttendance());
        if (excelBtn) excelBtn.addEventListener('click', () => this.exportToExcel());
        if (pdfBtn) pdfBtn.addEventListener('click', () => this.exportToPDF());
    }

    populateSubjectFilter(select) {
        const subjects = storage.getSubjects();
        select.innerHTML = '<option value="">All Subjects</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    renderAttendanceRecords() {
        const container = document.getElementById('attendanceRecords');
        if (!container) return;

        let records = storage.getAttendance();

        // Apply filters
        const subjectFilter = document.getElementById('filterSubject')?.value;
        const dateFilter = document.getElementById('filterDate')?.value;

        if (subjectFilter) {
            records = records.filter(r => r.subject === subjectFilter);
        }

        if (dateFilter) {
            records = records.filter(r => r.date === new Date(dateFilter).toLocaleDateString());
        }

        if (records.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-clipboard-list empty-icon"></i><p class="empty-text">No attendance records found</p></div>`;
            return;
        }

        const tableHTML = `
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(record => {
            const student = storage.getStudent(record.rollNumber);
            return `
              <tr>
                <td>${student ? student.name : 'Unknown'}</td>
                <td>${record.rollNumber}</td>
                <td>${record.subject}</td>
                <td>${record.date}</td>
                <td>${record.time}</td>
                <td><span class="status-badge status-present">Present</span></td>
              </tr>
            `;
        }).join('')}
        </tbody>
      </table>
    `;

        container.innerHTML = tableHTML;
    }

    copyAttendance() {
        const records = this.getFilteredRecords();
        const text = records.map(r => {
            const student = storage.getStudent(r.rollNumber);
            return `${student?.name || 'Unknown'}\t${r.rollNumber}`;
        }).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            animationController.showNotification('Attendance copied to clipboard', 'success');
        });
    }

    exportToExcel() {
        const records = this.getFilteredRecords();
        const data = records.map(r => {
            const student = storage.getStudent(r.rollNumber);
            return {
                'Name': student?.name || 'Unknown',
                'Roll Number': r.rollNumber,
                'Subject': r.subject,
                'Date': r.date,
                'Time': r.time,
                'Status': 'Present'
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, `attendance_${Date.now()}.xlsx`);

        animationController.showNotification('Excel file downloaded', 'success');
    }

    exportToPDF() {
    const { jsPDF } = window.jspdf;  // <-- REQUIRED FIX
    const records = this.getFilteredRecords();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Attendance Report', 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = records.map(r => {
        const student = storage.getStudent(r.rollNumber);
        return [
            student?.name || 'Unknown',
            r.rollNumber,
            r.subject,
            r.date,
            r.time,
            'Present'
        ];
    });

    doc.autoTable({
        head: [['Name', 'Roll Number', 'Subject', 'Date', 'Time', 'Status']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] }
    });

    doc.save(`attendance_${Date.now()}.pdf`);

    animationController.showNotification('PDF file downloaded', 'success');
}


    getFilteredRecords() {
        let records = storage.getAttendance();
        const subjectFilter = document.getElementById('filterSubject')?.value;
        const dateFilter = document.getElementById('filterDate')?.value;

        if (subjectFilter) records = records.filter(r => r.subject === subjectFilter);
        if (dateFilter) records = records.filter(r => r.date === new Date(dateFilter).toLocaleDateString());

        return records;
    }

    // === ADD CLASS MODULE ===
    initAddClassModule() {
        this.renderSubjectsList();

        const form = document.getElementById('addSubjectForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addSubject(form);
            });
        }
    }

    renderSubjectsList() {
        const container = document.getElementById('subjectsList');
        if (!container) return;

        const subjects = storage.getSubjects();

        if (subjects.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-book empty-icon"></i><p class="empty-text">No subjects added yet</p></div>`;
            return;
        }

        const listHTML = subjects.map(subject => `
      <div class="subject-item">
        <span>${subject}</span>
        <button class="table-btn btn-delete" onclick="adminDashboard.deleteSubject('${subject}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

        container.innerHTML = listHTML;
    }

    addSubject(form) {
        const subjectName = form.querySelector('#subjectName').value.trim();

        if (!subjectName) {
            animationController.showNotification('Please enter subject name', 'error');
            return;
        }

        const success = storage.addSubject(subjectName);
        if (success) {
            animationController.showNotification('Subject added successfully', 'success');
            form.reset();
            this.renderSubjectsList();
            this.refreshSubjectCount();
            this.populateSubjectFilter(document.getElementById('filterSubject'));
            this.populateScanSubjectSelect();
        } else {
            animationController.showNotification('Subject already exists', 'error');
        }
    }

    deleteSubject(subject) {
        if (confirm(`Delete subject "${subject}"? This will also delete all attendance records for this subject.`)) {
            storage.deleteSubject(subject);
            animationController.showNotification('Subject deleted successfully', 'success');
            this.renderSubjectsList();
            this.refreshSubjectCount();
        }
    }

    // === CHART MODULE ===
    initChartModule() {
        this.renderAttendanceChart();
    }

    renderAttendanceChart() {
        const canvas = document.getElementById('attendanceChart');
        if (!canvas) return;

        const subjects = storage.getSubjects();
        const data = subjects.map(subject => {
            return storage.getAttendanceBySubject(subject).length;
        });

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    label: 'Total Attendance',
                    data: data,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // === FACE SCAN MODULE ===
    initFaceScanModule() {
        this.populateScanSubjectSelect();

        const startScanBtn = document.getElementById('startScanBtn');
        const stopScanBtn = document.getElementById('stopScanBtn');
        const video = document.getElementById('scanVideo');

        if (startScanBtn) {
            startScanBtn.addEventListener('click', async () => {
                await this.startAttendanceScan(video, startScanBtn, stopScanBtn);
            });
        }

        if (stopScanBtn) {
            stopScanBtn.addEventListener('click', () => {
                this.stopAttendanceScan(video, startScanBtn, stopScanBtn);
            });
        }
    }

    populateScanSubjectSelect() {
        const select = document.getElementById('scanSubject');
        if (!select) return;

        const subjects = storage.getSubjects();
        select.innerHTML = '<option value="">Select Subject</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    async startAttendanceScan(video, startBtn, stopBtn) {
        const subject = document.getElementById('scanSubject')?.value;
        if (!subject) {
            animationController.showNotification('Please select a subject', 'error');
            return;
        }

        try {
            animationController.showLoading(document.querySelector('.face-scan-section'));
            await faceDetection.loadModels();
            await faceDetection.startCamera(video);
            animationController.hideLoading(document.querySelector('.face-scan-section'));

            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            this.isScanning = true;

            this.continuousScan(video, subject);
            animationController.showNotification('Scanning started', 'success');
        } catch (error) {
            animationController.hideLoading(document.querySelector('.face-scan-section'));
            animationController.showNotification(error.message, 'error');
        }
    }

    async continuousScan(video, subject) {
        const resultsContainer = document.getElementById('scanResults');
        const scannedToday = new Set();

        const scanInterval = setInterval(async () => {
            if (!this.isScanning) {
                clearInterval(scanInterval);
                return;
            }

            try {
                const match = await faceDetection.recognizeFace(video);
                if (match && !scannedToday.has(match.rollNumber)) {
                    const student = storage.getStudent(match.rollNumber);
                    if (student) {
                        storage.addAttendanceRecord({
                            rollNumber: match.rollNumber,
                            subject: subject
                        });

                        scannedToday.add(match.rollNumber);

                        if (resultsContainer) {
                            const resultHTML = `
                <div class="result-item result-success">
                  <strong>${student.name}</strong> (${match.rollNumber}) - Attendance Marked
                  <br><small>Confidence: ${match.confidence.toFixed(2)}%</small>
                </div>
              `;
                            resultsContainer.insertAdjacentHTML('afterbegin', resultHTML);
                        }

                        animationController.showNotification(`${student.name} - Present`, 'success');
                    }
                }
            } catch (error) {
                console.error('Scan error:', error);
            }
        }, 2000);
    }

    stopAttendanceScan(video, startBtn, stopBtn) {
        this.isScanning = false;
        faceDetection.stopCamera();
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        this.refreshTodayAttendance();
        animationController.showNotification('Scanning stopped', 'success');
    }

    // === SETTINGS ===
    openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveSettings() {
        const username = document.getElementById('adminUsername')?.value;
        const password = document.getElementById('adminPassword')?.value;

        if (username && password) {
            storage.saveAdminCredentials(username, password);
            animationController.showNotification('Settings saved successfully', 'success');
            this.closeSettings();
        }
    }

    // === UTILITY FUNCTIONS ===
    refreshStudentCount() {
        const countEl = document.getElementById('studentCount');
        if (countEl) {
            countEl.textContent = storage.getStudents().length;
        }
    }

    refreshSubjectCount() {
        const countEl = document.getElementById('subjectCount');
        if (countEl) {
            countEl.textContent = storage.getSubjects().length;
        }
    }

    refreshTodayAttendance() {
        const countEl = document.getElementById('todayCount');
        if (countEl) {
            countEl.textContent = storage.getTodayAttendance().length;
        }
    }
}

// Initialize admin dashboard when DOM is ready
let adminDashboard;

function initAdmin() {
    try {
        adminDashboard = new AdminDashboard();
        console.log('Admin dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
document.getElementById("robotBox").innerHTML = `
    <i class="fa-solid fa-robot my-robot"></i>
`;
document.getElementById("robotBox").innerHTML = `
    <i class="fa-solid fa-robot my-robot"></i>
`;
document.getElementById("robotBox").innerHTML = `
    <i class="fa-solid fa-robot my-robot"></i>
`;
