const TOKEN_STORAGE_KEY = "bookdesk.auth";

function getStoredAuth() {
    const rawAuth = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!rawAuth) {
        return null;
    }

    try {
        return JSON.parse(rawAuth);
    } catch {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }
}

function saveAuth(auth) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getAuthHeader() {
    const auth = getStoredAuth();
    return auth?.token ? {"Authorization": `Token ${auth.token}`} : {};
}

async function parseResponse(response) {
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    if (!response.ok) {
        const message = Object.entries(data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(" ") : errors}`)
            .join(" ");
        throw new Error(message || "The request could not be completed.");
    }

    return data;
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.body ? {"Content-Type": "application/json"} : {}),
            ...(options.auth ? getAuthHeader() : {}),
            ...options.headers,
        },
    });
    return parseResponse(response);
}

export const authStore = {
    get: getStoredAuth,
    save: saveAuth,
    clear: clearAuth,
};

export async function login(username, password) {
    const data = await requestJson("/api/token/", {
        method: "POST",
        body: JSON.stringify({username, password}),
    });
    saveAuth(data);
    return data;
}

export async function logout() {
    const auth = getStoredAuth();
    if (!auth?.token) {
        clearAuth();
        return;
    }

    try {
        await requestJson("/api/logout/", {
            method: "POST",
            auth: true,
        });
    } catch {
        // The local session should still be cleared if the token is already invalid.
    } finally {
        clearAuth();
    }
}

export function getBooks(query) {
    return requestJson(`/api/books/?${query}`);
}

export async function getBook(bookId) {
    const data = await requestJson(`/api/books/${bookId}/`);
    return data.book;
}

export function createBook(payload) {
    return requestJson("/api/books/", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
    });
}

export function updateBook(bookId, payload) {
    return requestJson(`/api/books/${bookId}/`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
    });
}

export function deleteBook(bookId) {
    return requestJson(`/api/books/${bookId}/`, {
        method: "DELETE",
        auth: true,
    });
}
