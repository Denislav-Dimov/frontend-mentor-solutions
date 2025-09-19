// mobile navigation menu
const navMenu = document.getElementById('navMenu');
const menuBtn = document.getElementById('navBtn');
menuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('hidden');
});

document.addEventListener('click', e => {
  if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
    navMenu.classList.add('hidden');
  }
});

const input = document.getElementById('input');
const errorMsg = document.getElementById('errorMessage');
const shortenBtn = document.getElementById('shortenBtn');
const urlContainer = document.getElementById('urlContainer');
let urls = [];
const LOCALSTORAGE_KEY = 'Shortly';

document.addEventListener('DOMContentLoaded', () => {
  renderUrls();
});

function loadUrls() {
  const saved = localStorage.getItem(LOCALSTORAGE_KEY);

  return saved ? JSON.parse(saved) : [];
}

function saveUrls() {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(urls));
}

function renderUrls() {
  urls = loadUrls();

  urlContainer.innerHTML = '';

  urls.forEach(url => {
    const element = document.createElement('div');
    element.className = 'bg-white md:px-6 md:py-4 rounded-lg flex max-md:flex-col md:justify-between md:gap-12 md:items-center';
    element.innerHTML = `
      <p class="[overflow-wrap:anywhere] max-md:px-5 max-md:py-4 border-b-2 border-b-neutral-gray-600 md:border-0">
        ${url.originalUrl}
      </p>

      <div class="flex max-md:flex-col gap-3 md:gap-6 md:items-center max-md:px-5 max-md:py-4">
        <p class="text-primary-blue">
          ${url.shortUrl}
        </p>
        <button data-url="${url.shortUrl}" class="bg-primary-blue hover:bg-primary-blue-active duration-200 w-full md:w-24 p-2 text-white font-bold text-sm rounded-sm cursor-pointer">
          Copy
        </button>
      </div>
    `;

    urlContainer.appendChild(element);
  });
}

urlContainer.addEventListener('click', e => {
  const btn = e.target.closest('button');

  if (btn) {
    // copy to clipboard
    navigator.clipboard.writeText(btn.dataset.url);

    btn.classList.add('bg-primary-purple');
    btn.classList.remove('hover:bg-primary-blue-active');
    btn.innerText = 'Copied!';

    // resets back to normal styles
    setTimeout(() => {
      btn.classList.remove('bg-primary-purple');
      btn.classList.add('hover:bg-primary-blue-active');
      btn.innerText = 'Copy';
    }, 1500);
  }
});

shortenBtn.addEventListener('click', async () => {
  clearError();

  const url = input.value.trim();

  if (url == '') {
    setError("Please add a link");
    return;
  }

  if (!isValidURL(url)) {
    setError("Please enter a valid link");
    return;
  }

  let newUrl = null;

  try {
    newUrl = await getNewUrl(url);
  } catch (err) {
    console.error(err);
    setError(err.message || "Something went wrong");
  }

  if (!newUrl) return;

  urls.unshift({
    originalUrl: url,
    shortUrl: newUrl
  });

  input.value = '';
  saveUrls();
  renderUrls();
});

async function getNewUrl(newUrl) {
  // Use proxy in dev, real API in gh pages
  const apiUrl = import.meta.env.DEV ? '/shorten' : 'https://cleanuri.com/api/v1/shorten';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ url: newUrl }),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.result_url;
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function setError(message) {
  input.classList.add('error');
  errorMsg.innerText = message;
}

function clearError() {
  input.classList.remove('error');
  errorMsg.innerText = '';
}
