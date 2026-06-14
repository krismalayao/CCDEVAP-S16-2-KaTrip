const passwordInput = document.getElementById('password');
const toggleButton = document.getElementById('login-toggle-button');
const toggleIcon = document.getElementById('login-toggle-icon');

toggleButton.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bx bxs-lock-open-alt';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bx bxs-lock-alt';
    }
});