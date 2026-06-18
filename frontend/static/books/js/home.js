import {
    authStore,
    createBook,
    deleteBook as deleteBookRequest,
    getBook,
    getBooks,
    login,
    logout,
    updateBook,
} from "./api.js";
import {
    elements,
    formatPrice,
    renderBooks,
    setAuthState,
    setError,
    setLoading,
    showToast,
} from "./render.js";

const state = {
    page: 1,
    pageSize: 20,
    title: "",
    author: "",
    totalPages: 1,
};

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

async function loadBooks() {
    setLoading(true, state);
    setError();
    elements.tableState.hidden = false;
    elements.tableState.textContent = "Loading books...";

    try {
        const data = await getBooks(buildQuery());
        state.totalPages = Math.max(data.total_pages, 1);

        renderBooks(data.books, Boolean(authStore.get()?.token));
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
        setLoading(false, state);
    }
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
        if (bookId) {
            await updateBook(bookId, payload);
        } else {
            await createBook(payload);
        }

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
        await deleteBookRequest(bookId);
        state.page = 1;
        await loadBooks();
        showToast("Book deleted.");
    } catch (error) {
        setError(error.message);
    }
}

async function submitLogin(event) {
    event.preventDefault();
    elements.loginButton.disabled = true;
    setError();

    try {
        const auth = await login(
            elements.loginUsername.value.trim(),
            elements.loginPassword.value,
        );
        elements.loginForm.reset();
        setAuthState(auth);
        await loadBooks();
        showToast("Logged in.");
    } catch (error) {
        setError(error.message);
    } finally {
        elements.loginButton.disabled = false;
    }
}

async function submitLogout() {
    try {
        await logout();
        setAuthState(null);
        await loadBooks();
        showToast("Logged out.");
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
    if (!button || button.disabled) {
        return;
    }

    const actions = {
        detail: openDetailModal,
        edit: openEditModal,
        delete: deleteBook,
    };
    actions[button.dataset.action](button.dataset.bookId);
});

elements.openAddModal.addEventListener("click", openAddModal);
document.querySelectorAll(".close-modal").forEach((button) => {
    button.addEventListener("click", () => elements.formModal.close());
});
document.querySelectorAll(".close-detail").forEach((button) => {
    button.addEventListener("click", () => elements.detailModal.close());
});
elements.bookForm.addEventListener("submit", saveBook);
elements.loginForm.addEventListener("submit", submitLogin);
elements.logoutButton.addEventListener("click", submitLogout);

setAuthState(authStore.get());
loadBooks();
