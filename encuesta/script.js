/*=========================================
        ENCUESTA G-ESSENCE
        Navegación por pasos + guardado
        ordenado en Firebase Realtime Database
=========================================*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/*=========================================
        CONFIGURACIÓN DE FIREBASE
=========================================*/

const firebaseConfig = {
  apiKey: "AIzaSyC8gaY4tGtyx6GH-ckDyMsHr1VhZNmNbUI",
  authDomain: "g-essence.firebaseapp.com",
  databaseURL: "https://g-essence-default-rtdb.firebaseio.com",
  projectId: "g-essence",
  storageBucket: "g-essence.firebasestorage.app",
  messagingSenderId: "276406340606",
  appId: "1:276406340606:web:5b732583ad1420aa7d4eaf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/*=========================================
        NOMBRES LEGIBLES DE PRODUCTO
=========================================*/

const NOMBRE_PRODUCTO = {
  te: "Té",
  postres: "Postres con harina de Guanacaste",
  chocolate: "Chocolate de Guanacaste",
  jabones: "Jabones artesanales"
};

/*=========================================
        REFERENCIAS DEL DOM
=========================================*/

const form = document.getElementById("surveyForm");
const stepIntro = document.getElementById("stepIntro");
const productCards = document.querySelectorAll(".product-card");
const productoInput = document.getElementById("productoSeleccionado");

const nombreInput = form.querySelector('[name="nombre"]');
const municipioInput = form.querySelector('[name="municipio"]');

const progress = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const navigation = document.getElementById("navigation");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const thanksScreen = document.getElementById("thanks");

let productoActual = null;
let steps = [];
let currentIndex = 0;

/*=========================================
        VALIDACIÓN DE DATOS PERSONALES
=========================================*/

function datosPersonalesValidos() {
  let valido = true;

  if (!nombreInput.value.trim()) {
    nombreInput.classList.add("invalid");
    valido = false;
  } else {
    nombreInput.classList.remove("invalid");
  }

  if (!municipioInput.value.trim()) {
    municipioInput.classList.add("invalid");
    valido = false;
  } else {
    municipioInput.classList.remove("invalid");
  }

  return valido;
}

/*=========================================
        SELECCIÓN DE PRODUCTO
=========================================*/

productCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!datosPersonalesValidos()) {
      nombreInput.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    productCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    productoActual = card.dataset.product;
    productoInput.value = productoActual;

    iniciarPreguntas(productoActual);
  });
});

function iniciarPreguntas(producto) {
  // Oculta datos personales + selección de producto
  stepIntro.style.display = "none";

  // Oculta todas las secciones de preguntas, muestra la elegida
  document.querySelectorAll(".questions").forEach((sec) => {
    sec.classList.remove("active-product");
  });
  const seccion = document.getElementById(producto);
  seccion.classList.add("active-product");

  // Arma la lista de pasos (preguntas) EN EL ORDEN EN QUE APARECEN EN EL HTML
  steps = Array.from(seccion.querySelectorAll(".question-step"));
  currentIndex = 0;

  progress.classList.add("visible");
  navigation.classList.add("visible");

  mostrarPaso(currentIndex);
}

function volverASeleccion() {
  const seccion = document.getElementById(productoActual);
  if (seccion) seccion.classList.remove("active-product");

  productCards.forEach((c) => c.classList.remove("selected"));
  productoActual = null;
  productoInput.value = "";
  steps = [];
  currentIndex = 0;

  progress.classList.remove("visible");
  navigation.classList.remove("visible");
  stepIntro.style.display = "";

  stepIntro.scrollIntoView({ behavior: "smooth", block: "start" });
}

/*=========================================
        NAVEGACIÓN ENTRE PREGUNTAS
=========================================*/

function mostrarPaso(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active-step", i === index);
  });

  const total = steps.length;
  progressBar.style.width = `${((index + 1) / total) * 100}%`;
  progressText.textContent = `Pregunta ${index + 1} de ${total}`;

  const esUltimo = index === total - 1;
  nextBtn.style.display = esUltimo ? "none" : "inline-block";
  submitBtn.style.display = esUltimo ? "inline-block" : "none";

  ocultarError(steps[index]);
}

function pasoValido(step) {
  const radios = step.querySelectorAll('input[type="radio"]');
  if (radios.length) {
    return Array.from(radios).some((r) => r.checked);
  }

  const starsInput = step.querySelector('.stars input[type="hidden"]');
  if (starsInput) {
    return Number(starsInput.value) > 0;
  }

  // Textarea u otro campo sin respuesta obligatoria
  return true;
}

function mostrarError(step) {
  let msg = step.querySelector(".error-msg");
  if (!msg) {
    msg = document.createElement("p");
    msg.className = "error-msg";
    msg.textContent = "Por favor selecciona una respuesta para continuar.";
    step.appendChild(msg);
  }
  msg.classList.add("visible");
}

function ocultarError(step) {
  const msg = step.querySelector(".error-msg");
  if (msg) msg.classList.remove("visible");
}

prevBtn.addEventListener("click", () => {
  if (currentIndex === 0) {
    volverASeleccion();
    return;
  }
  currentIndex--;
  mostrarPaso(currentIndex);
});

nextBtn.addEventListener("click", () => {
  const step = steps[currentIndex];
  if (!pasoValido(step)) {
    mostrarError(step);
    return;
  }
  currentIndex++;
  mostrarPaso(currentIndex);
});

/*=========================================
        ESTRELLAS
=========================================*/

document.querySelectorAll(".stars").forEach((starsBox) => {
  const icons = Array.from(starsBox.querySelectorAll("i"));
  const hiddenInput = starsBox.querySelector('input[type="hidden"]');

  icons.forEach((icon, i) => {
    icon.addEventListener("click", () => {
      const valor = i + 1;
      hiddenInput.value = valor;

      icons.forEach((ic, idx) => {
        ic.classList.toggle("fa-solid", idx < valor);
        ic.classList.toggle("fa-regular", idx >= valor);
      });

      ocultarError(starsBox.closest(".question-step"));
    });
  });
});

/*=========================================
        ENVÍO DEL FORMULARIO
=========================================*/

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const step = steps[currentIndex];
  if (!pasoValido(step)) {
    mostrarError(step);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  try {
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString("es-NI", {
      timeZone: "America/Managua",
      dateStyle: "short",
      timeStyle: "medium"
    });

    const datosPersonales = [
      { campo: "Nombre", valor: nombreInput.value.trim() },
      { campo: "Edad", valor: form.querySelector('[name="edad"]').value.trim() || "No especificado" },
      { campo: "Sexo", valor: form.querySelector('[name="sexo"]').value || "No especificado" },
      { campo: "Municipio", valor: municipioInput.value.trim() }
    ];

    const respuestas = steps.map((paso, i) => {
      const pregunta = paso.querySelector("p").textContent.trim();
      let respuesta = "";

      const radioChecked = paso.querySelector('input[type="radio"]:checked');
      const starsInput = paso.querySelector('.stars input[type="hidden"]');
      const textarea = paso.querySelector("textarea");

      if (radioChecked) {
        respuesta = radioChecked.value;
      } else if (starsInput) {
        respuesta = `${starsInput.value} de 5 estrellas`;
      } else if (textarea) {
        respuesta = textarea.value.trim() || "Sin comentarios";
      }

      return { numero: i + 1, pregunta, respuesta };
    });

    const registro = {
      fechaHora,
      timestamp: serverTimestamp(),
      producto: NOMBRE_PRODUCTO[productoActual] || productoActual,
      datosPersonales,
      respuestas
    };

    const nuevaRef = push(ref(db, "respuestas_encuesta"));
    await set(nuevaRef, registro);

    form.style.display = "none";
    progress.classList.remove("visible");
    navigation.classList.remove("visible");
    thanksScreen.classList.add("visible");
    thanksScreen.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("Error al guardar la encuesta:", error);
    alert("Hubo un problema al enviar tu encuesta. Por favor intenta de nuevo.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Encuesta";
  }
});