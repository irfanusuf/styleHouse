let slideIndex = 1;
showSlides(slideIndex);

// Function to show the slides
function showSlides(n) {
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }

    slides.forEach((slide, index) => {
        slide.style.display = 'none';
        dots[index].className = dots[index].className.replace(' active', '');
    });

    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].className += ' active';
}

// Function to navigate to the next or previous slide
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Function to navigate to the specific slide via the dots
function currentSlide(n) {
    showSlides(slideIndex = n);
}
