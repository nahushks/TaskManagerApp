// Use relative URLs when the app is built and served by Express
// In development, the Vite dev server proxies API requests to the Express backend
const API_BASE = '/api';

// Load all tasks with optional filter
export async function loadTasks({ request }) {
  try {
    const url = new URL(request.url);
    const complete = url.searchParams.get('complete');
    
    let endpoint = `${API_BASE}/tasks`;
    if (complete !== null) {
      endpoint += `?complete=${complete}`;
    }
    
    console.log('Fetching tasks from:', endpoint);
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.error || `Failed to fetch tasks: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Tasks fetched:', data);
    return data;
  } catch (error) {
    console.error('Error loading tasks:', error);
    // Return empty array instead of throwing to prevent route error
    return [];
  }
}

// Load a single task by ID
export async function loadTask(id) {
  try {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch task with ID ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading task ${id}:`, error);
    // Return a default task object
    return { id, title: 'Error loading task', description: '', complete: false };
  }
}

// Create a new task
export async function createTask(taskData) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return await response.json();
}

// Update an existing task
export async function updateTask(id, taskData) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update task with ID ${id}`);
  }
  return await response.json();
}

// Delete a task
export async function deleteTask(id) {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete task with ID ${id}`);
  }
  return await response.json();
} 