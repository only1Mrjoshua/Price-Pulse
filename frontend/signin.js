// DOM Elements
const signinForm = document.getElementById('signinForm');
const googleSignInBtn = document.getElementById('googleSignIn');
const togglePasswordBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('emailOrUsername');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const signinButton = document.querySelector('.btn-signin');

// Form Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(element, message) {
    element.textContent = message;
    element.style.opacity = '1';
    element.parentElement.querySelector('.input-with-icon input').classList.add('error');
    element.parentElement.querySelector('.input-with-icon input').classList.remove('success');
}

function clearError(element) {
    element.textContent = '';
    element.style.opacity = '0';
    element.parentElement.querySelector('.input-with-icon input').classList.remove('error');
}

function showSuccess(inputElement) {
    inputElement.classList.add('success');
    inputElement.classList.remove('error');
}

// Toggle Password Visibility
togglePasswordBtn.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle eye icon
    const eyeIcon = this.querySelector('i');
    if (type === 'text') {
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});

// Real-time Validation
emailInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    if (value === '') {
        clearError(emailError);
        this.classList.remove('error', 'success');
        return;
    }
    
    // Check if input is email or username
    if (value.includes('@')) {
        if (validateEmail(value)) {
            clearError(emailError);
            showSuccess(this);
        } else {
            showError(emailError, 'Please enter a valid email address');
        }
    } else {
        if (validateUsername(value)) {
            clearError(emailError);
            showSuccess(this);
        } else {
            showError(emailError, 'Username must be 3-20 characters (letters, numbers, underscores)');
        }
    }
});

passwordInput.addEventListener('input', function() {
    const value = this.value;
    
    if (value === '') {
        clearError(passwordError);
        this.classList.remove('error', 'success');
        return;
    }
    
    if (validatePassword(value)) {
        clearError(passwordError);
        showSuccess(this);
    } else {
        showError(passwordError, 'Password must be at least 8 characters long');
    }
});

// Form Submission
signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const emailOrUsername = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Reset errors
    clearError(emailError);
    clearError(passwordError);
    
    // Validate email/username
    let isValid = true;
    
    if (emailOrUsername === '') {
        showError(emailError, 'Email or username is required');
        emailInput.classList.add('error');
        isValid = false;
    } else if (emailOrUsername.includes('@')) {
        if (!validateEmail(emailOrUsername)) {
            showError(emailError, 'Please enter a valid email address');
            emailInput.classList.add('error');
            isValid = false;
        }
    } else {
        if (!validateUsername(emailOrUsername)) {
            showError(emailError, 'Username must be 3-20 characters (letters, numbers, underscores)');
            emailInput.classList.add('error');
            isValid = false;
        }
    }
    
    // Validate password
    if (password === '') {
        showError(passwordError, 'Password is required');
        passwordInput.classList.add('error');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError(passwordError, 'Password must be at least 8 characters long');
        passwordInput.classList.add('error');
        isValid = false;
    }
    
    if (!isValid) {
        // Add shake animation to form
        signinForm.classList.add('shake');
        setTimeout(() => {
            signinForm.classList.remove('shake');
        }, 500);
        return;
    }
    
    // Simulate form submission
    simulateSignIn(emailOrUsername, password, rememberMe);
});

// Simulate Sign In (Replace with actual API call)
function simulateSignIn(emailOrUsername, password, rememberMe) {
    // Show loading state
    const originalText = signinButton.querySelector('span').textContent;
    signinButton.querySelector('span').textContent = 'Signing in...';
    signinButton.classList.add('loading');
    signinButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button state
        signinButton.querySelector('span').textContent = originalText;
        signinButton.classList.remove('loading');
        signinButton.disabled = false;
        
        // For demo purposes, always show success
        // In real implementation, you would check the response from your server
        showSuccessMessage();
        
        // In a real app, you would redirect or update UI based on server response
        // window.location.href = '/dashboard';
        
    }, 1500);
}

// Show success message
function showSuccessMessage() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div style="
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
            padding: 15px 20px;
            border-radius: 12px;
            border: 1px solid rgba(16, 185, 129, 0.3);
            margin-top: 20px;
            text-align: center;
            animation: fadeInUp 0.5s ease-out;
        ">
            <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
            Successfully signed in! Redirecting to dashboard...
        </div>
    `;
    
    // Insert after form
    signinForm.parentNode.insertBefore(successMessage, signinForm.nextSibling);
    
    // Remove any existing success message
    setTimeout(() => {
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }, 3000);
}

// Google Sign-In Placeholder
googleSignInBtn.addEventListener('click', function() {
    // Show loading state
    const originalText = this.querySelector('span').textContent;
    this.querySelector('span').textContent = 'Connecting to Google...';
    this.disabled = true;
    
    // Simulate Google sign-in process
    setTimeout(() => {
        this.querySelector('span').textContent = originalText;
        this.disabled = false;
        
        // In a real implementation, you would integrate with Google OAuth
        // This is just a placeholder
        alert('Google sign-in would be implemented here. In a real app, this would redirect to Google OAuth.');
        
        // Example of what you might do:
        // window.location.href = 'https://accounts.google.com/o/oauth2/auth?...';
        
    }, 1000);
});

// Add input focus effects
const inputs = document.querySelectorAll('.input-with-icon input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Form accessibility improvements
signinForm.addEventListener('keydown', function(e) {
    // Submit form with Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        this.dispatchEvent(new Event('submit'));
    }
});

// Remember me functionality
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Update localStorage when remember me is checked
document.getElementById('rememberMe').addEventListener('change', function() {
    if (!this.checked) {
        localStorage.removeItem('rememberedEmail');
    }
});

// Simulate saving email when form is successfully submitted
function saveRememberedEmail(email) {
    if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('rememberedEmail', email);
    }
}

// Modify the simulateSignIn function to save email
function simulateSignIn(emailOrUsername, password, rememberMe) {
    // Show loading state
    const originalText = signinButton.querySelector('span').textContent;
    signinButton.querySelector('span').textContent = 'Signing in...';
    signinButton.classList.add('loading');
    signinButton.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button state
        signinButton.querySelector('span').textContent = originalText;
        signinButton.classList.remove('loading');
        signinButton.disabled = false;
        
        // Save email if "Remember me" is checked
        if (rememberMe && emailOrUsername.includes('@')) {
            saveRememberedEmail(emailOrUsername);
        }
        
        // Show success message
        showSuccessMessage();
        
    }, 1500);
}

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add focus to email/username field if empty
    if (!emailInput.value) {
        emailInput.focus();
    }
    
    // Log for debugging
    console.log('Sign-in page initialized successfully');
});