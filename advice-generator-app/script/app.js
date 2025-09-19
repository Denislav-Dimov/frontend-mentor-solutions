const adviceNumber = document.getElementById('adviceNumber');
const adviceText = document.getElementById('adviceText');
const card = document.querySelector('.card');
const loading = document.createElement('div');
loading.className = 'loader';

const API_URL = 'https://api.adviceslip.com/advice';

async function generateAdvice() {
  const adviceData = await getData();

  adviceNumber.innerText = adviceData.slip.id;
  adviceText.innerText = `"${adviceData.slip.advice}"`;
  setFadeIn(adviceText);
}

async function getData() {
  try {
    showLoadingScreen();

    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();
    
    return data;
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

  card.replaceChild(adviceText, loading);
}

function setFadeIn(textEl) {
  textEl.classList.add('appear');

  setTimeout(() => {
    textEl.classList.remove('appear');
  }, 2000);
}

document.addEventListener('DOMContentLoaded', generateAdvice);
