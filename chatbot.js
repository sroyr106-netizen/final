// ============================================
// AI CHATBOT
// Intelligent Assistant with Context Awareness
// ============================================

class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.quickReplies = [
            'How does face detection work?',
            'View attendance',
            'Register student',
            'Help'
        ];
        this.init();
    }

    init() {
        this.createChatbot();
        this.setupEventListeners();
    }

    createChatbot() {
        const chatbotHTML = `
      <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chatbot">
     <i class="fa-brands fa-airbnb"></i>


      </button>

      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="chatbot-info">
              <div class="chatbot-name">AI Assistant</div>
              <div class="chatbot-status">
                <span class="status-indicator"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <button class="chatbot-minimize" id="chatbotMinimize">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="chatbot-messages" id="chatbotMessages">
          <div class="welcome-message-chat">
            <h3>👋 Welcome to OrbiBot Platform!</h3>
            <p>I'm your AI assistant🤖. How can I help you today?</p>
          </div>
        </div>

        <div class="quick-replies" id="quickReplies"></div>

        <div class="chatbot-input-area">
          <textarea 
            class="chatbot-input" 
            id="chatbotInput" 
            placeholder="Type your message..."
            rows="1"></textarea>
          <button class="chatbot-send" id="chatbotSend">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.renderQuickReplies();
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatbotToggle');
        const minimize = document.getElementById('chatbotMinimize');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');

        toggle.addEventListener('click', () => this.toggleChatbot());
        minimize.addEventListener('click', () => this.toggleChatbot());
        sendBtn.addEventListener('click', () => this.sendMessage());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');

        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
        } else {
            window.classList.remove('active');
            toggle.classList.remove('active');
        }
    }

    renderQuickReplies() {
        const container = document.getElementById('quickReplies');
        container.innerHTML = this.quickReplies
            .map(reply => `<button class="quick-reply-btn" onclick="chatbot.handleQuickReply('${reply}')">${reply}</button>`)
            .join('');
    }

    handleQuickReply(reply) {
        document.getElementById('chatbotInput').value = reply;
        this.sendMessage();
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        // Get bot response
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const messageHTML = `
      <div class="message ${sender}">
        <div class="message-avatar">
          <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
          <div class="message-bubble">${text}</div>
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ text, sender, time });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingHTML = `
      <div class="typing-indicator" id="typingIndicator">
        <div class="message-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Context-aware responses
        const responses = {
            greeting: [
                'Hello! How can I assist you with the attendance system today?',
                'Hi there! What would you like to know about the face detection attendance system?',
                'Greetings! I\'m here to help you navigate the attendance system.'
            ],
            faceDetection: [
                'Our system uses face-api.js, a TensorFlow.js implementation for face recognition. It captures facial features, creates a unique descriptor, and matches it against registered students.',
                'Face detection works by analyzing facial landmarks and creating a 128-dimensional vector (descriptor) unique to each person. During attendance, we compare live camera feed against stored descriptors.',
                'The AI scans faces in real-time, extracts facial features, and matches them with registered students in our database with high accuracy.'
            ],
            attendance: [
                'To view attendance, admins can go to "View Records" and filter by subject or date. Students can log in with their roll number to see their personal attendance.',
                'Attendance is recorded automatically when a face is recognized during scanning. All records include student name, roll number, subject, date, and time.',
                'You can export attendance data as Excel or PDF from the admin dashboard.'
            ],
            register: [
                'To register a student: Go to the "Register Student" module, fill in details (name, roll number), turn on the camera, and capture the student\'s face. The system will save their facial data.',
                'Registration requires student information and a clear face photo. Make sure there\'s good lighting and the face is clearly visible to the camera.',
                'After registration, the student\'s facial descriptor is securely stored and can be used for automatic attendance marking.'
            ],
            admin: [
                'Admin functions include: Register students, manage student records, add subjects, scan attendance, view/export reports, and manage settings.',
                'Default admin credentials are username: "admin", password: "admin123". You can change these in Settings.',
                'As an admin, you have full control over the system including student management, attendance tracking, and data export.'
            ],
            student: [
                'Students can log in using their roll number to view attendance statistics, date-wise history, and subject-wise breakdown.',
                'Your attendance is automatically recorded when your face is recognized during class scanning.',
                'Check your dashboard for attendance percentage, total classes attended, and missed classes.'
            ],
            help: [
                'I can help you with:<br>• Face detection information<br>• Attendance viewing/recording<br>• Student registration<br>• Admin features<br>• Navigation<br>• Technical questions<br><br>Just ask me anything!',
                'Available features:<br>🎓 Student Registration & Management<br>📊 Attendance Tracking<br>📷 Face Recognition<br>📈 Statistics & Reports<br>⚙️ Settings & Configuration<br><br>What would you like to know more about?'
            ],
            technical: [
                'The system uses: face-api.js for face detection, IndexedDB for face descriptors, LocalStorage for attendance data, Chart.js for visualizations, and modern web APIs for camera access.',
                'All data is stored locally in your browser for privacy and security. No external servers are involved.',
                'The system works entirely client-side, ensuring your data remains on your device.'
            ],
            default: [
                'I\'m not sure I understand. Could you rephrase that? I can help with face detection, attendance, registration, and navigation.',
                'Hmm, I didn\'t quite get that. Try asking about attendance, face detection, student registration, or say "help" for more options.',
                'I\'m here to help! Ask me about the attendance system features, face detection, or how to use specific modules.'
            ]
        };

        // Determine response category
        if (lowerMessage.match(/hello|hi|hey|greet/)) {
            return this.getRandomResponse(responses.greeting);
        }
        if (lowerMessage.match(/face|detection|recognize|scan|camera/)) {
            return this.getRandomResponse(responses.faceDetection);
        }
        if (lowerMessage.match(/attendance|present|absent|record/)) {
            return this.getRandomResponse(responses.attendance);
        }
        if (lowerMessage.match(/register|add student|new student|enroll/)) {
            return this.getRandomResponse(responses.register);
        }
        if (lowerMessage.match(/admin|dashboard|manage/)) {
            return this.getRandomResponse(responses.admin);
        }
        if (lowerMessage.match(/student|login|roll number/)) {
            return this.getRandomResponse(responses.student);
        }
        if (lowerMessage.match(/help|guide|how|what|feature/)) {
            return this.getRandomResponse(responses.help);
        }
        if (lowerMessage.match(/technical|technology|how it works|api|database/)) {
            return this.getRandomResponse(responses.technical);
        }

        return this.getRandomResponse(responses.default);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Initialize chatbot
const chatbot = new AIChatbot();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatbot;
}
document.getElementById("robotBox").innerHTML = `
    <i class="fa-solid fa-robot my-robot"></i>
`;
