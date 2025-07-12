// the options on active state
const options = document.querySelectorAll('.option');

for (let option of options) {
    option.addEventListener('click', () => {
        options.forEach(p => p.classList.remove('active'));
        option.classList.add('active');
    });
}

const title = document.querySelectorAll('.title');
const currentHours = document.querySelectorAll('.hours');
const previousHours = document.querySelectorAll('.previous-hours');
const dailyBtn = document.getElementById('daily');
const weeklyBtn = document.getElementById('weekly');
const monthlyBtn = document.getElementById('monthly');

fetch('data/data.json')
    .then(response => response.json())
    .then(data => {
        dailyBtn.addEventListener('click', () => {
            displayTitle();

            for (let i = 0; i < currentHours.length; i++) {
                currentHours[i].innerText = `${data[i].timeframes.daily.current}hrs`;
            }

            for (let i = 0; i < previousHours.length; i++) {
                previousHours[i].innerText = `Yesterday - ${data[i].timeframes.daily.previous}hrs`;
            }
        });

        weeklyBtn.addEventListener('click', () => {
            displayTitle();

            for (let i = 0; i < currentHours.length; i++) {
                currentHours[i].innerText = `${data[i].timeframes.weekly.current}hrs`;
            }

            for (let i = 0; i < previousHours.length; i++) {
                previousHours[i].innerText = `Last Week - ${data[i].timeframes.weekly.previous}hrs`;
            }
        });

        monthlyBtn.addEventListener('click', () => {
            displayTitle();

            for (let i = 0; i < currentHours.length; i++) {
                currentHours[i].innerText = `${data[i].timeframes.monthly.current}hrs`;
            }

            for (let i = 0; i < previousHours.length; i++) {
                previousHours[i].innerText = `Last Month - ${data[i].timeframes.monthly.previous}hrs`;
            }
        });

        function displayTitle() {
            for (let i = 0; i < title.length; i++) {
                title[i].innerText = `${data[i].title}`;
            }
        }
    });