const titles = document.querySelectorAll('.title');
const currentHours = document.querySelectorAll('.hours');
const previousHours = document.querySelectorAll('.previous-hours');
const timeframeOptions = document.querySelectorAll('.option');

fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
        timeframeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const timeframe = option.dataset.timeframe;

                updateDisplay(data, timeframe);
                updateActiveState(timeframeOptions, option);
            });
        });

        // default view
        updateDisplay(data, 'weekly');
    });

function updateDisplay(data, timeframe) {
    const labels = {
        daily: 'Yesterday',
        weekly: 'Last Week',
        monthly: 'Last Month'
    };

    data.forEach((dataItem, i) => {
        titles[i].innerText = dataItem.title;
        currentHours[i].innerText = `${dataItem.timeframes[timeframe].current}hrs`;
        previousHours[i].innerText = `${labels[timeframe]} - ${dataItem.timeframes[timeframe].previous}hrs`;
    });
}

function updateActiveState(allOptions, selectedOption) {
    allOptions.forEach(p => p.classList.remove('active'));
    selectedOption.classList.add('active');
}
