contact.js
// Navigation Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Create or remove overlay
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay && navMenu.classList.contains('active')) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        });
        
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    } else if (overlay && !navMenu.classList.contains('active')) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
});

// Close mobile menu when clicking on links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const overlay = document.querySelector('.mobile-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');
const sendAnotherBtn = document.getElementById('sendAnother');

// Form validation functions
const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

const validateMessage = (message) => {
    return message.trim().length >= 10 && message.trim().length <= 1000;
};

const validateSubject = (subject) => {
    return subject !== '';
};

const showError = (fieldId, message) => {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    field.parentElement.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
};

const clearError = (fieldId) => {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    
    field.parentElement.classList.remove('error');
    errorElement.textContent = '';
    errorElement.style.display = 'none';
};

// Real-time validation
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');

if (nameInput) {
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim() === '') {
            showError('name', 'Name is required');
        } else if (!validateName(nameInput.value)) {
            showError('name', 'Name must be 2-50 characters (letters and spaces only)');
        } else {
            clearError('name');
        }
    });
}

if (emailInput) {
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim() === '') {
            showError('email', 'Email is required');
        } else if (!validateEmail(emailInput.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            clearError('email');
        }
    });
}

if (subjectInput) {
    subjectInput.addEventListener('change', () => {
        if (!validateSubject(subjectInput.value)) {
            showError('subject', 'Please select a subject');
        } else {
            clearError('subject');
        }
    });
}

if (messageInput) {
    messageInput.addEventListener('input', () => {
        if (messageInput.value.trim() === '') {
            showError('message', 'Message is required');
        } else if (!validateMessage(messageInput.value)) {
            showError('message', 'Message must be between 10 and 1000 characters');
        } else {
            clearError('message');
        }
    });
}

// Form submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const subject = subjectInput.value;
        const message = messageInput.value.trim();
        
        let isValid = true;
        
        // Validate all fields
        if (!validateName(name)) {
            showError('name', 'Name must be 2-50 characters (letters and spaces only)');
            isValid = false;
        }
        
        if (!validateEmail(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!validateSubject(subject)) {
            showError('subject', 'Please select a subject');
            isValid = false;
        }
        
        if (!validateMessage(message)) {
            showError('message', 'Message must be between 10 and 1000 characters');
            isValid = false;
        }
        
        // If valid, show success message
        if (isValid) {
            // In a real application, you would send the data to a server here
            // For now, we'll just show the success message
            
            // Hide form, show success message
            contactForm.style.display = 'none';
            successMessage.classList.add('active');
            
            // You would typically send the data to a server here
            console.log('Form submitted:', { name, email, subject, message });
            
            // Reset form
            contactForm.reset();
        }
    });
}

// Send another message button
if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
        successMessage.classList.remove('active');
        contactForm.style.display = 'flex';
        
        // Clear any errors
        clearError('name');
        clearError('email');
        clearError('subject');
        clearError('message');
    });
}

// FAQ item animation
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-5px)';
        item.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    });
    
    item.addEventListener('mouseleave', () => {
        if (!item.classList.contains('active')) {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = 'none';
        }
    });
});

// Stat item animations
const statItems = document.querySelectorAll('.stat-item');

statItems.forEach(item => {
    const icon = item.querySelector('i');
    
    item.addEventListener('mouseenter', () => {
        icon.style.transform = 'rotate(360deg)';
        icon.style.transition = 'transform 0.6s ease';
    });
    
    item.addEventListener('mouseleave', () => {
        icon.style.transform = 'rotate(0)';
    });
});

// Social link animations
const socialLinks = document.querySelectorAll('.social-link');

socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const icon = link.querySelector('i');
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    link.addEventListener('mouseleave', () => {
        const icon = link.querySelector('i');
        icon.style.transform = 'scale(1)';
    });
});

// Form field focus effects
const formFields = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

formFields.forEach(field => {
    field.addEventListener('focus', () => {
        field.parentElement.style.transform = 'translateY(-2px)';
        field.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    field.addEventListener('blur', () => {
        field.parentElement.style.transform = 'translateY(0)';
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer if needed
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Add loading animation to submit button
    const submitBtn = contactForm?.querySelector('.btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (contactForm.checkValidity()) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                this.disabled = true;
                
                // Re-enable button after 3 seconds (simulating API call)
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                    this.disabled = false;
                }, 3000);
            }
        });
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});