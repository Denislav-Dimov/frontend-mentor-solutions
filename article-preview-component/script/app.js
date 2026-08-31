const shareBtn = document.querySelector('.share-btn');
const shareLinks = document.querySelector('.share-links');

shareBtn.addEventListener('click', () => {
    shareLinks.classList.toggle('display');
});