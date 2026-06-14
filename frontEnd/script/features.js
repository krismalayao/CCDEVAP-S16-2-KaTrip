const passwordInput = document.getElementById('password');
const toggleButton = document.getElementById('toggle-button');
const toggleIcon = document.getElementById('toggle-icon');

toggleButton.addEventListener('click', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'bx bxs-lock-open-alt';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'bx bxs-lock-alt';
    }
});