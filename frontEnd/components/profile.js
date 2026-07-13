document.addEventListener("DOMContentLoaded", () => {
    // Avatar Elements
    const avatarUpload = document.getElementById("avatar-upload");
    const avatarPreview = document.getElementById("avatar-preview");
        const logoutBtn = document.getElementById("logout-btn");

    if (avatarUpload && avatarPreview) {
        avatarUpload.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarPreview.style.backgroundImage = `url('${e.target.result}')`;
                    avatarPreview.style.backgroundSize = "cover";
                    avatarPreview.style.backgroundPosition = "center";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("authToken"); 
            sessionStorage.clear();               

            console.log("User logged out successfully. Redirecting...");

            fetch("../../backEnd/controller/logoutController.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = "../public/loginPage.php";
                } else {
                    console.error("Server-side logout failed.");
                }
            })
            .catch(err => console.error("Network error during logout:", err));
        });
    }
});
