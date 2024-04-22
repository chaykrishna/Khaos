let myManu = document.querySelector(".apear");
myNav = document.querySelector(".nav"),
closeIcon = document.querySelector(".nav .icon"),
headerImage = document.querySelector(".header .image"),
trendingImage = document.querySelectorAll(".best-selling img");
bestSellingButton = document.getElementById("best-selling"),
testimonials = document.getElementById("testimonials");

// Function to close the navigation menu and scroll to a specific section
function goTo(sectionId) {
    if (myNav.classList.contains("active")) {
        myNav.classList.remove("active");
        myManu.classList.remove("unable");
        headerImage.classList.remove("none");
    }
    // Scroll to the specified section
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Code for the menu button and navigation menu
myManu.onclick = () => {
    if (myNav.classList.contains("active")) {
        return;
    } else {
        myNav.classList.toggle("active");
        myManu.classList.toggle("unable");
        headerImage.classList.toggle("none");
    }
};

closeIcon.onclick = () => {
    if (closeIcon.classList.contains("none")) {
        return;

    } else {
        myNav.classList.remove("active");
        myManu.classList.remove("unable");
        headerImage.classList.remove("none");
    }
}

// Event listeners for scrolling to sections when menu links are clicked
bestSellingButton.onclick = () => {
    goTo('best-selling');
}

testimonials.onclick = () => {
    goTo('testimonials');
}

// Scroll to top functionality
let up = document.getElementById("up");
up.onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' ,
    });
}

// Scroll animations and other functionality (if any)
let swiper = new Swiper(".mySwiper", {
    pagination: {
        el: ".swiper-pagination",
        type: "fraction",
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Additional scroll-related functionality (if any)
window.onscroll = function () {
    // Scroll to top button visibility
    if (this.scrollY >= 1000) {
        up.classList.add("active");
    } else {
        up.classList.remove("active");
    }
    // Other scroll-related animations or actions
}
