/* ==========================================
   G-Essence - Encuesta Premium
   script.js
========================================== */

document.documentElement.dataset.scriptLoaded = 'yes';

const firebaseConfig = {
  apiKey: "AIzaSyC8gaY4tGtyx6GH-ckDyMsHr1VhZNmNbUI",
  authDomain: "g-essence.firebaseapp.com",
  databaseURL: "https://g-essence-default-rtdb.firebaseio.com/",
  projectId: "g-essence",
  storageBucket: "g-essence.firebasestorage.app",
  messagingSenderId: "276406340606",
  appId: "1:276406340606:web:5b732583ad1420aa7d4eaf"
};

async function saveSurveyData(surveyData) {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js");
    const { getDatabase, ref, push, set } = await import("https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js");

    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const encuestaRef = push(ref(database, "encuestas"));
    await set(encuestaRef, surveyData);
}

function initSurvey(){
    const form = document.getElementById("surveyForm");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");

    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    const productCards = Array.from(document.querySelectorAll(".product-card"));
    const questionsSections = Array.from(document.querySelectorAll(".questions"));
    const sectionSteps = questionsSections.map(section => Array.from(section.querySelectorAll(".question-step")));

    let currentSectionIndex = 0;
    let currentStep = 0;
    let steps = [];
    let autoAdvanceListeners = [];

    function hasManualNextStep(stepElement){
        if(!stepElement) return false;
        return stepElement.querySelectorAll("textarea, input[type='text'], input[type='email'], input[type='number'], input[type='tel'], input[type='date'], input[type='time'], input[type='datetime-local'], input[type='search'], input[type='url'], input[type='password']").length > 0;
    }

    function clearAutoAdvance(){
        autoAdvanceListeners.forEach(({el,event,fn}) => el.removeEventListener(event, fn));
        autoAdvanceListeners = [];
    }

    const productoInput = document.getElementById('productoSeleccionado');

    function selectProduct(index){
        if(index < 0 || index >= productCards.length) return;
        currentSectionIndex = index;
        const product = productCards[index].dataset.product || '';
        productoInput.value = product;
        productCards.forEach((c,i) => c.classList.toggle("active", i===index));
        questionsSections.forEach((q,i) => q.classList.toggle("active-question", i===index));
        steps = sectionSteps[index] || [];
        currentStep = 0;
        showStep(currentStep);
        updateProgress();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    productCards.forEach((card,index) => {
        card.addEventListener("click", () => selectProduct(index));
    });

    if(productCards.length > 0){
        selectProduct(0);
    }

    function showStep(n){
        steps.forEach((step,i) => {
            step.style.display = (i===n) ? "block" : "none";
        });

        const isLastStep = n === steps.length - 1;
        const isLastSection = currentSectionIndex === productCards.length - 1;
        const requiresManualNext = hasManualNextStep(steps[n]);
        prevBtn.style.display = (n===0 && currentSectionIndex===0) ? "none" : "inline-block";

        if(nextBtn){
            if(isLastStep && isLastSection){
                nextBtn.style.display = "none";
            } else if(requiresManualNext){
                nextBtn.style.display = "inline-block";
            } else {
                nextBtn.style.display = "none";
            }
        }
        submitBtn.style.display = (isLastStep && isLastSection) ? "inline-block" : "none";

        updateProgress();
        clearAutoAdvance();
        setupAutoAdvance();
    }

    function updateProgress(){
        if(steps.length === 0) return;
        const percent = ((currentStep + 1) / steps.length) * 100;
        progressBar.style.width = percent + "%";

        const isLastStep = currentStep === steps.length - 1;
        const isLastSection = currentSectionIndex === productCards.length - 1;

        if(isLastStep && isLastSection){
            progressText.textContent = `✅ Todas las preguntas completadas`;
            progressText.classList.add("completed");
            progressBar.classList.add("completed");
        } else if(isLastStep){
            progressText.textContent = `Producto ${currentSectionIndex + 1} completado. Siguiente producto...`;
            progressText.classList.remove("completed");
            progressBar.classList.remove("completed");
        } else {
            progressText.textContent = `Producto ${currentSectionIndex + 1} de ${productCards.length} · Pregunta ${currentStep + 1} de ${steps.length}`;
            progressText.classList.remove("completed");
            progressBar.classList.remove("completed");
        }
    }

    function setupAutoAdvance(){
        const currentStepElement = steps[currentStep];
        if(!currentStepElement || hasManualNextStep(currentStepElement)) return;

        const inputs = currentStepElement.querySelectorAll("input, select, textarea");
        inputs.forEach(input => {
            const advance = (event) => {
                const isTextLike = ["text", "email", "number", "tel", "date", "time", "datetime-local", "search", "url", "password"].includes(input.type);
                if(isTextLike && event.type === "input") return;

                if(!validateStep(currentStep)) return;

                setTimeout(() => {
                    if(currentStep < steps.length - 1 || currentSectionIndex < productCards.length - 1){
                        goNext();
                    }
                }, 180);
            };

            const events = input.type === "radio" || input.type === "checkbox" || input.tagName === "SELECT"
                ? ["change"]
                : ["change", "blur"];

            events.forEach(eventName => {
                input.addEventListener(eventName, advance);
                autoAdvanceListeners.push({ el: input, event: eventName, fn: advance });
            });
        });
    }

    function goNext(){
        if(!validateStep(currentStep)) return;
        if(currentStep < steps.length - 1){
            currentStep++;
            showStep(currentStep);
        } else if(currentSectionIndex < productCards.length - 1){
            selectProduct(currentSectionIndex + 1);
        }
    }

    function goPrev(){
        if(currentStep > 0){
            currentStep--;
            showStep(currentStep);
        } else if(currentSectionIndex > 0){
            selectProduct(currentSectionIndex - 1);
            currentStep = steps.length - 1;
            showStep(currentStep);
        }
    }

    if(nextBtn){
        nextBtn.addEventListener("click", goNext);
    }
    prevBtn.addEventListener("click", goPrev);

    function validateStep(n){
        const currentStepElement = steps[n];
        if(!currentStepElement) return true;

        const inputs = Array.from(currentStepElement.querySelectorAll("input, select, textarea"));
        const radioGroups = new Set();

        for(const input of inputs){
            if(input.type === "hidden"){
                if(input.value && input.value !== "0"){
                    return true;
                }
                continue;
            }

            if(input.type === "radio"){
                const name = input.name;
                if(radioGroups.has(name)) continue;
                radioGroups.add(name);

                const checked = currentStepElement.querySelector(`input[name="${name}"]:checked`);
                if(!checked){
                    return false;
                }
                continue;
            }

            if(input.type === "checkbox"){
                if(input.checked) return true;
                if(input.required) return false;
                continue;
            }

            if(input.tagName === "SELECT"){
                if(input.value.trim() !== "") return true;
                if(input.required) return false;
                continue;
            }

            if(input.type === "file"){
                if(input.files && input.files.length > 0) return true;
                if(input.required) return false;
                continue;
            }

            if(input.value.trim() !== "") return true;
            if(input.required) return false;
        }

        return true;
    }

    const starGroups = document.querySelectorAll(".stars");
    starGroups.forEach(group => {
        const stars = group.querySelectorAll("i");
        const hiddenInput = group.querySelector("input[type='hidden']");

        stars.forEach((star,index) => {
            star.addEventListener("click", () => {
                stars.forEach((s,i) => {
                    if(i <= index){
                        s.classList.remove("fa-regular");
                        s.classList.add("fa-solid","active");
                    } else {
                        s.classList.remove("fa-solid","active");
                        s.classList.add("fa-regular");
                    }
                });
                if(hiddenInput){
                    hiddenInput.value = index + 1;
                    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
                }
            });
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Guardando...";

        try {
            if(!validateStep(currentStep)){
                throw new Error("Por favor, complete la pregunta actual antes de enviar.");
            }

            const formData = new FormData(form);
            const rawData = Object.fromEntries(formData.entries());

            if(!rawData.producto){
                throw new Error("Seleccione un producto antes de enviar la encuesta.");
            }

            const surveyData = {
                datosPersonales: {
                    nombre: rawData.nombre || "",
                    edad: rawData.edad || "",
                    sexo: rawData.sexo || "",
                    municipio: rawData.municipio || ""
                },
                producto: rawData.producto || "",
                preguntas: {
                    te: {
                        te1: rawData.te1 || "",
                        te2: rawData.te2 || "",
                        te3: rawData.te3 || "",
                        te4: rawData.te4 || "",
                        te5: rawData.te5 || "",
                        te6: rawData.te6 || "",
                        te7: rawData.te7 || "",
                        te8: rawData.te8 || ""
                    },
                    postres: {
                        postres1: rawData.postres1 || "",
                        postres2: rawData.postres2 || "",
                        postres3: rawData.postres3 || "",
                        postres4: rawData.postres4 || "",
                        postres5: rawData.postres5 || "",
                        postres6: rawData.postres6 || "",
                        postres7: rawData.postres7 || "",
                        postres8: rawData.postres8 || ""
                    },
                    mantequilla: {
                        mantequilla1: rawData.mantequilla1 || "",
                        mantequilla2: rawData.mantequilla2 || "",
                        mantequilla3: rawData.mantequilla3 || "",
                        mantequilla4: rawData.mantequilla4 || "",
                        mantequilla5: rawData.mantequilla5 || "",
                        mantequilla6: rawData.mantequilla6 || "",
                        mantequilla7: rawData.mantequilla7 || "",
                        mantequilla8: rawData.mantequilla8 || ""
                    },
                    jabones: {
                        jabones1: rawData.jabones1 || "",
                        jabones2: rawData.jabones2 || "",
                        jabones3: rawData.jabones3 || "",
                        jabones4: rawData.jabones4 || "",
                        jabones5: rawData.jabones5 || "",
                        jabones6: rawData.jabones6 || "",
                        jabones7: rawData.jabones7 || "",
                        jabones8: rawData.jabones8 || ""
                    }
                },
                fechaHora: new Date().toISOString(),
                timestamp: new Date().toISOString()
            };

            await saveSurveyData(surveyData);

            form.style.display = "none";
            document.querySelector("header").style.display = "none";
            document.querySelector(".progress").style.display = "none";
            const backgroundEl = document.querySelector(".background");
            if (backgroundEl) backgroundEl.style.display = "none";
            document.querySelectorAll(".leaf").forEach(leaf => leaf.style.display = "none");
            document.getElementById("thanks").style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            const online = typeof navigator !== 'undefined' ? navigator.onLine : 'unknown';
            const errMsg = (`No se pudo guardar la encuesta. Error: ${error && error.message ? error.message : error}. ` +
                `Tipo: ${error && error.name ? error.name : 'unknown'}. Navegador online: ${online}`);
            alert(errMsg);
            console.error("[survey] Error al guardar:", error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
        button.addEventListener("click", function(e){
            const circle = document.createElement("span");
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            circle.style.width = circle.style.height = diameter + "px";
            circle.style.left = e.clientX - this.getBoundingClientRect().left - diameter / 2 + "px";
            circle.style.top = e.clientY - this.getBoundingClientRect().top - diameter / 2 + "px";
            circle.classList.add("ripple");
            const ripple = this.querySelector(".ripple");
            if(ripple) ripple.remove();
            this.appendChild(circle);
        });
    });

    const darkToggle = document.createElement("button");
    darkToggle.textContent = "🌙 Modo Oscuro";
    darkToggle.classList.add("dark-toggle");
    document.querySelector("header").appendChild(darkToggle);

    darkToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        darkToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSurvey);
} else {
    initSurvey();
}

window.initSurvey = initSurvey;

