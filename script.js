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

/*=========================================
        MENÚ MÓVIL (hamburguesa)
=========================================*/

const navToggle = document.getElementById("navToggle");
const navbar = document.getElementById("navbar");
const navBackdrop = document.getElementById("navBackdrop");
const navList = document.getElementById("navList");

function openNav(){
    navbar.classList.add("open");
    navBackdrop.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
}

function closeNav(){
    navbar.classList.remove("open");
    navBackdrop.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
}

if (navToggle && navbar && navBackdrop) {

    navToggle.addEventListener("click", () => {
        const isOpen = navbar.classList.contains("open");
        isOpen ? closeNav() : openNav();
    });

    navBackdrop.addEventListener("click", closeNav);

    navList?.querySelectorAll("a").forEach(a =>
        a.addEventListener("click", closeNav)
    );

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
    });

}