document.addEventListener("DOMContentLoaded", () => {
    const avatarUpload = document.getElementById("avatar-upload");
    const avatarPreview = document.getElementById("avatar-preview");

    if (avatarUpload && avatarPreview) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Update presentation styling cleanly
                    avatarPreview.style.backgroundImage = `url('${e.target.result}')`;
                    avatarPreview.style.backgroundSize = "cover";
                    avatarPreview.style.backgroundPosition = "center";
                };
                reader.readAsDataURL(file);
            }
        });
    }
});