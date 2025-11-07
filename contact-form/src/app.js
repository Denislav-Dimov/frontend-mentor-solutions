const form = document.getElementById('form');
const input = {
  fName: document.getElementById('firstName'),
  lName: document.getElementById('lastName'),
  email: document.getElementById('email'),
  generalEnquiry: document.getElementById('generalEnquiry'),
  supportRequest: document.getElementById('supportRequest'),
  message: document.getElementById('message'),
  consent: document.getElementById('consent'),
};
const error = {
  fName: document.getElementById('errorFName'),
  lName: document.getElementById('errorLName'),
  email: document.getElementById('errorEmail'),
  query: document.getElementById('errorQuery'),
  message: document.getElementById('errorMessage'),
  consent: document.getElementById('errorConsent'),
};
const successPopup = document.getElementById('successPopup');
let activePopup = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const validatedFName = validateFName();
  const validatedLName = validateLName();
  const validatedEmail = validateEmail();
  const validatedQuery = validateQuery();
  const validatedMessage = validateMessage();
  const validatedConsent = validateConsent();

  const allValid =
    validatedFName &&
    validatedLName &&
    validatedEmail &&
    validatedQuery &&
    validatedMessage &&
    validatedConsent;

  if (allValid && !activePopup) {
    showPopup();
    clearFields();
  }
});

function showPopup() {
  successPopup.classList.add('opacity-100', 'top-18');
  successPopup.setAttribute('aria-hidden', 'false');
  activePopup = true;

  setTimeout(() => {
    successPopup.classList.remove('opacity-100', 'top-18');
    successPopup.setAttribute('aria-hidden', 'true');
    activePopup = false;
  }, 2000);
}

function clearFields() {
  input.fName.value = '';
  input.lName.value = '';
  input.email.value = '';
  input.generalEnquiry.checked = false;
  input.supportRequest.checked = false;
  input.message.value = '';
  input.consent.checked = false;
}

function validateField(input, errorElement, rules) {
  let isValid = true;
  let errorMessage = '';

  for (const rule of rules) {
    if (!rule.check(input)) {
      isValid = false;
      errorMessage = rule.message;
      break;
    }
  }

  if (!isValid) {
    if (input.type !== 'radio' && input.type !== 'checkbox') {
      input.classList.add('outline', 'outline-primary-red');
    }

    errorElement.classList.remove('hidden');
    errorElement.innerText = errorMessage;
  } else {
    if (input.type !== 'radio' && input.type !== 'checkbox') {
      input.classList.remove('outline', 'outline-primary-red');
    }

    errorElement.classList.add('hidden');
    errorElement.innerText = '';
  }

  return isValid;
}

const requiredRule = (message = 'This field is required') => ({
  check: (input) => input.value.trim() !== '',
  message,
});

const emailRule = {
  check: (input) => validator.isEmail(input.value.trim()),
  message: 'Please enter a valid email address',
};

const radioGroupRule = (radios) => ({
  check: () => radios.some((radio) => radio.checked),
  message: 'Please select a query type',
});

const checkboxRule = () => ({
  check: (input) => input.checked,
  message: 'To submit this form, please consent to being contacted',
});

function validateFName() {
  return validateField(input.fName, error.fName, [requiredRule()]);
}

function validateLName() {
  return validateField(input.lName, error.lName, [requiredRule()]);
}

function validateEmail() {
  return validateField(input.email, error.email, [requiredRule(), emailRule]);
}

function validateQuery() {
  return validateField(input.generalEnquiry, error.query, [
    radioGroupRule([input.generalEnquiry, input.supportRequest]),
  ]);
}

function validateMessage() {
  return validateField(input.message, error.message, [requiredRule()]);
}

function validateConsent() {
  return validateField(input.consent, error.consent, [checkboxRule()]);
}

input.fName.addEventListener('blur', validateFName);
input.lName.addEventListener('blur', validateLName);
input.email.addEventListener('blur', validateEmail);
input.message.addEventListener('blur', validateMessage);
input.consent.addEventListener('change', validateConsent);
input.generalEnquiry.addEventListener('change', validateQuery);
input.supportRequest.addEventListener('change', validateQuery);
