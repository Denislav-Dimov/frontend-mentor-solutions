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
const shortenForm = document.getElementById('shortenForm');
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

shortenForm.addEventListener('submit', async e => {
  e.preventDefault();

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
  startLoading();

  const response = await
    fetch('https://corsproxy.io/?' + encodeURIComponent('https://cleanuri.com/api/v1/shorten'), {
      method: 'POST',
      body: new URLSearchParams({ url: newUrl })
    });

  if (!response.ok) {
    await finishLoading();
    throw new Error(`Request failed: ${response.status}`);
  }

  const data = await response.json();

  await finishLoading();

  return data.result_url;
}

function startLoading() {
  shortenBtn.innerHTML = `
    <div role="status">
      <svg aria-hidden="true" class="size-7 text-neutral-gray-900 animate-spin fill-neutral-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  `;
}

async function finishLoading() {
  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 500));

  shortenBtn.innerHTML = 'Shorten It!';
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
