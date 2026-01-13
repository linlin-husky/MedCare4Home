export function fetchSession() {
    return fetch('/api/v1/session', {
        method: 'GET',
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchUserList() {
    return fetch('/api/v1/userlist', {
        method: 'GET',
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchAllUserDetails() {
    return fetch("/api/v1/users/all-details")
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then((res) => res.json());
}

export function fetchSignup(username, email) {
    return fetch('/api/v1/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchLogin(username) {
    return fetch('/api/v1/session', {
        method: 'POST',
        headers: new Headers({
            'content-type': 'application/json'
        }),
        body: JSON.stringify({ username }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchLogout() {
    return fetch('/api/v1/session', {
        method: 'DELETE',
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchSubscribe(data) {
    return fetch("/api/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })));
}

export function fetchBorrow(itemId, borrower, borrowDate, dueDate) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            borrower,
            borrowDate,
            dueDate,
        }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchReserve(itemId, username, startDate, dueDate) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            reservation: {
                username,
                startDate,
                dueDate,
            }
        })
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchModifyReserve(itemId, username, startDate, dueDate) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            reservation: {
                username,
                startDate,
                dueDate,
            },
        }),
    })
        .catch(() => Promise.reject(new Error('Network error')))
        .then(handleFetchResponse);
}

export function fetchBorrowNowFromReserve(itemId, username, dueDate) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            borrower: username,
            borrowDate: new Date().toISOString().slice(0, 10),
            dueDate,
            reservation: null,
        }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchCancelReserve(itemId) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation: null }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchReturn(itemId, returnedDate) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            borrower: null,
            borrorDate: null,
            dueDate: null,
            returnedDate,
        }),
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchAllItems() {
    return fetch("/api/v1/items")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch items");
            return res.json();
        })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then((data) => (data && data.items ? Object.values(data.items) : []));
}

export function fetchDelete(itemId) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "DELETE",
    })
        .catch(() => Promise.reject({ error: 'networkError' }))
        .then(handleFetchResponse);
}

export function fetchUpdateItem(itemId, itemData) {
    return fetch(`/api/v1/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
    })
        .catch(() => Promise.reject({ error: 'networkError' }));
}

export function fetchCreateItem(itemData) {
    return fetch("/api/v1/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
    })
        .catch(() => Promise.reject({ error: 'networkError' }));
}

function handleFetchResponse(response) {
    if (response.ok) {
        return response.json();
    }

    return response.json()
        .catch(error => Promise.reject({ error }))
        .then(err => Promise.reject(err));
}