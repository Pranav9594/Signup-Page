document.addEventListener('DOMContentLoaded', () => {
    // DOM elements - Form elements
    const form = document.getElementById('signup-form');
    const formSteps = document.querySelectorAll('.form-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const fullnameInput = document.getElementById('fullname');
    const phoneInput = document.getElementById('phone');
    const termsCheckbox = document.getElementById('terms');
    const ageCheckbox = document.getElementById('age-confirm');
    const newsletterCheckbox = document.getElementById('newsletter');
    const captchaInput = document.getElementById('captcha-input');
    const submitBtn = document.getElementById('submit-btn');
    
    // DOM elements - UI elements
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const themeToggle = document.querySelector('.theme-toggle');
    const progressFill = document.getElementById('progress-fill');
    const stepIndicators = document.querySelectorAll('.step');
    const formTitle = document.getElementById('form-title');
    const captchaBox = document.getElementById('captcha-box');
    const captchaText = document.getElementById('captcha-text');
    const refreshCaptchaBtn = document.getElementById('refresh-captcha');
    const modal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const tooltipContainer = document.getElementById('tooltip-container');
    const tooltipElement = document.getElementById('tooltip');
    const tooltipContent = document.getElementById('tooltip-content');
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const currentLanguage = document.getElementById('current-language');
    
    // Password strength and criteria elements
    const strengthMeter = document.getElementById('strength-meter-fill');
    const strengthText = document.getElementById('password-strength-text');
    const lengthCriteria = document.getElementById('length-criteria');
    const uppercaseCriteria = document.getElementById('uppercase-criteria');
    const lowercaseCriteria = document.getElementById('lowercase-criteria');
    const numberCriteria = document.getElementById('number-criteria');
    const specialCriteria = document.getElementById('special-criteria');
    
    // Navigation buttons
    const nextBtn1 = document.getElementById('next-1');
    const nextBtn2 = document.getElementById('next-2');
    const prevBtn2 = document.getElementById('prev-2');
    const prevBtn3 = document.getElementById('prev-3');
    
    // Error message elements
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const fullnameError = document.getElementById('fullname-error');
    const phoneError = document.getElementById('phone-error');
    const termsError = document.getElementById('terms-error');
    const ageError = document.getElementById('age-error');
    const captchaError = document.getElementById('captcha-error');
    
    // Translation data
    let translations = {};
    let currentLang = 'en';
    
    try {
        translations = JSON.parse(document.getElementById('translations').textContent);
    } catch (e) {
        console.error('Error loading translations:', e);
    }
    
    // Form validation state
    const validationState = {
        step1: {
            email: false,
            password: false,
            confirmPassword: false
        },
        step2: {
            fullname: false,
            phone: true // Optional, so default true
        },
        step3: {
            terms: false,
            age: false,
            captcha: false
        }
    };
    
    // Current form step
    let currentStep = 1;
    
    // Current captcha
    let currentCaptcha = '';
    
    // Initialize form
    init();
    
    // Core initialization function
    function init() {
        // Check if dark mode is stored in localStorage
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            themeToggle.setAttribute('aria-checked', 'true');
        }
        
        // Check if language preference is stored
        const savedLang = localStorage.getItem('language');
        if (savedLang && translations[savedLang]) {
            currentLang = savedLang;
            updateLanguageDisplay();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Generate first captcha
        generateCaptcha();
        
        // Apply translations
        updateLanguage(currentLang);
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Toggle password visibility
        togglePasswordBtns.forEach(btn => {
            btn.addEventListener('click', togglePasswordVisibility);
        });
        
        // Toggle dark/light mode
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleTheme();
            }
        });
        
        // Language selector
        languageBtn.addEventListener('click', toggleLanguageDropdown);
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                updateLanguage(lang);
                toggleLanguageDropdown();
            });
        });
        
        // Click outside to close language dropdown
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector') && languageDropdown.classList.contains('show')) {
                toggleLanguageDropdown();
            }
        });
        
        // Event listeners for next/previous buttons
        nextBtn1.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (goToStep(2)) {
                animateStep(1, 2);
            }
        });
        
        nextBtn2.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (goToStep(3)) {
                animateStep(2, 3);
            }
        });
        
        prevBtn2.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep(1);
            animateStep(2, 1);
        });
        
        prevBtn3.addEventListener('click', function(e) {
            e.preventDefault();
            goToStep(2);
            animateStep(3, 2);
        });
        
        // Step indicator click event
        stepIndicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const step = parseInt(this.dataset.step);
                
                // Only allow clicking on completed steps or next step
                if (step <= currentStep || step === currentStep + 1) {
                    goToStep(step);
                }
            });
        });
        
        // Input validation events
        emailInput.addEventListener('input', validateEmail);
        passwordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        fullnameInput.addEventListener('input', validateFullname);
        phoneInput.addEventListener('input', validatePhone);
        termsCheckbox.addEventListener('change', validateTerms);
        ageCheckbox.addEventListener('change', validateAge);
        captchaInput.addEventListener('input', validateCaptcha);
        
        // Add blur event listeners for better UX
        emailInput.addEventListener('blur', validateEmail);
        passwordInput.addEventListener('blur', validatePassword);
        confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
        fullnameInput.addEventListener('blur', validateFullname);
        phoneInput.addEventListener('blur', validatePhone);
        
        // Refresh captcha button
        refreshCaptchaBtn.addEventListener('click', generateCaptcha);
        
        // Ripple effect for buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', createRippleEffect);
        });
        
        // Tooltips for terms links
        document.querySelectorAll('.terms-link').forEach(link => {
            link.addEventListener('mouseenter', showTermsTooltip);
            link.addEventListener('mouseleave', hideTooltip);
            link.addEventListener('focus', showTermsTooltip);
            link.addEventListener('blur', hideTooltip);
        });
        
        // Modal events
        modalCloseBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
        
        // Form submission
        form.addEventListener('submit', handleSubmit);
    }
    
    // Toggle password visibility
    function togglePasswordVisibility() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type');
        
        if (type === 'password') {
            input.setAttribute('type', 'text');
            this.classList.remove('fa-eye-slash');
            this.classList.add('fa-eye');
        } else {
            input.setAttribute('type', 'password');
            this.classList.remove('fa-eye');
            this.classList.add('fa-eye-slash');
        }
    }
    
    // Toggle dark/light mode
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        // Save preference to localStorage
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
    
    // Toggle language dropdown
    function toggleLanguageDropdown() {
        languageDropdown.classList.toggle('show');
    }
    
    // Update language display
    function updateLanguageDisplay() {
        currentLanguage.textContent = translations[currentLang].language;
    }
    
    // Update language
    function updateLanguage(lang) {
        currentLang = lang;
        updateLanguageDisplay();
        // Apply translations to the form
        // This is a placeholder and should be replaced with actual translation logic
    }
    
    // Function to go to a specific step
    function goToStep(step) {
        // Validate step
        if (step < 1 || step > formSteps.length || step === currentStep) {
            return false;
        }
        
        // Validate current step before proceeding (only if moving forward)
        if (step > currentStep && !validateStep(currentStep)) {
            return false;
        }
        
        // Animate the transition between steps
        animateStep(currentStep, step);
        
        // Update progress bar
        const progress = ((step - 1) / (formSteps.length - 1)) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Update step indicators
        stepIndicators.forEach((indicator, idx) => {
            // Clear all classes first
            indicator.classList.remove('completed', 'active');
            
            // Set appropriate class based on current progress
            if (idx + 1 < step) {
                indicator.classList.add('completed');
            } else if (idx + 1 === step) {
                indicator.classList.add('active');
            }
        });
        
        // Update form title
        updateFormTitle(step);
        
        // Update currentStep
        currentStep = step;
        
        // Show/hide Next and Submit buttons based on current step
        updateStepButtonState();
        
        return true;
    }
    
    // Validate a specific step
    function validateStep(step) {
        switch(step) {
            case 1:
                validateEmail();
                validatePassword();
                validateConfirmPassword();
                return Object.values(validationState.step1).every(value => value === true);
            case 2:
                validateFullname();
                validatePhone();
                return Object.values(validationState.step2).every(value => value === true);
            case 3:
                validateTerms();
                validateAge();
                validateCaptcha();
                return Object.values(validationState.step3).every(value => value === true);
            default:
                return false;
        }
    }
    
    // Update form title based on current step
    function updateFormTitle(step) {
        switch(step) {
            case 1:
                formTitle.textContent = translations[currentLang]?.createAccount || 'Create Account';
                break;
            case 2:
                formTitle.textContent = translations[currentLang]?.profileInfo || 'Profile Information';
                break;
            case 3:
                formTitle.textContent = translations[currentLang]?.verification || 'Verification';
                break;
            default:
                formTitle.textContent = translations[currentLang]?.createAccount || 'Create Account';
        }
    }
    
    // Update button state based on validation
    function updateStepButtonState() {
        switch(currentStep) {
            case 1:
                nextBtn1.disabled = !Object.values(validationState.step1).every(value => value === true);
                break;
            case 2:
                nextBtn2.disabled = !Object.values(validationState.step2).every(value => value === true);
                break;
            case 3:
                submitBtn.disabled = !Object.values(validationState.step3).every(value => value === true);
                break;
        }
    }
    
    // Validation Functions
    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (value === '') {
            emailError.textContent = 'Email is required';
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
            validationState.step1.email = false;
        } else if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
            validationState.step1.email = false;
        } else {
            // Check for common domains
            const domain = value.split('@')[1];
            if (domain && (domain.includes('example.com') || domain.includes('test.com'))) {
                emailError.textContent = 'Please use a real email address';
                emailInput.classList.add('invalid');
                emailInput.classList.remove('valid');
                validationState.step1.email = false;
            } else {
                emailError.textContent = '';
                emailInput.classList.remove('invalid');
                emailInput.classList.add('valid');
                validationState.step1.email = true;
            }
        }
        
        updateStepButtonState();
    }
    
    function validatePassword() {
        const value = passwordInput.value.trim();
        
        // Check individual criteria
        const hasLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecial = /[^a-zA-Z0-9]/.test(value);
        
        // Update criteria indicators
        updateCriteriaItem(lengthCriteria, hasLength);
        updateCriteriaItem(uppercaseCriteria, hasUpper);
        updateCriteriaItem(lowercaseCriteria, hasLower);
        updateCriteriaItem(numberCriteria, hasNumber);
        updateCriteriaItem(specialCriteria, hasSpecial);
        
        const strength = checkPasswordStrength(value);
        
        if (value === '') {
            passwordError.textContent = 'Password is required';
            passwordInput.classList.add('invalid');
            passwordInput.classList.remove('valid');
            validationState.step1.password = false;
        } else if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
            passwordError.textContent = 'Password does not meet the requirements';
            passwordInput.classList.add('invalid');
            passwordInput.classList.remove('valid');
            validationState.step1.password = false;
        } else {
            passwordError.textContent = '';
            passwordInput.classList.remove('invalid');
            passwordInput.classList.add('valid');
            validationState.step1.password = true;
        }
        
        // Update strength meter
        updatePasswordStrengthIndicator(value);
        
        // Revalidate confirm password when password changes
        if (confirmPasswordInput.value.trim() !== '') {
            validateConfirmPassword();
        }
        
        updateStepButtonState();
    }
    
    function updateCriteriaItem(element, isValid) {
        if (isValid) {
            element.classList.add('valid');
        } else {
            element.classList.remove('valid');
        }
    }
    
    function validateConfirmPassword() {
        const passwordValue = passwordInput.value.trim();
        const confirmValue = confirmPasswordInput.value.trim();
        
        if (confirmValue === '') {
            confirmPasswordError.textContent = 'Please confirm your password';
            confirmPasswordInput.classList.add('invalid');
            confirmPasswordInput.classList.remove('valid');
            validationState.step1.confirmPassword = false;
        } else if (confirmValue !== passwordValue) {
            confirmPasswordError.textContent = 'Passwords do not match';
            confirmPasswordInput.classList.add('invalid');
            confirmPasswordInput.classList.remove('valid');
            validationState.step1.confirmPassword = false;
        } else {
            confirmPasswordError.textContent = '';
            confirmPasswordInput.classList.remove('invalid');
            confirmPasswordInput.classList.add('valid');
            validationState.step1.confirmPassword = true;
        }
        
        updateStepButtonState();
    }
    
    function validateFullname() {
        const value = fullnameInput.value.trim();
        
        if (value === '') {
            fullnameError.textContent = 'Full name is required';
            fullnameInput.classList.add('invalid');
            fullnameInput.classList.remove('valid');
            validationState.step2.fullname = false;
        } else if (value.length < 3) {
            fullnameError.textContent = 'Full name must be at least 3 characters';
            fullnameInput.classList.add('invalid');
            fullnameInput.classList.remove('valid');
            validationState.step2.fullname = false;
        } else {
            fullnameError.textContent = '';
            fullnameInput.classList.remove('invalid');
            fullnameInput.classList.add('valid');
            validationState.step2.fullname = true;
        }
        
        updateStepButtonState();
    }
    
    function validatePhone() {
        const value = phoneInput.value.trim();
        const phoneRegex = /^\d{10}$/;
        
        if (value === '') {
            // Phone is optional
            phoneError.textContent = '';
            phoneInput.classList.remove('invalid');
            phoneInput.classList.remove('valid');
            validationState.step2.phone = true;
        } else if (!phoneRegex.test(value.replace(/[^0-9]/g, ''))) {
            phoneError.textContent = 'Please enter a valid phone number';
            phoneInput.classList.add('invalid');
            phoneInput.classList.remove('valid');
            validationState.step2.phone = false;
        } else {
            phoneError.textContent = '';
            phoneInput.classList.remove('invalid');
            phoneInput.classList.add('valid');
            validationState.step2.phone = true;
        }
        
        updateStepButtonState();
    }
    
    function validateTerms() {
        if (!termsCheckbox.checked) {
            termsError.textContent = 'You must agree to the Terms of Service and Privacy Policy';
            validationState.step3.terms = false;
        } else {
            termsError.textContent = '';
            validationState.step3.terms = true;
        }
        
        updateStepButtonState();
    }
    
    function validateAge() {
        if (!ageCheckbox.checked) {
            ageError.textContent = 'You must confirm that you are at least 18 years old';
            validationState.step3.age = false;
        } else {
            ageError.textContent = '';
            validationState.step3.age = true;
        }
        
        updateStepButtonState();
    }
    
    function validateCaptcha() {
        const value = captchaInput.value.trim();
        
        if (value === '') {
            captchaError.textContent = 'Please enter the captcha code';
            captchaInput.classList.add('invalid');
            captchaInput.classList.remove('valid');
            validationState.step3.captcha = false;
        } else if (value !== currentCaptcha) {
            captchaError.textContent = 'Incorrect captcha code';
            captchaInput.classList.add('invalid');
            captchaInput.classList.remove('valid');
            validationState.step3.captcha = false;
        } else {
            captchaError.textContent = '';
            captchaInput.classList.remove('invalid');
            captchaInput.classList.add('valid');
            validationState.step3.captcha = true;
        }
        
        updateStepButtonState();
    }
    
    // Generate a random captcha
    function generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let captcha = '';
        
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        currentCaptcha = captcha;
        captchaText.textContent = captcha;
        
        // Clear input and validation
        captchaInput.value = '';
        captchaInput.classList.remove('valid', 'invalid');
        captchaError.textContent = '';
        validationState.step3.captcha = false;
        
        updateStepButtonState();
    }
    
    // Password strength checker
    function checkPasswordStrength(password) {
        // Calculate score based on various criteria
        let score = 0;
        
        // Length criteria
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Complexity criteria
        if (/[a-z]/.test(password)) score += 1; // lowercase
        if (/[A-Z]/.test(password)) score += 1; // uppercase
        if (/[0-9]/.test(password)) score += 1; // numbers
        if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special chars
        
        // Variety criteria
        const uniqueChars = new Set(password.split('')).size;
        if (uniqueChars > 5) score += 1;
        if (uniqueChars > 10) score += 1;
        
        return {
            score: Math.min(score, 8),
            percent: Math.min((score / 8) * 100, 100)
        };
    }
    
    function updatePasswordStrengthIndicator(password) {
        if (!password) {
            strengthMeter.style.width = '0';
            strengthText.textContent = translations[currentLang]?.passwordStrength || 'Password strength';
            strengthText.style.color = 'var(--text-muted)';
            return;
        }
        
        const { score, percent } = checkPasswordStrength(password);
        
        // Update the strength meter
        strengthMeter.style.width = `${percent}%`;
        
        // Update color and text based on score
        if (score <= 2) {
            strengthMeter.style.backgroundColor = 'var(--error-color)';
            strengthText.textContent = translations[currentLang]?.weakPassword || 'Weak';
            strengthText.style.color = 'var(--error-color)';
        } else if (score <= 5) {
            strengthMeter.style.backgroundColor = 'var(--warning-color)';
            strengthText.textContent = translations[currentLang]?.moderatePassword || 'Moderate';
            strengthText.style.color = 'var(--warning-color)';
        } else {
            strengthMeter.style.backgroundColor = 'var(--success-color)';
            strengthText.textContent = translations[currentLang]?.strongPassword || 'Strong';
            strengthText.style.color = 'var(--success-color)';
        }
    }
    
    // Form submission handler
    function handleSubmit(e) {
        e.preventDefault();
        
        // Final validation
        if (!validateStep(3)) {
            return;
        }
        
        // Show loading overlay
        showLoading();
        
        // Collect form data
        const formData = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim(),
            fullname: fullnameInput.value.trim(),
            phone: phoneInput.value ? `${document.getElementById('country-code').value} ${phoneInput.value.trim()}` : '',
            newsletter: newsletterCheckbox.checked,
            interests: getSelectedInterests()
        };
        
        console.log('Form submitted successfully:', formData);
        
        // Simulate server request with timeout
        setTimeout(() => {
            // Hide loading overlay
            hideLoading();
            
            // Show success modal
            showModal();
            
            // Reset form
            resetForm();
        }, 2000);
    }
    
    function getSelectedInterests() {
        const interests = [];
        document.querySelectorAll('.interest-checkbox:checked').forEach(checkbox => {
            interests.push(checkbox.id.replace('interest-', ''));
        });
        return interests;
    }
    
    function resetForm() {
        // Reset form inputs
        form.reset();
        
        // Reset validation states
        Object.keys(validationState.step1).forEach(key => {
            validationState.step1[key] = false;
        });
        
        Object.keys(validationState.step2).forEach(key => {
            if (key === 'phone') validationState.step2[key] = true;
            else validationState.step2[key] = false;
        });
        
        Object.keys(validationState.step3).forEach(key => {
            validationState.step3[key] = false;
        });
        
        // Reset input classes
        const inputs = form.querySelectorAll('input:not([type="checkbox"])');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        // Reset password strength meter
        strengthMeter.style.width = '0';
        strengthText.textContent = translations[currentLang]?.passwordStrength || 'Password strength';
        strengthText.style.color = 'var(--text-muted)';
        
        // Reset password criteria
        document.querySelectorAll('.criteria-item').forEach(item => {
            item.classList.remove('valid');
        });
        
        // Reset to first step
        goToStep(1);
        
        // Reset captcha
        generateCaptcha();
        
        // Disable buttons
        updateStepButtonState();
    }
    
    // Modal functions
    function showModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    function hideModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    modalCloseBtn.addEventListener('click', hideModal);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final validation check
        validateFullname();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
        validateTerms();
        
        if (Object.values(validationState).every(value => value === true)) {
            // Show loading state on button
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;
            
            // Simulate server request with timeout
            setTimeout(() => {
                // Collect form data
                const formData = {
                    fullname: fullnameInput.value.trim(),
                    email: emailInput.value.trim(),
                    password: passwordInput.value.trim()
                };
                
                // Log form data (in real app, this would be sent to server)
                console.log('Form submitted successfully:', formData);
                
                // Reset form
                form.reset();
                
                // Reset validation states
                Object.keys(validationState).forEach(key => {
                    validationState[key] = false;
                });
                
                // Reset input classes
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    input.classList.remove('valid', 'invalid');
                });
                
                // Reset password strength meter
                strengthMeter.style.width = '0';
                strengthText.textContent = 'Password strength';
                strengthText.style.color = 'var(--text-muted)';
                
                // Reset button text
                submitBtn.innerHTML = 'Sign Up';
                submitBtn.disabled = true;
                
                // Show success modal
                showModal();
            }, 1500);
        }
    });
    
    // Function to animate transition between steps
    function animateStep(fromStep, toStep) {
        const currentStepElement = document.getElementById(`step-${fromStep}`);
        const nextStepElement = document.getElementById(`step-${toStep}`);
        
        // Set the direction of animation
        const direction = fromStep < toStep ? 'forward' : 'backward';
        
        // Add animation classes based on direction
        if (direction === 'forward') {
            currentStepElement.classList.add('slide-out-left');
            nextStepElement.classList.remove('hidden');
            nextStepElement.classList.add('slide-in-right');
        } else {
            currentStepElement.classList.add('slide-out-right');
            nextStepElement.classList.remove('hidden');
            nextStepElement.classList.add('slide-in-left');
        }
        
        // Remove animation classes after animation completes
        setTimeout(() => {
            currentStepElement.classList.remove('slide-out-left', 'slide-out-right');
            nextStepElement.classList.remove('slide-in-left', 'slide-in-right');
            currentStepElement.classList.add('hidden');
        }, 300); // Match this with the animation duration in CSS
    }
}); 