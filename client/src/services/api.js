// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    console.log(`ApiService: Making request to: ${url} with method: ${config.method || 'GET'}`);

    try {
            const response = await fetch(url, config);

            if (response.status === 401 || response.status === 403) {
                console.warn('ApiService: Authentication failed or token expired. Clearing token.');
                localStorage.removeItem('token');
                // You might want to redirect to login page here or show a global error.
                const errorData = await response.json();
                throw new Error(errorData.message || 'Authentication failed or token expired.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return { message: 'Operation successful' };
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

  // --- Authentication Endpoints ---

  async testConnection() {
    return this.request('/api/health');
  }

  // Dedicated method for regular user sign-in (no adminKey here)
  async signIn(credentials) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Dedicated method for admin sign-in (requires adminKey)
  async adminSignIn(credentials) {
    // This endpoint should handle verifying the email, password, AND adminKey
    return this.request('/api/auth/admin/signin', {
      method: 'POST',
      body: JSON.stringify(credentials), // Should contain email, password, and adminKey
    });
  }

  // IMPORTANT: For Google Auth, you need a backend endpoint that accepts the token
  // and returns your application's JWT.
  async googleAuth(googleToken) {
    console.warn("ApiService: Calling POST /api/auth/google-verify-token. Ensure backend has a POST endpoint for Google token verification.");
    return this.request('/api/auth/google-verify-token', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  }

  // Dedicated method for regular user sign-up
  async signUp(userData) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Dedicated method for admin sign-up
  // This endpoint should allow an admin account to be created (email, password)
  // The adminKey is NOT sent here; it's verified during adminSignIn.
  async adminSignUp(adminData) {
    return this.request('/api/auth/admin/signup', {
      method: 'POST',
      body: JSON.stringify(adminData), // Only email and password for initial admin registration
    });
  }

  async verifyToken() {
    return this.request('/api/auth/me');
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // --- Other Endpoints (no changes needed for these based on this context) ---

  async getLabs() {
    return this.request('/api/labs');
  }

  async getLabById(id) {
    return this.request(`/api/labs/${id}`);
  }

  async createLab(labData) {
    return this.request('/api/admin/labs', {
      method: 'POST',
      body: JSON.stringify(labData),
    });
  }

  async updateLab(id, labData) {
    return this.request(`/api/admin/labs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(labData),
    });
  }

  async deleteLab(id) {
    return this.request(`/api/admin/labs/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request('/api/admin/users');
  }

  async getUserById(id) {
    return this.request(`/api/admin/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id, isActive) {
    return this.request(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

   async getAllTimetables() { // <--- Renamed for clarity
        return this.request('/api/timetable');
    }

    // This method now expects the backend to return { labId, schedule: [] } if no timetable found.
    async getTimetableByLabId(labId) {
        try {
            const data = await this.request(`/api/timetable/lab/${labId}`);
            // Backend now returns { labId, schedule: [] } on 200 OK if not found
            return data; // Return the full object, not just schedule
        } catch (error) {
            console.error(`Error fetching timetable for lab ID ${labId}:`, error);
            // If there's an actual network error or unexpected backend response, still throw.
            throw error;
        }
    }

    async createTimetable(timetableData) { // Expects { labId, labName, schedule }
        return this.request('/api/timetable', {
            method: 'POST',
            body: JSON.stringify(timetableData),
        });
    }

    // This calls your backend's PUT /api/timetable/:id
    async updateTimetable(timetableId, timetableData) { // Expects timetableId and { schedule, (optional: labName) }
        return this.request(`/api/timetable/${timetableId}`, {
            method: 'PUT',
            body: JSON.stringify(timetableData),
        });
    }

    // This calls your backend's DELETE /api/timetable/:id
    async deleteTimetable(timetableId) { // Expects timetableId
        return this.request(`/api/timetable/${timetableId}`, {
            method: 'DELETE',
        });
    }
  async getAdminStats() {
    return this.request('/api/admin/dashboard');
  }
}

export default new ApiService();