const API_URL = 'http://localhost:5000/api';

export const loginAdmin = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
};

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const getDashboard = async () => {
    const res = await fetch(`${API_URL}/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
};

export const getMembers = async () => {
    const res = await fetch(`${API_URL}/members`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
};

export const getMember = async (id) => {
    const res = await fetch(`${API_URL}/members/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch member');
    return res.json();
};

export const createMember = async (memberData) => {
    const res = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!res.ok) throw new Error('Failed to create member');
    return res.json();
};

export const updateMember = async (id, memberData) => {
    const res = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
};

export const deleteMember = async (id) => {
    const res = await fetch(`${API_URL}/members/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete member');
    return true;
};
