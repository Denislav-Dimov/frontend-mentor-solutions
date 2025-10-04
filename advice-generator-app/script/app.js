const adviceNumber = document.getElementById('adviceNumber');
const adviceText = document.getElementById('adviceText');
const card = document.getElementById('card');
const loading = document.createElement('div');
loading.className = 'loader';

const API_URL = 'https://api.adviceslip.com/advice';

const HISTORY_LC_KEY = 'Advice Generator History';
const FAVOURITE_LC_KEY = 'Advice Generator Favourite';
let historyList = null;
let favouriteList = null;

document.addEventListener('DOMContentLoaded', () => {
  historyList = getHistoryData();
  favouriteList = getFavouriteData();

  renderHistory();

  generateAdvice();
});

async function generateAdvice() {
  const adviceData = await getData();

  if (!adviceData) {
    return;
  }

  saveCurrentToHistory(adviceData);

  adviceNumber.innerText = adviceData.id;
  adviceText.innerText = `"${adviceData.advice}"`;
  setFadeIn(adviceText);

  renderHistory();
}

async function getData() {
  try {
    showLoadingScreen();

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();

    return {
      advice: data.slip.advice,
      id: data.slip.id
    };

  } catch (error) {
    console.error(`Error when fetching: ${error.message}`);
  } finally {
    await hideLoadingScreen();
  }
}

function showLoadingScreen() {
  if (!card.contains(adviceText)) return;

  adviceNumber.innerText = 0;
  card.replaceChild(loading, adviceText);
}

async function hideLoadingScreen() {
  // wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (card.contains(loading)) {
    card.replaceChild(adviceText, loading);
  }
  else if (!card.contains(adviceText)) {
    card.appendChild(adviceText);
  }
}

function setFadeIn(textEl) {
  textEl.classList.add('appear');

  setTimeout(() => {
    textEl.classList.remove('appear');
  }, 2000);
}

const menuBackground = document.getElementById('menuBackground');
const menu = document.getElementById('menu');

function toggleMenu() {
  menu.classList.toggle('active');
  menuBackground.classList.toggle('active');
}

menuBackground.addEventListener('click', e => {
  if (e.target == menuBackground) {
    toggleMenu();
  }
});

const menuBtnHistory = document.getElementById('menuBtnHistory');
const menuBtnFavourite = document.getElementById('menuBtnFavourite');
const currentState = document.getElementById('currentState');
const menuContent = document.getElementById('menuContent');

menuBtnHistory.addEventListener('click', renderHistory);

menuBtnFavourite.addEventListener('click', renderFavourite);

function renderHistory() {
  menuBtnHistory.classList.add('active');
  menuBtnFavourite.classList.remove('active');
  currentState.innerText = 'Recent';

  if (historyList.length === 0) {
    menuContent.innerHTML = `
      <div class="menu-content empty-state">
        <h3>No Recent Advices</h3>
      </div>
    `;

    return;
  }

  let dom = ``;

  historyList.forEach(currentAdvice => {
    dom += `
      <div class="menu-content">
        <div class="flex-spaced">
          <h3 class="menu-content-id"><span class="spaced">advice</span> # <span class="spaced">${currentAdvice.adviceId}</span></h3>

          <div class="menu-content-buttons">
            <button class="menu-content-btn btn-delete" title="delete advice" onclick="deleteAdvice('${currentAdvice.uniqueId}')">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="menu-content-btn btn-favourite" title="favourite advice" onclick="favouriteAdvice('${currentAdvice.uniqueId}', this)">
              <i class="fa-solid fa-star"></i>
            </button>
            <button class="menu-content-btn" title="paste advice on screen" onclick="pasteAdvice('${currentAdvice.uniqueId}', false)">
              <i class="fa-solid fa-paste"></i>
            </button>
          </div>
        </div>

        <p class="menu-content-advice">"${currentAdvice.advice}"</p>
      </div>
    `;
  });

  menuContent.innerHTML = dom;
}

function deleteAdvice(id) {
  historyList = historyList.filter(el => el.uniqueId !== id);

  saveHistory();
  renderHistory();
}

function favouriteAdvice(id, buttonEl) {
  const advice = historyList.find(ad => ad.uniqueId === id);

  if (favouriteList.some(fAd => fAd.adviceId === advice.adviceId)) {
    buttonEl.classList.add('pulse-animation');

    setTimeout(() => {
      buttonEl.classList.remove('pulse-animation');
    }, 3000);

    return;
  }

  favouriteList.unshift({
    advice: advice.advice,
    adviceId: advice.adviceId,
    uniqueId: crypto.randomUUID()
  });

  saveFavourite();
  renderFavourite();
}

function pasteAdvice(id, inFavourite = true) {
  // it will know where to search depending on 'inFavourite'
  let advice;
  if (inFavourite) {
    advice = favouriteList.find(ad => ad.uniqueId === id);
  }
  else {
    advice = historyList.find(ad => ad.uniqueId === id);
  }

  if (!advice) {
    return;
  }

  adviceNumber.innerText = advice.adviceId;
  adviceText.innerText = `"${advice.advice}"`;
  setFadeIn(adviceText);
}

function renderFavourite() {
  menuBtnHistory.classList.remove('active');
  menuBtnFavourite.classList.add('active');
  currentState.innerText = 'Favourite';

  if (favouriteList.length === 0) {
    menuContent.innerHTML = `
      <div class="menu-content empty-state">
        <h3>No Favourite Advices</h3>
      </div>
    `;

    return;
  }

  let dom = '';

  favouriteList.forEach(currentAdvice => {
    dom += `
      <div class="menu-content">
        <div class="flex-spaced">
          <h3 class="menu-content-id"><span class="spaced">advice</span> # <span class="spaced">${currentAdvice.adviceId}</span></h3>

          <div class="menu-content-buttons">
            <button class="menu-content-btn btn-unfavourite" title="unfavourite advice" onclick="unfavouriteAdvice('${currentAdvice.uniqueId}')">
              <i class="fa-solid fa-star"></i>
            </button>
            <button class="menu-content-btn" title="paste advice on screen" onclick="pasteAdvice('${currentAdvice.uniqueId}')">
              <i class="fa-solid fa-paste"></i>
            </button>
          </div>
        </div>

        <p class="menu-content-advice">"${currentAdvice.advice}"</p>
      </div>
    `;
  });

  menuContent.innerHTML = dom;
}

function unfavouriteAdvice(id) {
  favouriteList = favouriteList.filter(el => el.uniqueId !== id);

  saveFavourite();
  renderFavourite();
}

function saveCurrentToHistory(advice) {
  if (historyList.length > 0 && historyList[0].adviceId === advice.id) {
    return;
  }

  historyList.unshift({
    advice: advice.advice,
    adviceId: advice.id,
    uniqueId: crypto.randomUUID()
  });

  if (historyList.length > 25) {
    historyList.pop();
  }

  saveHistory();
}

function saveHistory() {
  localStorage.setItem(HISTORY_LC_KEY, JSON.stringify(historyList));
}

function saveFavourite() {
  localStorage.setItem(FAVOURITE_LC_KEY, JSON.stringify(favouriteList));
}

function getHistoryData() {
  const data = JSON.parse(localStorage.getItem(HISTORY_LC_KEY));

  return data ? data : [];
}

function getFavouriteData() {
  const data = JSON.parse(localStorage.getItem(FAVOURITE_LC_KEY));

  return data ? data : [];
}