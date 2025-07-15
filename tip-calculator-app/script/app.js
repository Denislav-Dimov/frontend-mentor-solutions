const inputBill = document.getElementById('inputBill');
const inputPeople = document.getElementById('inputPeople');
const tipBtns = document.querySelectorAll('.tip-btn');
const btnCustom = document.getElementById('btnCustom');

let billValue = null;
let btnValue = null;
let peopleValue = null;

const errorMsgBill = document.getElementById('errorMsgBill');
const errorMsgPeople = document.getElementById('errorMsgPeople');

const tipPerPerson = document.getElementById('tipPerPerson');
const total = document.getElementById('total');
const resetBtn = document.getElementById('resetBtn');


function calculate() {
    setResetBtn();

    clearAllErrors();

    if (billValue === null) {
        setError(inputBill, errorMsgBill);
        return;
    } else if (peopleValue === null) {
        setError(inputPeople, errorMsgPeople);
        return;
    }

    const tipPerPersonResult = (billValue / peopleValue) * btnValue;
    const totalResult = (billValue / peopleValue) + tipPerPersonResult;

    tipPerPerson.innerText = formatNumber(tipPerPersonResult);
    total.innerText = formatNumber(totalResult);
}


inputBill.addEventListener('input', () => {
    let inputBillValue = inputBill.value;

    if (inputBillValue === '' || inputBillValue <= 0) {
        billValue = null;
    } else {
        billValue = inputBillValue;
    }

    calculate();
});

inputPeople.addEventListener('input', () => {
    let inputPeopleValue = inputPeople.value;

    if (inputPeopleValue === '' || inputPeopleValue <= 0) {
        peopleValue = null;
    } else {
        inputPeopleValue = parseFloat(inputPeopleValue);
        if (!Number.isInteger(inputPeopleValue)) {
            peopleValue = null;
            errorMsgPeople.innerText = `Can't have decimal`;
        } else {
            peopleValue = inputPeopleValue;
            errorMsgPeople.innerText = `Can't be zero`;
        }
    }

    calculate();
});

tipBtns.forEach(button => {
    button.addEventListener('click', () => {
        clearActiveState(tipBtns);
        button.classList.add('active');

        btnValue = parseFloat(button.dataset.value) / 100;
        btnCustom.value = '';

        calculate();
    });
});

btnCustom.addEventListener('input', () => {
    let btnCustomValue = btnCustom.value;

    if (btnCustomValue === '' || btnCustomValue <= 0) {
        btnValue = null;
    } else {
        btnValue = btnCustomValue / 100;
    }

    clearActiveState(tipBtns);

    calculate();
});


function setError(input, errorMsg) {
    input.classList.add('error-state');
    errorMsg.classList.add('show-error-msg');
}

function clearError(input, errorMsg) {
    input.classList.remove('error-state');
    errorMsg.classList.remove('show-error-msg');
}

function clearAllErrors() {
    clearError(inputBill, errorMsgBill);
    clearError(inputPeople, errorMsgPeople);
}

function clearActiveState(buttons) {
    buttons.forEach(btn => btn.classList.remove('active'));
}

const formatNumber = number => '$' + number.toFixed(2);

function setResetBtn() {
    resetBtn.classList.add('active');

    resetBtn.addEventListener('click', () => {
        inputBill.value = '';
        clearActiveState(tipBtns);
        inputPeople.value = '';
        btnCustom.value = '';

        billValue = null;
        peopleValue = null;
        btnValue = null;

        tipPerPerson.innerText = '$0.00';
        total.innerText = '$0.00';

        clearAllErrors();

        resetBtn.classList.remove('active');
    });
}
