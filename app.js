
// Backend Configuration
const BACKEND_URL = 'https://safetrip-backend-xzdb.onrender.com';

// Application State
const AppState = {
    currentUser: null,
    userType: null,
    currentLocation: null,
    locationWatching: false,
    language: 'en',
    notifications: [],
    maps: {},
    charts: {},
    authToken: localStorage.getItem('authToken') || null
};

// API Service
const API = {
    // Authentication endpoints
    register: async (userData) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('authToken', data.token);
                AppState.authToken = data.token;
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    login: async (credentials) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('authToken', data.token);
                AppState.authToken = data.token;
                AppState.currentUser = data.user;
                AppState.userType = data.user.userType;
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    logout: () => {
        localStorage.removeItem('authToken');
        AppState.authToken = null;
        AppState.currentUser = null;
        AppState.userType = null;
    },

    // Get current user profile
    getProfile: async () => {
        if (!AppState.authToken) return { success: false, message: 'No token' };

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${AppState.authToken}`
                }
            });
            const data = await response.json();

            if (data.success) {
                AppState.currentUser = data.user;
                AppState.userType = data.user.userType;
            }

            return data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Alerts endpoints
    createAlert: async (alertData) => {
        if (!AppState.authToken) return { success: false, message: 'No token' };

        try {
            const response = await fetch(`${BACKEND_URL}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AppState.authToken}`
                },
                body: JSON.stringify(alertData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create alert error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    getAlerts: async (params = {}) => {
        if (!AppState.authToken) return { success: false, message: 'No token' };

        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${BACKEND_URL}/api/alerts?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${AppState.authToken}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Get alerts error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Location update for tourists
    updateLocation: async (locationData) => {
        if (!AppState.authToken) return { success: false, message: 'No token' };

        try {
            const response = await fetch(`${BACKEND_URL}/api/tourist/location`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AppState.authToken}`
                },
                body: JSON.stringify(locationData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update location error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Emergency SOS
    triggerSOS: async (locationData) => {
        if (!AppState.authToken) return { success: false, message: 'No token' };

        try {
            const response = await fetch(`${BACKEND_URL}/api/emergency/sos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AppState.authToken}`
                },
                body: JSON.stringify(locationData)
            });
            return await response.json();
        } catch (error) {
            console.error('SOS trigger error:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Get geo-fences
    getGeoFences: async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/geo/fences`);
            return await response.json();
        } catch (error) {
            console.error('Get geo-fences error:', error);
            return { success: false, message: 'Network error' };
        }
    }
};

// Sample Data (fallback for when backend is not available)
const SampleData = {
    tourists: [
        {id: 1, name: "Rahul Sharma", phone: "+91-9876543210", email: "rahul@email.com", location: {lat: 28.6139, lng: 77.2090}, safetyScore: 85, status: "active", emergencyContact: "+91-9876543211"},
        {id: 2, name: "Priya Patel", phone: "+91-9876543212", email: "priya@email.com", location: {lat: 28.6129, lng: 77.2295}, safetyScore: 92, status: "active", emergencyContact: "+91-9876543213"},
        {id: 3, name: "Amit Kumar", phone: "+91-9876543214", email: "amit@email.com", location: {lat: 28.6562, lng: 77.2410}, safetyScore: 78, status: "alert", emergencyContact: "+91-9876543215"},
        {id: 4, name: "Sneha Singh", phone: "+91-9876543216", email: "sneha@email.com", location: {lat: 28.5355, lng: 77.3910}, safetyScore: 95, status: "active", emergencyContact: "+91-9876543217"},
        {id: 5, name: "Vikash Gupta", phone: "+91-9876543218", email: "vikash@email.com", location: {lat: 28.4595, lng: 77.0266}, safetyScore: 88, status: "active", emergencyContact: "+91-9876543219"}
    ],
    authorities: [
        {id: 1, officerID: "CST2205AC", name: "Rajesh Kumar", department: "Police Department", phone: "+91-9876543220", email: "rajesh.police@gov.in"},
        {id: 2, officerID: "TRD3301BD", name: "Sunita Devi", department: "Tourism Department", phone: "+91-9876543221", email: "sunita.tourism@gov.in"},
        {id: 3, officerID: "EMR4402CE", name: "Manoj Verma", department: "Emergency Services", phone: "+91-9876543222", email: "manoj.emergency@gov.in"}
    ],
    alerts: [],
    geoFences: [],
    incidents: [],
    safetyTips: [
        {id: 1, title: "Stay in Well-lit Areas", description: "Avoid dark alleys and isolated places, especially during night time.", category: "general"},
        {id: 2, title: "Keep Emergency Contacts Ready", description: "Always have local emergency numbers and embassy contacts saved.", category: "emergency"},
        {id: 3, title: "Inform Your Itinerary", description: "Share your travel plans with family and local authorities.", category: "planning"},
        {id: 4, title: "Carry Identification", description: "Always carry valid ID and keep copies in separate places.", category: "documents"}
    ],
    emergencyContacts: [
        {name: "Police", number: "100", description: "For immediate police assistance"},
        {name: "Medical Emergency", number: "108", description: "For medical emergencies and ambulance"},
        {name: "Fire Department", number: "101", description: "For fire emergency services"},
        {name: "Tourist Helpline", number: "1363", description: "24x7 tourist assistance helpline"}
    ]
};

// Utility Functions
const Utils = {
    formatTime: (timestamp) => {
        return new Date(timestamp).toLocaleString();
    },

    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    isInGeoFence: (location, geoFence) => {
        const distance = Utils.calculateDistance(
            location.lat, location.lng,
            geoFence.center.lat, geoFence.center.lng
        );
        return distance <= geoFence.radius;
    },

    calculateSafetyScore: (location) => {
        let score = 85; // Base score
        SampleData.geoFences.forEach(fence => {
            if (Utils.isInGeoFence(location, fence)) {
                if (fence.type === 'safe') score += 10;
                else if (fence.type === 'danger') score -= 30;
                else if (fence.type === 'caution') score -= 15;
            }
        });
        // Consider time of day
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 6) score -= 10; // Night time
        return Math.max(10, Math.min(100, score));
    },

    generateId: () => {
        return Math.floor(Math.random() * 10000) + Date.now();
    }
};

// Notification System
const NotificationSystem = {
    show: (message, type = 'info', duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').onclick = () => {
            notification.remove();
        };
    }
};

// Authentication System
const AuthSystem = {
    login: async (email, password, userType) => {
        try {
            const result = await API.login({ email, password, userType });

            if (result.success) {
                NotificationSystem.show('Login successful!', 'success');
                AuthSystem.showApp();
                return true;
            } else {
                NotificationSystem.show(result.message || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            NotificationSystem.show('Login failed', 'error');
            return false;
        }
    },

    register: async (userData) => {
        try {
            const result = await API.register(userData);

            if (result.success) {
                NotificationSystem.show('Registration successful!', 'success');
                AuthSystem.showApp();
                return true;
            } else {
                NotificationSystem.show(result.message || 'Registration failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            NotificationSystem.show('Registration failed', 'error');
            return false;
        }
    },

    logout: () => {
        API.logout();
        AuthSystem.showWelcome();
        NotificationSystem.show('Logged out successfully', 'info');
    },

    showWelcome: () => {
        document.getElementById('welcomeView').style.display = 'block';
        document.getElementById('appView').style.display = 'none';
    },

    showApp: () => {
        document.getElementById('welcomeView').style.display = 'none';
        document.getElementById('appView').style.display = 'block';

        // Initialize app based on user type
        if (AppState.userType === 'tourist') {
            TouristApp.init();
        } else if (AppState.userType === 'authority') {
            AuthorityApp.init();
        }
    },

    checkAuth: async () => {
        if (AppState.authToken) {
            const result = await API.getProfile();
            if (result.success) {
                AuthSystem.showApp();
                return true;
            } else {
                localStorage.removeItem('authToken');
                AppState.authToken = null;
            }
        }
        AuthSystem.showWelcome();
        return false;
    }
};

// Tourist Application
const TouristApp = {
    init: () => {
        console.log('Tourist App initialized');
        TouristApp.loadDashboard();
        TouristApp.initLocationTracking();
        TouristApp.loadAlerts();
        TouristApp.loadSafetyTips();
        TouristApp.loadEmergencyContacts();
    },

    loadDashboard: () => {
        TouristApp.updateSafetyScore();
        TouristApp.updateUserInfo();
    },

    updateUserInfo: () => {
        const userNameEl = document.getElementById('userName');
        const userPhoneEl = document.getElementById('userPhone');

        if (userNameEl && AppState.currentUser) {
            userNameEl.textContent = AppState.currentUser.name;
        }
        if (userPhoneEl && AppState.currentUser) {
            userPhoneEl.textContent = AppState.currentUser.phone;
        }
    },

    updateSafetyScore: () => {
        const safetyCircle = document.querySelector('.safety-circle');
        const safetyValue = document.querySelector('.score-value');

        if (safetyCircle && AppState.currentLocation) {
            const score = Utils.calculateSafetyScore(AppState.currentLocation);

            if (safetyValue) {
                safetyValue.textContent = score + '%';
            }

            safetyCircle.className = 'safety-circle';
            if (score >= 80) safetyCircle.classList.add('high');
            else if (score >= 60) safetyCircle.classList.add('medium');
            else safetyCircle.classList.add('low');

            safetyCircle.textContent = score;
        }
    },

    initLocationTracking: () => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    AppState.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    TouristApp.updateSafetyScore();
                    TouristApp.sendLocationUpdate();
                },
                (error) => {
                    console.error('Location error:', error);
                    NotificationSystem.show('Location access denied', 'warning');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        }
    },

    sendLocationUpdate: async () => {
        if (AppState.currentLocation) {
            await API.updateLocation(AppState.currentLocation);
        }
    },

    triggerEmergency: async () => {
        if (!AppState.currentLocation) {
            NotificationSystem.show('Location not available', 'error');
            return;
        }

        const result = await API.triggerSOS({
            location: AppState.currentLocation,
            message: 'Emergency SOS activated by user'
        });

        if (result.success) {
            NotificationSystem.show('Emergency alert sent!', 'success');
        } else {
            NotificationSystem.show('Failed to send emergency alert', 'error');
        }
    },

    loadAlerts: async () => {
        const result = await API.getAlerts();

        if (result.success && result.data) {
            SampleData.alerts = result.data.alerts || [];
        }

        TouristApp.updateAlertsDisplay();
    },

    updateAlertsDisplay: () => {
        const alertsContainer = document.getElementById('alertsList');
        const allAlertsContainer = document.getElementById('allAlertsList');

        if (alertsContainer) {
            const nearbyAlerts = SampleData.alerts.filter(alert => 
                AppState.currentLocation && 
                Utils.calculateDistance(
                    AppState.currentLocation.lat, AppState.currentLocation.lng,
                    alert.location.lat, alert.location.lng
                ) <= 2000
            );

            if (nearbyAlerts.length === 0) {
                alertsContainer.innerHTML = '<p class="no-alerts">No alerts in your area</p>';
            } else {
                alertsContainer.innerHTML = '';
                nearbyAlerts.forEach(alert => {
                    const alertElement = TouristApp.createAlertElement(alert);
                    alertsContainer.appendChild(alertElement);
                });
            }
        }

        if (allAlertsContainer) {
            allAlertsContainer.innerHTML = '';
            SampleData.alerts.forEach(alert => {
                const alertElement = TouristApp.createAlertElement(alert, true);
                allAlertsContainer.appendChild(alertElement);
            });
        }

        // Update badge
        const badge = document.getElementById('alertsBadge');
        const activeAlerts = SampleData.alerts.filter(alert => alert.status === 'active').length;
        if (badge) {
            if (activeAlerts > 0) {
                badge.textContent = activeAlerts;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    createAlertElement: (alert, showFull = false) => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';

        const iconClass = {
            'sos': 'fa-exclamation-triangle',
            'geo-fence': 'fa-map-marker-alt',
            'incident': 'fa-clipboard-list'
        }[alert.type] || 'fa-bell';

        alertElement.innerHTML = `
            <div class="alert-icon ${alert.type}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <strong>${alert.message}</strong>
                    <span class="alert-time">${Utils.formatTime(alert.createdAt || alert.timestamp)}</span>
                </div>
                ${alert.description ? `<p class="alert-description">${alert.description}</p>` : ''}
                ${showFull ? `
                    <div class="alert-details">
                        <span class="alert-type">Type: ${alert.type.replace('-', ' ').toUpperCase()}</span>
                        <span class="alert-status ${alert.status}">${alert.status}</span>
                    </div>
                ` : ''}
            </div>
        `;

        return alertElement;
    },

    loadSafetyTips: () => {
        const tipsContainer = document.getElementById('safetyTips');
        if (!tipsContainer) return;

        tipsContainer.innerHTML = '';
        SampleData.safetyTips.forEach(tip => {
            const tipElement = document.createElement('div');
            tipElement.className = 'tip-item';
            tipElement.innerHTML = `
                <h4><i class="fas fa-lightbulb"></i> ${tip.title}</h4>
                <p>${tip.description}</p>
            `;
            tipsContainer.appendChild(tipElement);
        });
    },

    loadEmergencyContacts: () => {
        const contactsContainer = document.getElementById('emergencyContacts');
        if (!contactsContainer) return;

        contactsContainer.innerHTML = '';
        SampleData.emergencyContacts.forEach(contact => {
            const contactElement = document.createElement('div');
            contactElement.className = 'emergency-contact';
            contactElement.innerHTML = `
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p class="contact-number">${contact.number}</p>
                    <p class="contact-description">${contact.description}</p>
                </div>
                <button class="btn btn--secondary" onclick="window.open('tel:${contact.number}')">
                    <i class="fas fa-phone"></i> Call
                </button>
            `;
            contactsContainer.appendChild(contactElement);
        });
    }
};

// Authority Application
const AuthorityApp = {
    init: () => {
        console.log('Authority App initialized');
        AuthorityApp.loadDashboard();
        AuthorityApp.loadAlerts();
    },

    loadDashboard: () => {
        AuthorityApp.updateAuthorityInfo();
        AuthorityApp.loadTourists();
    },

    updateAuthorityInfo: () => {
        const authorityNameEl = document.getElementById('authorityName');
        const authorityDeptEl = document.getElementById('authorityDept');

        if (authorityNameEl && AppState.currentUser) {
            authorityNameEl.textContent = AppState.currentUser.name;
        }
        if (authorityDeptEl && AppState.currentUser) {
            authorityDeptEl.textContent = AppState.currentUser.department || 'Authority Department';
        }
    },

    loadTourists: () => {
        const touristsContainer = document.getElementById('touristsList');
        if (!touristsContainer) return;

        touristsContainer.innerHTML = '';
        SampleData.tourists.forEach(tourist => {
            const touristElement = document.createElement('div');
            touristElement.className = `tourist-item ${tourist.status}`;
            touristElement.innerHTML = `
                <div class="tourist-info">
                    <h4>${tourist.name}</h4>
                    <p>Phone: ${tourist.phone}</p>
                    <p>Safety Score: <span class="score">${tourist.safetyScore}%</span></p>
                    <span class="status-badge ${tourist.status}">${tourist.status}</span>
                </div>
                <div class="tourist-actions">
                    <button class="btn btn--small btn--primary" onclick="AuthorityApp.viewTouristDetails('${tourist.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn--small btn--secondary" onclick="window.open('tel:${tourist.phone}')">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
            `;
            touristsContainer.appendChild(touristElement);
        });
    },

    loadAlerts: async () => {
        const result = await API.getAlerts();

        if (result.success && result.data) {
            SampleData.alerts = result.data.alerts || [];
        }

        AuthorityApp.updateAlertsDisplay();
    },

    updateAlertsDisplay: () => {
        const alertsContainer = document.getElementById('authorityAlertsList');
        if (!alertsContainer) return;

        alertsContainer.innerHTML = '';
        SampleData.alerts.forEach(alert => {
            const alertElement = AuthorityApp.createAlertElement(alert);
            alertsContainer.appendChild(alertElement);
        });
    },

    createAlertElement: (alert) => {
        const alertElement = document.createElement('div');
        alertElement.className = 'authority-alert-item';

        const iconClass = {
            'sos': 'fa-exclamation-triangle',
            'geo-fence': 'fa-map-marker-alt',
            'incident': 'fa-clipboard-list'
        }[alert.type] || 'fa-bell';

        alertElement.innerHTML = `
            <div class="alert-icon ${alert.type}">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="alert-content">
                <div class="alert-header">
                    <strong>${alert.message}</strong>
                    <span class="alert-time">${Utils.formatTime(alert.createdAt || alert.timestamp)}</span>
                </div>
                ${alert.description ? `<p class="alert-description">${alert.description}</p>` : ''}
                <div class="alert-details">
                    <span class="alert-type">Type: ${alert.type.replace('-', ' ').toUpperCase()}</span>
                    <span class="alert-status ${alert.status}">${alert.status}</span>
                    ${alert.touristId ? `<span class="tourist-id">Tourist ID: ${alert.touristId}</span>` : ''}
                </div>
            </div>
            <div class="alert-actions">
                <button class="btn btn--small btn--primary" onclick="AuthorityApp.respondToAlert('${alert.id || alert._id}')">
                    <i class="fas fa-check"></i> Respond
                </button>
                <button class="btn btn--small btn--secondary" onclick="AuthorityApp.viewAlertLocation('${alert.id || alert._id}')">
                    <i class="fas fa-map"></i> Location
                </button>
            </div>
        `;

        return alertElement;
    },

    respondToAlert: async (alertId) => {
        // This would integrate with the backend to update alert status
        NotificationSystem.show('Alert response recorded', 'success');
    },

    viewAlertLocation: (alertId) => {
        const alert = SampleData.alerts.find(a => (a.id || a._id) === alertId);
        if (alert && alert.location) {
            // This would show the location on a map
            NotificationSystem.show(`Alert location: ${alert.location.lat}, ${alert.location.lng}`, 'info');
        }
    },

    viewTouristDetails: (touristId) => {
        const tourist = SampleData.tourists.find(t => t.id.toString() === touristId);
        if (tourist) {
            // This would show detailed tourist information
            NotificationSystem.show(`Viewing details for ${tourist.name}`, 'info');
        }
    }
};

// Modal System
const ModalSystem = {
    show: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    },

    hide: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    },

    hideAll: () => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }
};

// Navigation System
const Navigation = {
    showView: (viewId) => {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.remove('active'));

        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Update navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));

        const activeButton = document.querySelector(`[onclick="Navigation.showView('${viewId}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('SafeTrip App initialized');

    // Check authentication status
    AuthSystem.checkAuth();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            const userType = formData.get('userType');

            await AuthSystem.login(email, password, userType);
        });
    }

    // Registration form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                userType: formData.get('userType')
            };

            // Add user type specific fields
            if (userData.userType === 'tourist') {
                userData.emergencyContact = formData.get('emergencyContact');
                userData.idType = formData.get('idType');
                userData.idNumber = formData.get('idNumber');
                userData.nationality = formData.get('nationality') || 'Indian';
            } else if (userData.userType === 'authority') {
                userData.officerID = formData.get('officerID');
                userData.department = formData.get('department');
                userData.jurisdiction = formData.get('jurisdiction');
                userData.rank = formData.get('rank') || 'Officer';
            }

            await AuthSystem.register(userData);
        });
    }

    // Emergency button handler
    const emergencyButton = document.getElementById('emergencyButton');
    if (emergencyButton) {
        emergencyButton.addEventListener('click', TouristApp.triggerEmergency);
    }

    // Logout button handler
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', AuthSystem.logout);
    }

    // Modal close handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
            ModalSystem.hideAll();
        }
    });

    // Load geo-fences from backend
    API.getGeoFences().then(result => {
        if (result.success && result.data) {
            SampleData.geoFences = result.data;
        }
    });
});

// Make functions globally available
window.AuthSystem = AuthSystem;
window.TouristApp = TouristApp;
window.AuthorityApp = AuthorityApp;
window.ModalSystem = ModalSystem;
window.Navigation = Navigation;
window.API = API;
