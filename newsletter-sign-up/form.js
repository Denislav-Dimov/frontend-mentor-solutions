const form = document.getElementById('form');
const email = document.getElementById('email');
const successMessage = document.getElementById('success-message-container');
const successMessageBtn = document.getElementById('success-message-btn');
const successMessageUserEmail = document.getElementById('success-message-email');

form.addEventListener('submit', e => {
    e.preventDefault();

    if (email.value.trim() === '') {
        setError(email, 'Email required');
    }
    else if (!isValidEmail(email)) {
        setError(email, 'Valid email required');
    }
    else {
        setSuccess(email);
        showSuccessMessage();
    }
});

const setError = (element, message) => {
    element.classList.add('error-state');
    const emailErrorMsg = element.parentElement.firstElementChild.lastElementChild;
    emailErrorMsg.innerText = message;
};

const setSuccess = element => {
    element.classList.remove('error-state');
    const emailErrorMsg = element.parentElement.firstElementChild.lastElementChild;
    emailErrorMsg.innerText = '';
};

const isValidEmail = email => {
    const emailValue = email.value.trim();

    const check = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return check.test(emailValue);
};

const showSuccessMessage = () => {
    successMessage.classList.remove('hidden');

    successMessageUserEmail.innerText = email.value.trim();

    email.value = '';
};

successMessageBtn.addEventListener('click', () => {
    successMessage.classList.add('hidden');
});
