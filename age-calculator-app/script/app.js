const input = {
    day: document.getElementById('day'),
    month: document.getElementById('month'),
    year: document.getElementById('year')
};

const current = {
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
};

const button = document.getElementById('button');

button.addEventListener('click', main);

function main() {
    const value = {
        day: parseInt(input.day.value.trim()),
        month: parseInt(input.month.value.trim()),
        year: parseInt(input.year.value.trim())
    };

    if (!validateDates(value.day, value.month, value.year)) {
        return;
    }

    formatInputs(input.day, input.month);

    const birthDate = calculateAge(value.day, value.month, value.year);

    printResult(birthDate);
}

function calculateAge(birthDay, birthMonth, birthYear) {
    let calculated = {
        day: 0,
        month: 0,
        year: 0,
    };

    calculated.year = current.year - birthYear;
    calculated.month = current.month - birthMonth;
    calculated.day = current.day - birthDay;

    if (calculated.day < 0) {
        calculated.day = (current.day + getDaysInMonth(current.year, current.month - 1)) - birthDay;

        calculated.month--;
    }

    if (calculated.month < 0) {
        calculated.month = (current.month + 12) - birthMonth;

        calculated.year--;
    }

    return calculated;
}

// returns thse number of days in a month (2020, 2 => 29)
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

function validateDates(day, month, year) {
    const errorContainers = document.querySelectorAll('.error-message');
    let isValidated = true;

    errorContainers.forEach(error => {
        if (error.previousElementSibling.value === '') {
            setError(error.previousElementSibling, 'This field is required');
            isValidated = false;
        } else {
            clearError(error.previousElementSibling);
        }
    });

    if (!isValidated) return;

    if (!(day >= 1 && day <= 31)) {
        setError(input.day, 'Must be a valid day');
        isValidated = false;
    }
    if (!(month >= 1 && month <= 12)) {
        setError(input.month, 'Must be a valid month');
        isValidated = false;
    }
    if (new Date() < new Date(year, month - 1, day)) {
        setError(input.year, 'Must be in the past');
        isValidated = false;
    }

    if (!validDate(year, month, day)) {
        setError(input.day, 'Must be a valid date');
        setError(input.month);
        setError(input.year);
        isValidated = false;
    }

    return isValidated;
}

function setError(element, message = '') {
    const label = element.previousElementSibling;
    const input = element;
    const errorContainer = element.nextElementSibling;

    label.classList.add('error-state');
    input.classList.add('error-state');
    errorContainer.innerText = message;
}

function clearError(element) {
    const label = element.previousElementSibling;
    const input = element;
    const errorContainer = element.nextElementSibling;

    label.classList.remove('error-state');
    input.classList.remove('error-state');
    errorContainer.innerText = '';
}

const validDate = (year, month, day) => day <= getDaysInMonth(year, month);

function formatInputs(day, month) {
    day.value = day.value.trim().padStart(2, '0');
    month.value = month.value.trim().padStart(2, '0');
};

function printResult(birthDate) {
    const day = document.getElementById('daysOutput');
    const month = document.getElementById('monthsOutput');
    const year = document.getElementById('yearsOutput');

    year.innerText = birthDate.year;
    month.innerText = birthDate.month;
    day.innerText = birthDate.day;
}