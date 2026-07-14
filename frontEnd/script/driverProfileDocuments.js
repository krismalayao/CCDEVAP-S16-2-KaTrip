const DRIVER_DOC_TYPES = [
    {
        key: "license",
        label: "Driver's License",
        hint: "License number must be clear and readable."
    },
    {
        key: "vehicle",
        label: "Vehicle Picture",
        hint: "Front of the vehicle and license plate must be visible."
    },
    {
        key: "registration",
        label: "Vehicle Registration",
        hint: "Submitted for verification purposes."
    },
    {
        key: "insurance",
        label: "Vehicle Insurance",
        hint: "Submitted for verification purposes."
    }
];

const driverDocuments = {
    license: null,
    vehicle: null,
    registration: null,
    insurance: null
};

const pendingUploads = {};

function getDocLabel(key) {
    return DRIVER_DOC_TYPES.find((doc) => doc.key === key)?.label || "Document";
}

function openDriverDocsModal() {
    const modal = document.getElementById("driver-docs-modal");
    if (!modal) return;

    Object.keys(pendingUploads).forEach((key) => delete pendingUploads[key]);
    renderAllDocumentPreviews();
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeDriverDocsModal() {
    closeDocumentLightbox();

    const modal = document.getElementById("driver-docs-modal");
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function openDocumentLightbox(key) {
    const src = getDocumentSrc(key);
    if (!src) return;

    const lightbox = document.getElementById("driver-doc-lightbox");
    const image = document.getElementById("driver-doc-lightbox-image");
    const title = document.getElementById("driver-doc-lightbox-title");

    if (!lightbox || !image || !title) return;

    image.src = src;
    image.alt = getDocLabel(key);
    title.textContent = getDocLabel(key);

    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
}

function closeDocumentLightbox() {
    const lightbox = document.getElementById("driver-doc-lightbox");
    const image = document.getElementById("driver-doc-lightbox-image");

    if (!lightbox) return;

    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");

    if (image) {
        image.removeAttribute("src");
    }
}

function getDocumentSrc(key) {
    if (pendingUploads[key]) return pendingUploads[key];
    return driverDocuments[key];
}

function renderDocumentPreview(key) {
    const preview = document.getElementById(`preview-${key}`);
    const image = document.getElementById(`img-${key}`);
    const emptyState = preview?.querySelector(".driver-doc-empty");
    const viewBtn = document.getElementById(`view-${key}`);
    const updatedBadge = document.getElementById(`badge-${key}`);
    const src = getDocumentSrc(key);

    if (!preview || !image || !emptyState || !viewBtn) return;

    if (src) {
        image.src = src;
        image.hidden = false;
        emptyState.hidden = true;
        viewBtn.hidden = false;
        preview.classList.add("has-document");
    } else {
        image.removeAttribute("src");
        image.hidden = true;
        emptyState.hidden = false;
        viewBtn.hidden = true;
        preview.classList.remove("has-document");
    }

    if (updatedBadge) {
        updatedBadge.hidden = !pendingUploads[key];
    }
}

function renderAllDocumentPreviews() {
    DRIVER_DOC_TYPES.forEach(({ key }) => renderDocumentPreview(key));
}

function handleDocumentReupload(key, file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        pendingUploads[key] = event.target.result;
        renderDocumentPreview(key);
    };
    reader.readAsDataURL(file);
}

function saveDriverDocuments() {
    Object.entries(pendingUploads).forEach(([key, src]) => {
        driverDocuments[key] = src;
    });

    Object.keys(pendingUploads).forEach((key) => delete pendingUploads[key]);
    renderAllDocumentPreviews();
    closeDriverDocsModal();
}

function initDriverDocumentsModal() {
    const openBtn = document.getElementById("open-driver-docs-btn");
    const modal = document.getElementById("driver-docs-modal");
    const closeBtn = document.getElementById("driver-docs-close");
    const cancelBtn = document.getElementById("driver-docs-cancel");
    const saveBtn = document.getElementById("driver-docs-save");
    const lightbox = document.getElementById("driver-doc-lightbox");
    const lightboxClose = document.getElementById("driver-doc-lightbox-close");
    const lightboxBackdrop = document.getElementById("driver-doc-lightbox-backdrop");

    if (!modal) return;

    openBtn?.addEventListener("click", openDriverDocsModal);
    closeBtn?.addEventListener("click", closeDriverDocsModal);
    cancelBtn?.addEventListener("click", closeDriverDocsModal);

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeDriverDocsModal();
    });

    saveBtn?.addEventListener("click", saveDriverDocuments);

    lightboxClose?.addEventListener("click", closeDocumentLightbox);
    lightboxBackdrop?.addEventListener("click", closeDocumentLightbox);

    DRIVER_DOC_TYPES.forEach(({ key }) => {
        const input = document.getElementById(`reupload-${key}`);
        const trigger = document.getElementById(`reupload-btn-${key}`);
        const viewBtn = document.getElementById(`view-${key}`);
        const preview = document.getElementById(`preview-${key}`);

        trigger?.addEventListener("click", () => input?.click());

        input?.addEventListener("change", (event) => {
            const file = event.target.files?.[0];
            handleDocumentReupload(key, file);
        });

        viewBtn?.addEventListener("click", () => openDocumentLightbox(key));

        preview?.addEventListener("click", () => {
            if (getDocumentSrc(key)) openDocumentLightbox(key);
        });

        preview?.addEventListener("keydown", (event) => {
            if ((event.key === "Enter" || event.key === " ") && getDocumentSrc(key)) {
                event.preventDefault();
                openDocumentLightbox(key);
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;

        if (lightbox?.classList.contains("show")) {
            closeDocumentLightbox();
            return;
        }

        if (modal.classList.contains("show")) {
            closeDriverDocsModal();
        }
    });
}

document.addEventListener("DOMContentLoaded", initDriverDocumentsModal);