import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

let accessToken: string | null = null;

export async function login(username: string, password: string) {
  const response = await axios.post(`${API_BASE}/accounts/login/`, { username, password });
  accessToken = response.data.access;
  if (typeof window !== "undefined" && accessToken) {
    window.localStorage.setItem("accessToken", accessToken);
  }
  return response.data;
}

function getAuthHeaders() {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = window.localStorage.getItem("accessToken");
  }
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function getDashboardSummary() {
  const response = await axios.get(`${API_BASE}/dashboard/summary/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getModuleById(id: string) {
  const response = await axios.get(`${API_BASE}/modules/${id}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getModules() {
  const response = await axios.get(`${API_BASE}/modules/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getProformas() {
  const response = await axios.get(`${API_BASE}/proformas/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getProformaById(id: string) {
  const response = await axios.get(`${API_BASE}/proformas/${id}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getAssignments() {
  const response = await axios.get(`${API_BASE}/assignments/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getAssignmentById(id: string) {
  const response = await axios.get(`${API_BASE}/assignments/${id}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getInstitutions() {
  const response = await axios.get(`${API_BASE}/organizations/institutions/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function getPGCompliances(institutionId?: string, itemId?: string) {
  let url = `${API_BASE}/pg/compliance/`;
  const params = new URLSearchParams();
  if (institutionId) params.append('institution', institutionId);
  if (itemId) params.append('item', itemId);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await axios.get(url, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function createPGCompliance(data: any) {
  const response = await axios.post(`${API_BASE}/pg/compliance/`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function updatePGCompliance(id: string, data: any) {
  const response = await axios.patch(`${API_BASE}/pg/compliance/${id}/`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
