const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const title = item.querySelector('.faq-item__title');
  const button = item.querySelector('.faq-item__button');
  const icon = item.querySelector('.faq-item__icon');
  const content = item.querySelector('.faq-item__content');

  function toggleContent() {
    if (content.classList.contains('open')) {
      content.style.height = '0';
      content.style.marginBottom = '0';
      content.classList.remove('open');
      icon.src = './images/icon-plus.svg';
    } else {
      content.style.height = `${content.scrollHeight}px`;
      content.style.marginBottom = '1rem';
      content.classList.add('open');
      icon.src = './images/icon-minus.svg';
    }
  }

  title.addEventListener('click', toggleContent);
  button.addEventListener('click', toggleContent);
});
