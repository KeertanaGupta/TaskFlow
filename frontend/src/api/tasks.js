const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/bfhl';

export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.minImportance) {
    params.append('minImportance', filters.minImportance);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE}/tasks${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch tasks (Status: ${response.status})`);
  }
  return response.json();
};

export const getStats = async () => {
  const response = await fetch(`${API_BASE}/tasks/stats`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch statistics (Status: ${response.status})`);
  }
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to create task (Status: ${response.status})`);
  }
  return response.json();
};

export const updateTask = async (id, updateData) => {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to update task (Status: ${response.status})`);
  }
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to delete task (Status: ${response.status})`);
  }
  return response.json();
};
