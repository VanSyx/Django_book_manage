const state = {
    page: 1,
    pageSize: 20,
    title: "",
    author: "",
    totalPages: 1,
};

const elements = {
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
};

function getCsrfToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

function formatPrice(value) {
    return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("visible");
    window.setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

function setLoading(isLoading) {
    elements.resultStatus.textContent = isLoading ? "Loading" : "Ready";
    elements.previousPage.disabled = isLoading || state.page <= 1;
    elements.nextPage.disabled = isLoading || state.page >= state.totalPages;
}

function setError(message = "") {
    elements.errorMessage.textContent = message;
    elements.errorMessage.hidden = !message;
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

function buildQuery() {
    const params = new URLSearchParams({
        page: state.page,
        page_size: state.pageSize,
    });

    if (state.title) {
        params.set("title", state.title);
    }
    if (state.author) {
        params.set("author", state.author);
    }

    return params.toString();
}

function renderBooks(books) {
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
        });
        elements.tableBody.append(row);
    });
}

async function loadBooks() {
    setLoading(true);
    setError();
    elements.tableState.hidden = false;
    elements.tableState.textContent = "Loading books...";

    try {
        const response = await fetch(`/api/books/?${buildQuery()}`);
        const data = await parseResponse(response);
        state.totalPages = Math.max(data.total_pages, 1);

        renderBooks(data.books);
        elements.totalBooks.textContent = data.count;
        elements.summaryPage.textContent = data.current_page;
        elements.rowsShown.textContent = data.books.length;
        elements.currentPage.textContent = data.current_page;
        elements.totalPages.textContent = state.totalPages;
    } catch (error) {
        elements.tableBody.replaceChildren();
        elements.tableState.hidden = false;
        elements.tableState.textContent = "Books could not be loaded.";
        setError(error.message);
    } finally {
        setLoading(false);
    }
}

async function getBook(bookId) {
    const response = await fetch(`/api/books/${bookId}/`);
    const data = await parseResponse(response);
    return data.book;
}

function openAddModal() {
    elements.bookForm.reset();
    elements.bookId.value = "";
    elements.formEyebrow.textContent = "New record";
    elements.formTitle.textContent = "Add Book";
    elements.saveBook.textContent = "Add Book";
    elements.formError.hidden = true;
    elements.formModal.showModal();
    elements.bookTitle.focus();
}

async function openEditModal(bookId) {
    try {
        const book = await getBook(bookId);
        elements.bookId.value = book.id;
        elements.bookTitle.value = book.title;
        elements.bookAuthor.value = book.author;
        elements.bookPrice.value = book.price;
        elements.bookQuantity.value = book.quantity;
        elements.formEyebrow.textContent = "Update record";
        elements.formTitle.textContent = "Edit Book";
        elements.saveBook.textContent = "Save";
        elements.formError.hidden = true;
        elements.formModal.showModal();
    } catch (error) {
        setError(error.message);
    }
}

async function openDetailModal(bookId) {
    try {
        const book = await getBook(bookId);
        elements.detailTitle.textContent = book.title;
        elements.detailAuthor.textContent = book.author;
        elements.detailPrice.textContent = formatPrice(book.price);
        elements.detailQuantity.textContent = book.quantity;
        elements.detailDate.textContent = book.published_date;
        elements.detailModal.showModal();
    } catch (error) {
        setError(error.message);
    }
}

async function saveBook(event) {
    event.preventDefault();
    elements.formError.hidden = true;
    elements.saveBook.disabled = true;

    const bookId = elements.bookId.value;
    const payload = {
        title: elements.bookTitle.value.trim(),
        author: elements.bookAuthor.value.trim(),
        price: elements.bookPrice.value,
        quantity: Number(elements.bookQuantity.value),
    };

    try {
        const response = await fetch(bookId ? `/api/books/${bookId}/` : "/api/books/", {
            method: bookId ? "PATCH" : "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            body: JSON.stringify(payload),
        });
        await parseResponse(response);

        elements.formModal.close();
        state.page = 1;
        await loadBooks();
        showToast(bookId ? "Book updated." : "Book added.");
    } catch (error) {
        elements.formError.textContent = error.message;
        elements.formError.hidden = false;
    } finally {
        elements.saveBook.disabled = false;
    }
}

async function deleteBook(bookId) {
    let book;
    try {
        book = await getBook(bookId);
    } catch (error) {
        setError(error.message);
        return;
    }

    if (!window.confirm(`Delete "${book.title}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/books/${bookId}/`, {
            method: "DELETE",
            headers: {"X-CSRFToken": getCsrfToken()},
        });
        await parseResponse(response);
        state.page = 1;
        await loadBooks();
        showToast("Book deleted.");
    } catch (error) {
        setError(error.message);
    }
}

elements.filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.title = elements.filterTitle.value.trim();
    state.author = elements.filterAuthor.value.trim();
    state.page = 1;
    loadBooks();
});

elements.clearFilters.addEventListener("click", () => {
    elements.filterForm.reset();
    elements.pageSize.value = String(state.pageSize);
    state.title = "";
    state.author = "";
    state.page = 1;
    loadBooks();
});

elements.pageSize.addEventListener("change", () => {
    state.pageSize = Number(elements.pageSize.value);
    state.page = 1;
    loadBooks();
});

elements.previousPage.addEventListener("click", () => {
    if (state.page > 1) {
        state.page -= 1;
        loadBooks();
    }
});

elements.nextPage.addEventListener("click", () => {
    if (state.page < state.totalPages) {
        state.page += 1;
        loadBooks();
    }
});

elements.tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }

    const actions = {
        detail: openDetailModal,
        edit: openEditModal,
        delete: deleteBook,
    };
    actions[button.dataset.action](button.dataset.bookId);
});

document.querySelector("#open-add-modal").addEventListener("click", openAddModal);
document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", () => elements.formModal.close());
});
document.querySelectorAll(".close-detail").forEach((button) => {
    button.addEventListener("click", () => elements.detailModal.close());
});
elements.bookForm.addEventListener("submit", saveBook);

loadBooks();
