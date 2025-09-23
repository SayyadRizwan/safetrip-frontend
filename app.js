// Application State
const AppState = {
    currentUser: null,
    userType: null, // 'tourist' || 'authority'
    currentLocation: null,
    locationWatching: false,
    language: 'en',
    notifications: [],
    maps: {},
    charts: {}
};

// Sample Data
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
    alerts: [
        {id: 1, type: "geo-fence", message: "Tourist entered high-risk zone", location: {lat: 28.6139, lng: 77.2090}, timestamp: "2025-09-23T01:30:00Z", status: "active", touristId: 3},
        {id: 2, type: "sos", message: "Emergency SOS activated", location: {lat: 28.6129, lng: 77.2295}, timestamp: "2025-09-23T01:15:00Z", status: "resolved", touristId: 1},
        {id: 3, type: "incident", message: "Tourist reported unsafe conditions", location: {lat: 28.6562, lng: 77.2410}, timestamp: "2025-09-23T00:45:00Z", status: "investigating", touristId: 2}
    ],
    geoFences: [
        {id: 1, name: "India Gate Safe Zone", center: {lat: 28.6129, lng: 77.2295}, radius: 500, type: "safe", color: "#059669"},
        {id: 2, name: "Red Fort Tourist Area", center: {lat: 28.6562, lng: 77.2410}, radius: 300, type: "safe", color: "#059669"},
        {id: 3, name: "Construction Zone - Danger", center: {lat: 28.6139, lng: 77.2090}, radius: 200, type: "danger", color: "#dc2626"},
        {id: 4, name: "Crowded Market - Caution", center: {lat: 28.6506, lng: 77.2334}, radius: 150, type: "caution", color: "#ea580c"}
    ],
    incidents: [
        {id: 1, reporterId: 1, type: "theft", description: "Wallet stolen near market area", location: {lat: 28.6506, lng: 77.2334}, timestamp: "2025-09-22T18:30:00Z", status: "filed", officerId: 1},
        {id: 2, reporterId: 2, type: "harassment", description: "Tourist harassment reported", location: {lat: 28.6139, lng: 77.2090}, timestamp: "2025-09-22T15:20:00Z", status: "investigating", officerId: 1},
        {id: 3, reporterId: 3, type: "medical", description: "Tourist fell and injured", location: {lat: 28.6562, lng: 77.2410}, timestamp: "2025-09-22T12:10:00Z", status: "resolved", officerId: 3}
    ],
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
            <i class="fas ${icons[type]} notification-icon"></i>
            <div class="notification-content">
                <h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                <p>${message}</p>
            </div>
        `;
        
        const container = document.getElementById('notifications');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }
    }
};

// Location Services
const LocationService = {
    getCurrentLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                // Use fallback location (Delhi)
                const fallbackLocation = { lat: 28.6139, lng: 77.2090 };
                AppState.currentLocation = fallbackLocation;
                resolve(fallbackLocation);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    AppState.currentLocation = location;
                    resolve(location);
                },
                (error) => {
                    // Fallback to Delhi location
                    const fallbackLocation = { lat: 28.6139, lng: 77.2090 };
                    AppState.currentLocation = fallbackLocation;
                    resolve(fallbackLocation);
                }
            );
        });
    },

    watchLocation: () => {
        if (!navigator.geolocation || AppState.locationWatching) return;

        AppState.locationWatching = true;
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                AppState.currentLocation = newLocation;
                LocationService.checkGeoFences(newLocation);
                TouristApp.updateLocation(newLocation);
            },
            (error) => {
                console.warn('Location watch error:', error);
            },
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );
        
        return watchId;
    },

    checkGeoFences: (location) => {
        SampleData.geoFences.forEach(fence => {
            if (Utils.isInGeoFence(location, fence)) {
                if (fence.type === 'danger') {
                    NotificationSystem.show(
                        `Warning: You have entered ${fence.name}`,
                        'warning'
                    );
                    
                    // Add alert to system
                    const alert = {
                        id: Utils.generateId(),
                        type: 'geo-fence',
                        message: `Tourist entered ${fence.name}`,
                        location: location,
                        timestamp: new Date().toISOString(),
                        status: 'active',
                        touristId: AppState.currentUser?.id
                    };
                    SampleData.alerts.unshift(alert);
                }
            }
        });
    }
};

// Maps Integration
const MapService = {
    initMap: (containerId, center, options = {}) => {
        const defaultOptions = {
            zoom: 12,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        };

        const map = new google.maps.Map(
            document.getElementById(containerId),
            { ...defaultOptions, ...options }
        );

        AppState.maps[containerId] = map;
        return map;
    },

    addMarker: (map, position, options = {}) => {
        const marker = new google.maps.Marker({
            position: position,
            map: map,
            ...options
        });
        
        return marker;
    },

    addCircle: (map, center, radius, options = {}) => {
        const circle = new google.maps.Circle({
            strokeColor: options.strokeColor || '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: options.fillColor || '#FF0000',
            fillOpacity: 0.15,
            map: map,
            center: center,
            radius: radius
        });
        
        return circle;
    },

    addGeoFences: (map) => {
        SampleData.geoFences.forEach(fence => {
            MapService.addCircle(map, fence.center, fence.radius, {
                strokeColor: fence.color,
                fillColor: fence.color
            });
            
            MapService.addMarker(map, fence.center, {
                title: fence.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: fence.color,
                    fillOpacity: 0.8,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });
        });
    }
};

// Tourist Application
const TouristApp = {
    init: () => {
        TouristApp.loadDashboard();
        TouristApp.loadProfile();
        TouristApp.setupEventListeners();
        TouristApp.loadSafetyTips();
        TouristApp.loadEmergencyContacts();
        TouristApp.updateNearbyAlerts();
    },

    loadDashboard: () => {
        LocationService.getCurrentLocation().then(location => {
            const safetyScore = Utils.calculateSafetyScore(location);
            TouristApp.updateSafetyScore(safetyScore);
            TouristApp.updateSafetyStatus(safetyScore, location);
        });
    },

    updateSafetyScore: (score) => {
        const scoreElements = document.querySelectorAll('#safetyScore, #safetyScoreDisplay');
        const circleElement = document.getElementById('safetyCircle');
        
        scoreElements.forEach(el => {
            if (el) el.textContent = score;
        });
        
        if (circleElement) {
            circleElement.className = 'safety-circle';
            if (score >= 80) circleElement.classList.add('high');
            else if (score >= 60) circleElement.classList.add('medium');
            else circleElement.classList.add('low');
        }
    },

    updateSafetyStatus: (score, location) => {
        const statusElement = document.getElementById('safetyStatus');
        if (!statusElement) return;
        
        let status = '';
        if (score >= 80) status = 'You are in a safe area';
        else if (score >= 60) status = 'Exercise caution in this area';
        else status = 'High risk area - stay alert';
        
        statusElement.textContent = status;
    },

    loadProfile: () => {
        if (!AppState.currentUser) return;
        
        const user = AppState.currentUser;
        const profileName = document.getElementById('profileName');
        const profilePhone = document.getElementById('profilePhone');
        const profileEmail = document.getElementById('profileEmail');
        const profileEmergency = document.getElementById('profileEmergency');
        const touristNameDisplay = document.getElementById('touristNameDisplay');
        
        if (profileName) profileName.textContent = user.name;
        if (profilePhone) profilePhone.textContent = user.phone;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileEmergency) profileEmergency.textContent = user.emergencyContact;
        if (touristNameDisplay) touristNameDisplay.textContent = `Welcome, ${user.name.split(' ')[0]}`;
    },

    loadSafetyTips: () => {
        const tipsContainer = document.getElementById('safetyTips');
        if (!tipsContainer) return;
        
        tipsContainer.innerHTML = '';
        SampleData.safetyTips.forEach(tip => {
            const tipElement = document.createElement('div');
            tipElement.className = 'tip-item';
            tipElement.innerHTML = `
                <h6>${tip.title}</h6>
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
                <i class="fas fa-phone"></i>
                <div class="emergency-contact-info">
                    <h6>${contact.name}</h6>
                    <p>${contact.number}</p>
                </div>
            `;
            contactElement.onclick = () => {
                if (confirm(`Call ${contact.name} at ${contact.number}?`)) {
                    window.open(`tel:${contact.number}`);
                }
            };
            contactsContainer.appendChild(contactElement);
        });
    },

    updateNearbyAlerts: () => {
        const alertsContainer = document.getElementById('nearbyAlerts');
        const allAlertsContainer = document.getElementById('allAlertsList');
        
        if (alertsContainer) {
            const nearbyAlerts = SampleData.alerts.filter(alert => alert.status === 'active').slice(0, 3);
            
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
                <h5>${alert.message}</h5>
                <p>Type: ${alert.type.replace('-', ' ').toUpperCase()}</p>
                ${showFull ? `<div class="alert-time">${Utils.formatTime(alert.timestamp)}</div>` : ''}
                <span class="status status--${alert.status}">${alert.status}</span>
            </div>
        `;
        
        return alertElement;
    },

    initMap: () => {
        LocationService.getCurrentLocation().then(location => {
            const map = MapService.initMap('touristMapView', location, { zoom: 15 });
            
            // Add user location marker
            MapService.addMarker(map, location, {
                title: 'Your Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#2563eb',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                }
            });
            
            // Add geo-fences
            MapService.addGeoFences(map);
            
            // Center map button
            const centerMapBtn = document.getElementById('centerMapBtn');
            if (centerMapBtn) {
                centerMapBtn.onclick = () => {
                    LocationService.getCurrentLocation().then(loc => {
                        map.setCenter(loc);
                        map.setZoom(15);
                    });
                };
            }
        });
    },

    updateLocation: (location) => {
        const safetyScore = Utils.calculateSafetyScore(location);
        TouristApp.updateSafetyScore(safetyScore);
        TouristApp.updateSafetyStatus(safetyScore, location);
    },

    setupEventListeners: () => {
        // Emergency button
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.onclick = TouristApp.handleEmergency;
        }
        
        // Location toggle
        const locationToggle = document.getElementById('locationToggle');
        if (locationToggle) {
            locationToggle.onclick = TouristApp.toggleLocation;
        }
        
        // Report incident
        const reportIncidentBtn = document.getElementById('reportIncidentBtn');
        if (reportIncidentBtn) {
            reportIncidentBtn.onclick = () => {
                openModal('reportIncidentModal');
            };
        }
        
        // Report incident form
        const reportIncidentForm = document.getElementById('reportIncidentForm');
        if (reportIncidentForm) {
            reportIncidentForm.onsubmit = TouristApp.handleIncidentReport;
        }
        
        // Location sharing toggle
        const locationSharingToggle = document.getElementById('locationSharingToggle');
        if (locationSharingToggle) {
            locationSharingToggle.onchange = (e) => {
                if (e.target.checked) {
                    LocationService.watchLocation();
                    NotificationSystem.show('Location sharing enabled', 'success');
                } else {
                    AppState.locationWatching = false;
                    NotificationSystem.show('Location sharing disabled', 'info');
                }
            };
        }
    },

    handleEmergency: () => {
        LocationService.getCurrentLocation().then(location => {
            // Create emergency alert
            const alert = {
                id: Utils.generateId(),
                type: 'sos',
                message: 'Emergency SOS activated',
                location: location,
                timestamp: new Date().toISOString(),
                status: 'active',
                touristId: AppState.currentUser?.id
            };
            
            SampleData.alerts.unshift(alert);
            
            // Show emergency modal
            const emergencyLocation = document.getElementById('emergencyLocation');
            const emergencyTime = document.getElementById('emergencyTime');
            
            if (emergencyLocation) {
                emergencyLocation.textContent = `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
            }
            if (emergencyTime) {
                emergencyTime.textContent = Utils.formatTime(alert.timestamp);
            }
            
            openModal('emergencyModal');
            
            // Setup emergency actions
            const callPolice = document.getElementById('callPolice');
            const callMedical = document.getElementById('callMedical');
            
            if (callPolice) {
                callPolice.onclick = () => {
                    window.open('tel:100');
                };
            }
            if (callMedical) {
                callMedical.onclick = () => {
                    window.open('tel:108');
                };
            }
            
            NotificationSystem.show('Emergency alert sent to authorities', 'error');
            TouristApp.updateNearbyAlerts();
        });
    },

    toggleLocation: () => {
        const button = document.getElementById('locationToggle');
        const span = button?.querySelector('span');
        
        if (!button || !span) return;
        
        if (AppState.locationWatching) {
            AppState.locationWatching = false;
            span.textContent = 'Location: OFF';
            button.classList.remove('btn--primary');
            button.classList.add('btn--secondary');
        } else {
            LocationService.watchLocation();
            span.textContent = 'Location: ON';
            button.classList.remove('btn--secondary');
            button.classList.add('btn--primary');
        }
    },

    handleIncidentReport: (e) => {
        e.preventDefault();
        
        const typeEl = document.getElementById('incidentType');
        const descriptionEl = document.getElementById('incidentDescription');
        
        if (!typeEl || !descriptionEl) return;
        
        const type = typeEl.value;
        const description = descriptionEl.value;
        
        LocationService.getCurrentLocation().then(location => {
            const incident = {
                id: Utils.generateId(),
                reporterId: AppState.currentUser?.id,
                type: type,
                description: description,
                location: location,
                timestamp: new Date().toISOString(),
                status: 'filed',
                officerId: 1
            };
            
            SampleData.incidents.unshift(incident);
            
            const alert = {
                id: Utils.generateId(),
                type: 'incident',
                message: `Incident reported: ${type}`,
                location: location,
                timestamp: new Date().toISOString(),
                status: 'active',
                touristId: AppState.currentUser?.id
            };
            
            SampleData.alerts.unshift(alert);
            
            closeModal('reportIncidentModal');
            NotificationSystem.show('Incident report submitted successfully', 'success');
            TouristApp.updateNearbyAlerts();
            
            e.target.reset();
        });
    }
};

// Authority Application
const AuthorityApp = {
    init: () => {
        AuthorityApp.loadDashboard();
        AuthorityApp.loadStats();
        AuthorityApp.updateAlerts();
        AuthorityApp.loadIncidents();
        AuthorityApp.setupEventListeners();
        AuthorityApp.initCharts();
    },

    loadDashboard: () => {
        AuthorityApp.loadProfile();
        AuthorityApp.initDashboardMap();
    },

    loadProfile: () => {
        if (!AppState.currentUser) return;
        
        const user = AppState.currentUser;
        const authorityNameDisplay = document.getElementById('authorityNameDisplay');
        const authorityDeptDisplay = document.getElementById('authorityDeptDisplay');
        
        if (authorityNameDisplay) authorityNameDisplay.textContent = user.name;
        if (authorityDeptDisplay) authorityDeptDisplay.textContent = user.department;
    },

    loadStats: () => {
        const totalTourists = SampleData.tourists.filter(t => t.status === 'active').length;
        const totalAlerts = SampleData.alerts.filter(a => a.status === 'active').length;
        const safeZones = SampleData.geoFences.filter(g => g.type === 'safe').length;
        const totalIncidents = SampleData.incidents.length;
        
        const totalTouristsEl = document.getElementById('totalTourists');
        const totalAlertsEl = document.getElementById('totalAlerts');
        const safeZonesEl = document.getElementById('safeZones');
        const totalIncidentsEl = document.getElementById('totalIncidents');
        const activeAlertsCountEl = document.getElementById('activeAlertsCount');
        
        if (totalTouristsEl) totalTouristsEl.textContent = totalTourists;
        if (totalAlertsEl) totalAlertsEl.textContent = totalAlerts;
        if (safeZonesEl) safeZonesEl.textContent = safeZones;
        if (totalIncidentsEl) totalIncidentsEl.textContent = totalIncidents;
        if (activeAlertsCountEl) activeAlertsCountEl.textContent = totalAlerts;
    },

    updateAlerts: () => {
        // Recent alerts for dashboard
        const recentAlertsContainer = document.getElementById('recentAlerts');
        if (recentAlertsContainer) {
            recentAlertsContainer.innerHTML = '';
            const recentAlerts = SampleData.alerts.slice(0, 5);
            
            recentAlerts.forEach(alert => {
                const alertElement = document.createElement('div');
                alertElement.className = 'alert-item';
                alertElement.innerHTML = `
                    <div class="alert-icon ${alert.type}">
                        <i class="fas ${AuthorityApp.getAlertIcon(alert.type)}"></i>
                    </div>
                    <div class="alert-content">
                        <h5>${alert.message}</h5>
                        <p>Tourist ID: ${alert.touristId}</p>
                        <div class="alert-time">${Utils.formatTime(alert.timestamp)}</div>
                        <span class="status status--${alert.status}">${alert.status}</span>
                    </div>
                `;
                recentAlertsContainer.appendChild(alertElement);
            });
        }
        
        // Alert management list
        const alertManagementContainer = document.getElementById('alertManagementList');
        if (alertManagementContainer) {
            AuthorityApp.renderAlertManagement();
        }
    },

    renderAlertManagement: () => {
        const container = document.getElementById('alertManagementList');
        const statusFilterEl = document.getElementById('alertStatusFilter');
        const typeFilterEl = document.getElementById('alertTypeFilter');
        
        if (!container) return;
        
        const statusFilter = statusFilterEl?.value || '';
        const typeFilter = typeFilterEl?.value || '';
        
        let filteredAlerts = SampleData.alerts;
        
        if (statusFilter) {
            filteredAlerts = filteredAlerts.filter(alert => alert.status === statusFilter);
        }
        
        if (typeFilter) {
            filteredAlerts = filteredAlerts.filter(alert => alert.type === typeFilter);
        }
        
        container.innerHTML = '';
        
        filteredAlerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = 'alert-management-item';
            alertElement.innerHTML = `
                <div class="alert-management-content">
                    <h5>${alert.message}</h5>
                    <p><strong>Type:</strong> ${alert.type} | <strong>Tourist ID:</strong> ${alert.touristId}</p>
                    <p><strong>Location:</strong> ${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}</p>
                    <p><strong>Time:</strong> ${Utils.formatTime(alert.timestamp)}</p>
                    <span class="status status--${alert.status}">${alert.status}</span>
                </div>
                <div class="alert-management-actions">
                    ${alert.status === 'active' ? `
                        <button class="btn btn--sm btn--primary" onclick="AuthorityApp.resolveAlert(${alert.id})">
                            <i class="fas fa-check"></i> Resolve
                        </button>
                        <button class="btn btn--sm btn--secondary" onclick="AuthorityApp.investigateAlert(${alert.id})">
                            <i class="fas fa-search"></i> Investigate
                        </button>
                    ` : ''}
                </div>
            `;
            container.appendChild(alertElement);
        });
    },

    loadIncidents: () => {
        const incidentsContainer = document.getElementById('incidentsList');
        if (!incidentsContainer) return;
        
        incidentsContainer.innerHTML = '';
        
        SampleData.incidents.forEach(incident => {
            const incidentElement = document.createElement('div');
            incidentElement.className = 'incident-item';
            incidentElement.innerHTML = `
                <div class="incident-header">
                    <div class="incident-type">${incident.type}</div>
                    <span class="status status--${incident.status}">${incident.status}</span>
                </div>
                <div class="incident-content">
                    <h5>Incident Report #${incident.id}</h5>
                    <p>${incident.description}</p>
                    <div class="incident-meta">
                        <span>Reporter ID: ${incident.reporterId}</span>
                        <span>${Utils.formatTime(incident.timestamp)}</span>
                    </div>
                </div>
            `;
            incidentsContainer.appendChild(incidentElement);
        });
    },

    initDashboardMap: () => {
        const map = MapService.initMap('authorityMapView', { lat: 28.6139, lng: 77.2090 }, { zoom: 11 });
        
        // Add tourist locations
        SampleData.tourists.forEach(tourist => {
            if (tourist.status === 'active') {
                MapService.addMarker(map, tourist.location, {
                    title: tourist.name,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: tourist.status === 'alert' ? '#dc2626' : '#059669',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });
            }
        });
        
        // Add geo-fences
        MapService.addGeoFences(map);
    },

    initHeatmap: () => {
        const map = MapService.initMap('heatmapView', { lat: 28.6139, lng: 77.2090 }, { zoom: 11 });
        
        // Add all tourist locations with larger markers for heatmap effect
        SampleData.tourists.forEach(tourist => {
            if (tourist.status === 'active') {
                MapService.addMarker(map, tourist.location, {
                    title: `${tourist.name} (Safety Score: ${tourist.safetyScore})`,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: tourist.safetyScore >= 80 ? '#059669' : tourist.safetyScore >= 60 ? '#ea580c' : '#dc2626',
                        fillOpacity: 0.8,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    }
                });
            }
        });
        
        // Add geo-fences
        MapService.addGeoFences(map);
    },

    initCharts: () => {
        // Safety Score Distribution Chart
        const safetyCtx = document.getElementById('safetyChart');
        if (safetyCtx && window.Chart) {
            const safetyScores = SampleData.tourists.map(t => t.safetyScore);
            const scoreRanges = {
                'High (80-100)': safetyScores.filter(s => s >= 80).length,
                'Medium (60-79)': safetyScores.filter(s => s >= 60 && s < 80).length,
                'Low (0-59)': safetyScores.filter(s => s < 60).length
            };
            
            AppState.charts.safety = new Chart(safetyCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(scoreRanges),
                    datasets: [{
                        data: Object.values(scoreRanges),
                        backgroundColor: ['#059669', '#ea580c', '#dc2626'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Incident Types Chart
        const incidentCtx = document.getElementById('incidentChart');
        if (incidentCtx && window.Chart) {
            const incidentTypes = {};
            SampleData.incidents.forEach(incident => {
                incidentTypes[incident.type] = (incidentTypes[incident.type] || 0) + 1;
            });
            
            AppState.charts.incidents = new Chart(incidentCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(incidentTypes),
                    datasets: [{
                        data: Object.values(incidentTypes),
                        backgroundColor: '#1FB8CD',
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },

    setupEventListeners: () => {
        // Alert filters
        const statusFilter = document.getElementById('alertStatusFilter');
        const typeFilter = document.getElementById('alertTypeFilter');
        
        if (statusFilter) {
            statusFilter.onchange = AuthorityApp.renderAlertManagement;
        }
        if (typeFilter) {
            typeFilter.onchange = AuthorityApp.renderAlertManagement;
        }
        
        // Refresh heatmap
        const refreshHeatmap = document.getElementById('refreshHeatmap');
        if (refreshHeatmap) {
            refreshHeatmap.onclick = () => {
                AuthorityApp.initHeatmap();
                NotificationSystem.show('Heatmap refreshed', 'success');
            };
        }
        
        // Generate e-FIR
        const generateEFIR = document.getElementById('generateEFIR');
        if (generateEFIR) {
            generateEFIR.onclick = AuthorityApp.generateEFIR;
        }
    },

    getAlertIcon: (type) => {
        const icons = {
            'sos': 'fa-exclamation-triangle',
            'geo-fence': 'fa-map-marker-alt',
            'incident': 'fa-clipboard-list'
        };
        return icons[type] || 'fa-bell';
    },

    resolveAlert: (alertId) => {
        const alert = SampleData.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'resolved';
            AuthorityApp.renderAlertManagement();
            AuthorityApp.loadStats();
            NotificationSystem.show('Alert resolved successfully', 'success');
        }
    },

    investigateAlert: (alertId) => {
        const alert = SampleData.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.status = 'investigating';
            AuthorityApp.renderAlertManagement();
            NotificationSystem.show('Alert status updated to investigating', 'info');
        }
    },

    generateEFIR: () => {
        const firData = {
            id: `FIR${Utils.generateId()}`,
            timestamp: new Date().toISOString(),
            incidents: SampleData.incidents.filter(i => i.status === 'filed').length,
            officer: AppState.currentUser?.name
        };
        
        NotificationSystem.show(`e-FIR ${firData.id} generated successfully`, 'success');
    }
};

// Authentication System
const AuthSystem = {
    loginTourist: (formData) => {
        const tourist = {
            id: Utils.generateId(),
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            emergencyContact: formData.emergencyContact,
            location: { lat: 28.6139, lng: 77.2090 },
            safetyScore: 85,
            status: 'active'
        };
        
        SampleData.tourists.push(tourist);
        AppState.currentUser = tourist;
        AppState.userType = 'tourist';
        
        return tourist;
    },

    loginAuthority: (officerID, department) => {
        const authority = SampleData.authorities.find(a => 
            a.officerID === officerID && a.department === department
        );
        
        if (authority) {
            AppState.currentUser = authority;
            AppState.userType = 'authority';
            return authority;
        }
        
        return null;
    },

    logout: () => {
        AppState.currentUser = null;
        AppState.userType = null;
        AppState.currentLocation = null;
        AppState.locationWatching = false;
        
        showView('landingPage');
    }
};

// Navigation System
const Navigation = {
    init: () => {
        // Tourist navigation
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const viewId = item.dataset.view;
                Navigation.showTouristView(viewId);
                
                // Update active state
                document.querySelectorAll('.bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Authority navigation
        document.querySelectorAll('.sidebar .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const viewId = item.dataset.view;
                Navigation.showAuthorityView(viewId);
                
                // Update active state
                document.querySelectorAll('.sidebar .nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    showTouristView: (viewId) => {
        document.querySelectorAll('.app-main .view').forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Initialize specific views
        if (viewId === 'touristMap') {
            setTimeout(() => TouristApp.initMap(), 100);
        }
    },

    showAuthorityView: (viewId) => {
        document.querySelectorAll('.authority-main .view').forEach(view => view.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Initialize specific views
        if (viewId === 'touristHeatmap') {
            setTimeout(() => AuthorityApp.initHeatmap(), 100);
        } else if (viewId === 'analytics') {
            setTimeout(() => AuthorityApp.initCharts(), 100);
        }
    }
};

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showView(viewId) {
    // Hide all main views
    document.querySelectorAll('.landing-page, .app-container').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
    }
}

// Event Listeners Setup
function setupMainEventListeners() {
    // Landing page buttons
    const touristLoginBtn = document.getElementById('touristLoginBtn');
    const authorityLoginBtn = document.getElementById('authorityLoginBtn');
    
    if (touristLoginBtn) {
        touristLoginBtn.addEventListener('click', () => {
            openModal('touristLoginModal');
        });
    }
    
    if (authorityLoginBtn) {
        authorityLoginBtn.addEventListener('click', () => {
            openModal('authorityLoginModal');
        });
    }
    
    // Tourist login form
    const touristLoginForm = document.getElementById('touristLoginForm');
    if (touristLoginForm) {
        touristLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('touristName').value,
                phone: document.getElementById('touristPhone').value,
                email: document.getElementById('touristEmail').value,
                emergencyContact: document.getElementById('touristEmergency').value
            };
            
            const user = AuthSystem.loginTourist(formData);
            closeModal('touristLoginModal');
            showView('touristApp');
            TouristApp.init();
            
            NotificationSystem.show(`Welcome ${user.name}! Stay safe during your travels.`, 'success');
        });
    }
    
    // Authority login form
    const authorityLoginForm = document.getElementById('authorityLoginForm');
    if (authorityLoginForm) {
        authorityLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const officerID = document.getElementById('officerID').value;
            const department = document.getElementById('department').value;
            
            const user = AuthSystem.loginAuthority(officerID, department);
            
            if (user) {
                closeModal('authorityLoginModal');
                showView('authorityApp');
                AuthorityApp.init();
                
                NotificationSystem.show(`Welcome ${user.name} from ${user.department}`, 'success');
            } else {
                NotificationSystem.show('Invalid credentials. Please check your Officer ID and Department.', 'error');
            }
        });
    }
    
    // Logout buttons
    const logoutBtn = document.getElementById('logoutBtn');
    const authorityLogoutBtn = document.getElementById('authorityLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', AuthSystem.logout);
    }
    if (authorityLogoutBtn) {
        authorityLogoutBtn.addEventListener('click', AuthSystem.logout);
    }
    
    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            AppState.language = e.target.value;
            NotificationSystem.show('Language updated', 'success');
        });
    }
    
    // Modal close on outside click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen first
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const landingPage = document.getElementById('landingPage');
        
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (landingPage) landingPage.classList.remove('hidden');
    }, 2000);
    
    // Setup main event listeners
    setupMainEventListeners();
    
    // Initialize navigation
    Navigation.init();
});

// Global functions for inline onclick handlers
window.AuthorityApp = AuthorityApp;
window.openModal = openModal;
window.closeModal = closeModal;

// Real-time updates simulation
setInterval(() => {
    if (AppState.userType === 'tourist') {
        TouristApp.updateNearbyAlerts();
    } else if (AppState.userType === 'authority') {
        AuthorityApp.loadStats();
    }
}, 30000); // Update every 30 seconds