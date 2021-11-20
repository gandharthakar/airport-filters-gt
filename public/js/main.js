
// Toggle Mobile Filters.

const mobi_filter_button = document.querySelector('.js-toggle-filters');
const filter_container = document.querySelector('.js-mob-filters');
mobi_filter_button.addEventListener('click', function() {
    let isActive = this.classList.contains('active');
    if(!isActive) {
        this.classList.add('active');
        filter_container.classList.add('active');
    } else {
        this.classList.remove('active');
        filter_container.classList.remove('active');
    }
});