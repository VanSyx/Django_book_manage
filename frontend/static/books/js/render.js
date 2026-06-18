export const elements = {
    tableBody: document.querySelector("#book-table-body"),
    tableState: document.querySelector("#table-state"),
    errorMessage: document.querySelector("#error-message"),
    resultStatus: document.querySelector("#result-status"),
    totalBooks: document.querySelector("#total-books"),
    summaryPage: document.querySelector("#summary-page"),
    rowsShown: document.querySelector("#rows-shown"),
    currentPage: document.querySelector("#current-page"),
    totalPages: document.querySelector("#total-pages"),
    previousPage: document.querySelector("#previous-page"),
    nextPage: document.querySelector("#next-page"),
    filterForm: document.querySelector("#filter-form"),
    filterTitle: document.querySelector("#filter-title"),
    filterAuthor: document.querySelector("#filter-author"),
    pageSize: document.querySelector("#page-size"),
    clearFilters: document.querySelector("#clear-filters"),
    formModal: document.querySelector("#book-form-modal"),
    bookForm: document.querySelector("#book-form"),
    bookId: document.querySelector("#book-id"),
    bookTitle: document.querySelector("#book-title"),
    bookAuthor: document.querySelector("#book-author"),
    bookPrice: document.querySelector("#book-price"),
    bookQuantity: document.querySelector("#book-quantity"),
    formTitle: document.querySelector("#form-title"),
    formEyebrow: document.querySelector("#form-eyebrow"),
    formError: document.querySelector("#form-error"),
    saveBook: document.querySelector("#save-book"),
    detailModal: document.querySelector("#detail-modal"),
    detailTitle: document.querySelector("#detail-title"),
    detailAuthor: document.querySelector("#detail-author"),
    detailPrice: document.querySelector("#detail-price"),
    detailQuantity: document.querySelector("#detail-quantity"),
    detailDate: document.querySelector("#detail-date"),
    toast: document.querySelector("#toast"),
    openAddModal: document.querySelector("#open-add-modal"),
    loginForm: document.querySelector("#login-form"),
    loginUsername: document.querySelector("#login-username"),
    loginPassword: document.querySelector("#login-password"),
    loginButton: document.querySelector("#login-button"),
    authSession: document.querySelector("#auth-session"),
    authUser: document.querySelector("#auth-user"),
    logoutButton: document.querySelector("#logout-button"),
};

export function formatPrice(value) {
    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    window.setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

export function setLoading(isLoading, state) {
    elements.resultStatus.textContent = isLoading ? "Loading" : "Ready";
    elements.previousPage.disabled = isLoading || state.page <= 1;
    elements.nextPage.disabled = isLoading || state.page >= state.totalPages;
}

export function setError(message = "") {
    elements.errorMessage.textContent = message;
    elements.errorMessage.hidden = !message;
}

export function setAuthState(auth) {
    const isAuthenticated = Boolean(auth?.token);
    elements.loginForm.hidden = isAuthenticated;
    elements.authSession.hidden = !isAuthenticated;
    elements.openAddModal.disabled = !isAuthenticated;
    elements.openAddModal.title = isAuthenticated ? "" : "Login to add books";
    elements.authUser.textContent = isAuthenticated ? auth.user.username : "";
}

export function renderBooks(books, isAuthenticated) {
    elements.tableBody.replaceChildren();
    elements.tableState.hidden = books.length > 0;
    elements.tableState.textContent = books.length ? "" : "No books match the current filters.";

    books.forEach((book) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td></td>
            <td></td>
            <td class="numeric"></td>
            <td class="numeric"></td>
            <td>
                <div class="row-actions">
                    <button class="button button-quiet" data-action="detail" type="button">Detail</button>
                    <button class="button button-quiet" data-action="edit" type="button">Edit</button>
                    <button class="button button-danger" data-action="delete" type="button">Delete</button>
                </div>
            </td>
        `;

        row.children[0].textContent = book.title;
        row.children[1].textContent = book.author;
        row.children[2].textContent = formatPrice(book.price);
        row.children[3].textContent = book.quantity;
        row.querySelectorAll("button").forEach((button) => {
            button.dataset.bookId = book.id;
            if (button.dataset.action !== "detail") {
                button.disabled = !isAuthenticated;
                button.title = isAuthenticated ? "" : "Login to edit books";
            }
        });
        elements.tableBody.append(row);
    });
}
