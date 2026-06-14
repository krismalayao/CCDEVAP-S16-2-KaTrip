// Toggling See Password Button/Icon

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

// Script for Mobile Number Input
const phoneInput = document.getElementById('phone_number');

phoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 6) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
    }
    
    e.target.value = value;
});