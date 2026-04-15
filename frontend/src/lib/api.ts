const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return res.json();
    },
    me: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  patients: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/patients`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_URL}/patients/${id}`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  schedules: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/schedules`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getToday: async () => {
      const res = await fetch(`${API_URL}/schedules/today`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getUpcoming: async () => {
      const res = await fetch(`${API_URL}/schedules/upcoming`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/schedules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    updateStatus: async (id: string, status: string) => {
      const res = await fetch(`${API_URL}/schedules/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
  },
};