// ============================================
// STUDENT PORTAL
// Attendance Dashboard for Students
// ============================================

class StudentPortal {
    constructor() {
        this.studentData = null;
        this.attendanceChart = null;
        this.init();
    }

    init() {
        const loggedIn = sessionStorage.getItem('studentRollNumber');
        if (loggedIn) {
            this.loadDashboard(loggedIn);
        } else {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        const container = document.getElementById('studentContent');
        if (!container) return;

        container.innerHTML = `
      <div class="login-container">
        <div class="login-card card-glass">
          <div class="login-icon">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h2 class="login-title">Student Portal</h2>
          <p class="login-subtitle">Enter your roll number to view attendance</p>
          
          <form class="login-form" id="studentLoginForm">
            <div class="form-group">
              <label class="form-label" for="rollNumber">Roll Number</label>
              <input 
                type="text" 
                class="form-input" 
                id="rollNumber" 
                placeholder="Enter your roll number"
                required
              />
            </div>
            
            <button type="submit" class="btn btn-primary login-btn-submit">
              <i class="fas fa-sign-in-alt"></i>
              Login
            </button>
          </form>

          <a href="index.html" class="back-home">
            <i class="fas fa-arrow-left"></i>
            Back to Home
          </a>
        </div>
      </div>
    `;

        document.getElementById('studentLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const rollNumber = document.getElementById('rollNumber').value.trim();

        if (!rollNumber) {
            animationController.showNotification('Please enter roll number', 'error');
            return;
        }

        const student = storage.getStudent(rollNumber);
        if (!student) {
            animationController.showNotification('Student not found', 'error');
            return;
        }

        sessionStorage.setItem('studentRollNumber', rollNumber);
        this.loadDashboard(rollNumber);
    }

    loadDashboard(rollNumber) {
        this.studentData = storage.getStudent(rollNumber);
        if (!this.studentData) {
            this.showLoginForm();
            return;
        }

        this.renderDashboard();
        this.loadAttendanceData();
    }

    renderDashboard() {
        const container = document.getElementById('studentContent');
        if (!container) return;

        container.innerHTML = `
      <div class="student-dashboard">
        <div class="dashboard-header-student">
          <h1 class="welcome-message">Welcome, ${this.studentData.name}!</h1>
          <p class="welcome-subtitle">Roll Number: ${this.studentData.rollNumber}</p>
          <button class="btn btn-secondary logout-btn" onclick="studentPortal.logout()">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card card-glass">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-value" id="totalAttended">0</div>
            <div class="stat-label">Classes Attended</div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon">
              <i class="fas fa-times-circle"></i>
            </div>
            <div class="stat-value" id="totalMissed">0</div>
            <div class="stat-label">Classes Missed</div>
          </div>

          <div class="stat-card card-glass">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-value" id="attendancePercentage">0%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
        </div>

        <div class="data-section">
          <div class="chart-section card-glass">
            <h3 class="chart-title">Attendance Overview</h3>
            <div class="attendance-chart-container">
              <canvas id="studentChart"></canvas>
            </div>
          </div>

          <div class="history-section card-glass">
            <div class="history-header">
              <h3 class="history-title">Recent History</h3>
              <select class="filter-select" id="subjectFilterStudent">
                <option value="">All Subjects</option>
              </select>
            </div>
            <div class="history-table-container">
              <table class="history-table" id="historyTable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="historyTableBody">
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="subjects-section card-glass">
          <h3 class="subjects-title">Subject-wise Breakdown</h3>
          <div class="subject-list" id="subjectBreakdown">
          </div>
        </div>
      </div>
    `;

        // Setup subject filter
        const subjectFilter = document.getElementById('subjectFilterStudent');
        if (subjectFilter) {
            this.populateSubjectFilter(subjectFilter);
            subjectFilter.addEventListener('change', () => this.renderHistory());
        }
    }

    loadAttendanceData() {
        const attendance = storage.getAttendanceByStudent(this.studentData.rollNumber);
        const subjects = storage.getSubjects();

        // Calculate total classes (assuming at least 1 class per subject per week for estimation)
        // In a real system, you'd track total classes separately
        const totalClassesEstimate = subjects.length * 10; // Simplified estimation
        const attended = attendance.length;
        const missed = Math.max(0, totalClassesEstimate - attended);
        const percentage = totalClassesEstimate > 0 ? ((attended / totalClassesEstimate) * 100).toFixed(1) : 0;

        // Update stats
        document.getElementById('totalAttended').textContent = attended;
        document.getElementById('totalMissed').textContent = missed;
        document.getElementById('attendancePercentage').textContent = percentage + '%';

        // Render chart
        this.renderChart(attended, missed);

        // Render history
        this.renderHistory();

        // Render subject breakdown
        this.renderSubjectBreakdown(attendance, subjects);
    }

    renderChart(attended, missed) {
        const canvas = document.getElementById('studentChart');
        if (!canvas) return;

        if (this.attendanceChart) {
            this.attendanceChart.destroy();
        }

        this.attendanceChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Attended', 'Missed'],
                datasets: [{
                    data: [attended, missed || 1], // Avoid zero for better visualization
                    backgroundColor: [
                        'rgba(67, 233, 123, 0.8)',
                        'rgba(245, 87, 108, 0.8)'
                    ],
                    borderColor: [
                        'rgba(67, 233, 123, 1)',
                        'rgba(245, 87, 108, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                            font: { size: 14 }
                        }
                    }
                }
            }
        });
    }

    renderHistory(subjectFilter = '') {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        let records = storage.getAttendanceByStudent(this.studentData.rollNumber);

        if (subjectFilter) {
            records = records.filter(r => r.subject === subjectFilter);
        }

        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Take only recent 20
        records = records.slice(0, 20);

        if (records.length === 0) {
            tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No attendance records found
          </td>
        </tr>
      `;
            return;
        }

        tbody.innerHTML = records.map(record => `
      <tr>
        <td>${record.date}</td>
        <td>${record.subject}</td>
        <td>${record.time}</td>
        <td><span class="status-badge status-present">Present</span></td>
      </tr>
    `).join('');
    }

    renderSubjectBreakdown(attendance, subjects) {
        const container = document.getElementById('subjectBreakdown');
        if (!container) return;

        if (subjects.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No subjects available</p>';
            return;
        }

        const subjectData = subjects.map(subject => {
            const subjectAttendance = attendance.filter(a => a.subject === subject);
            const totalClasses = 10; // Simplified - in real system, track actual total
            const percentage = (subjectAttendance.length / totalClasses * 100).toFixed(1);

            return { subject, attended: subjectAttendance.length, totalClasses, percentage };
        });

        container.innerHTML = subjectData.map((data, index) => `
      <div class="subject-item" style="animation-delay: ${index * 0.1}s;">
        <div class="subject-header">
          <span class="subject-name">${data.subject}</span>
          <span class="subject-percentage">${data.percentage}%</span>
        </div>
        <div class="subject-progress">
          <div class="subject-progress-bar" style="width: ${data.percentage}%"></div>
        </div>
        <small style="color: var(--text-secondary); font-size: var(--text-sm);">
          ${data.attended} / ${data.totalClasses} classes
        </small>
      </div>
    `).join('');
    }

    populateSubjectFilter(select) {
        const subjects = storage.getSubjects();
        select.innerHTML = '<option value="">All Subjects</option>' +
            subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    logout() {
        sessionStorage.removeItem('studentRollNumber');
        if (this.attendanceChart) {
            this.attendanceChart.destroy();
        }
        this.showLoginForm();
    }
}

// Initialize student portal
const studentPortal = new StudentPortal();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentPortal;
}
