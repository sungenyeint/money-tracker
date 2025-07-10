import { getAuth } from 'firebase/auth';
import { Transaction } from './../types/transaction';

const getAuthToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error('User not authenticated.');
    }
    return await user.getIdToken();
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
        throw new Error(errorData.error || 'API request failed');
    }

    // Handle responses with no content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const getTransactions = async () => {
    return apiFetch('/api/transactions');
};

export const insertTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    return apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
    });
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    return apiFetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transaction),
    });
};

export const destroyTransaction = async (id: string) => {
    return apiFetch(`/api/transactions/${id}`, {
        method: 'DELETE',
    });
};
