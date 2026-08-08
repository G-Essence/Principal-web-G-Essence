/*=========================================
            NAVBAR SCROLL
=========================================*/

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});

/*=========================================
        REVEAL ANIMATION
=========================================*/

const reveals = document.querySelectorAll(
".about, .products, .why, .video-section, .contact, footer"
);

const revealOnScroll = () => {

    reveals.forEach(section => {

        const top = section.getBoundingClientRect().top;

        const visible = window.innerHeight - 120;

        if(top < visible){

            section.classList.add("active");

        }

    });

};

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

/*=========================================
            PRELOADER
=========================================*/

window.addEventListener("load",()=>{

const loader=document.getElementById("loader");

loader.style.opacity="0";

setTimeout(()=>{

loader.style.display="none";

},900);

});