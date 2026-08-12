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
        REVEAL ANIMATION (IntersectionObserver)
=========================================*/

const reveals = document.querySelectorAll(
".about, .products, .why, .video-section, .contact, footer"
);

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("active");

                revealObserver.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.12,
        rootMargin: "0px 0px -80px 0px"

    });

    reveals.forEach(section => revealObserver.observe(section));

} else {

    // Fallback para navegadores muy antiguos
    reveals.forEach(section => section.classList.add("active"));

}

/*=========================================
    NAV ACTIVO SEGÚN SECCIÓN VISIBLE
=========================================*/

const sectionsWithId = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("#navList a[href^='#']");

if ("IntersectionObserver" in window && sectionsWithId.length && navLinks.length) {

    const navObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            const id = entry.target.getAttribute("id");
            const link = document.querySelector(`#navList a[href="#${id}"]`);

            if (!link) return;

            if (entry.isIntersecting) {

                navLinks.forEach(a => a.classList.remove("nav-active"));
                link.classList.add("nav-active");

            }

        });

    }, {

        threshold: 0.3,
        rootMargin: "-90px 0px -55% 0px"

    });

    sectionsWithId.forEach(section => navObserver.observe(section));

}

/*=========================================
    EFECTO RIPPLE EN CLICS (botones)
=========================================*/

const rippleSelector = ".btn-primary, .btn-secondary, .btn-header, .product-btn, .btn-youtube, .back-top, .nav-toggle";

document.addEventListener("click", (e) => {

    const target = e.target.closest(rippleSelector);

    if (!target) return;

    const circle = document.createElement("span");
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    circle.className = "ripple-effect";
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;

    target.appendChild(circle);

    circle.addEventListener("animationend", () => circle.remove());

});

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