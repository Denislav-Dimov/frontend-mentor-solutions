const adviceNumber = document.getElementById('adviceNumber');
const adviceText = document.getElementById('adviceText');

const API_URL = 'https://api.adviceslip.com/advice';

async function generateAdvice() {
  const adviceData = await getData();

  adviceNumber.innerText = adviceData.slip.id;
  adviceText.innerText = `"${adviceData.slip.advice}"`;
  setFadeIn(adviceText);
}

async function getData() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`Error when fetching: ${error.message}`);
  }
}

function setFadeIn(textEl) {
  textEl.classList.add('appear');

  setTimeout(() => {
    textEl.classList.remove('appear');
  }, 2000);
}


document.addEventListener('DOMContentLoaded', generateAdvice);
