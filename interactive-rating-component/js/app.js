const reviewRequest = document.querySelector('.review-request');
const thankYouState = document.querySelector('.thank-you-state');
const selectedRateLabel = document.querySelector('.selected-rate');
const options = document.querySelectorAll('.option');
const submit = document.querySelector('.submit');
let selectedRate = null;

options.forEach(option => {
  option.addEventListener('click', () => {

    unselectOptions(options);

    selectOption(option);

    selectedRate = option.dataset.rate;
  });
});

submit.addEventListener('click', () => {
  if (!selectedRate) return;

  switchStates(reviewRequest, thankYouState);

  selectedRateLabel.innerText = selectedRate;
});


const selectOption = option =>
  option.classList.add('selected');

const unselectOptions = options =>
  options.forEach(o => o.classList.remove('selected'));

const switchStates = (state1, state2) => {
  state1.classList.toggle('hidden');
  state2.classList.toggle('hidden');
};
