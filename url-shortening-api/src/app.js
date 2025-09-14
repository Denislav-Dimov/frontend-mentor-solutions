const navMenu = document.getElementById('navMenu');
const menuBtn = document.getElementById('navBtn');
const input = document.getElementById('input');
const errorMsg = document.getElementById('errorMessage');
const shortenBtn = document.getElementById('shortenBtn');

menuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('hidden');
});

shortenBtn.addEventListener('click', () => {
  hideError();

  const link = input.value.trim();

  if (link == '') {
    showError("Please add a link");
    return false;
  }
});

function showError(message) {
  input.classList.add("error");
  errorMsg.innerText = message;
}

function hideError() {
  input.classList.remove("error");
  errorMsg.innerText = '';
}

document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
    navMenu.classList.add('hidden');
  }
});