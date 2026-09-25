import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8gaY4tGtyx6GH-ckDyMsHr1VhZNmNbUI",
  authDomain: "g-essence.firebaseapp.com",
  databaseURL: "https://g-essence-default-rtdb.firebaseio.com",
  projectId: "g-essence",
  storageBucket: "g-essence.firebasestorage.app",
  messagingSenderId: "276406340606",
  appId: "1:276406340606:web:5b732583ad1420aa7d4eaf"
};

const products = [
  { key: "te", label: "Té", starQuestion: 3 },
  { key: "postres", label: "Postres", starQuestion: 3 },
  { key: "chocolate", label: "Chocolate", starQuestion: 4 },
  { key: "jabones", label: "Jabones", starQuestion: 2 }
];
const textQuestions = new Set(["te8", "postres8", "chocolate3", "chocolate8", "jabones8"]);
const starQuestions = new Set(["te3", "postres3", "chocolate4", "jabones2", "jabones6"]);
const numberFormatter = new Intl.NumberFormat("es-NI");

const elements = {
  loading: document.getElementById("loadingState"),
  error: document.getElementById("errorState"),
  empty: document.getElementById("emptyState"),
  content: document.getElementById("statisticsContent"),
  connection: document.getElementById("connectionState"),
  totalSurveys: document.getElementById("totalSurveys"),
  totalPeople: document.getElementById("totalPeople"),
  totalAnswers: document.getElementById("totalAnswers"),
  ranking: document.getElementById("ranking"),
  details: document.getElementById("productDetails"),
  updated: document.getElementById("lastUpdated")
};

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function validAnswer(value) {
  const answer = String(value ?? "").trim();
  return answer !== "" && !["sin responder", "sin comentarios", "undefined", "null", "nan"].includes(answer.toLowerCase());
}

function getQuestions(record, productKey) {
  const source = record?.preguntas || record?.respuestas || {};
  const productQuestions = source[productKey];
  if (Array.isArray(productQuestions)) return productQuestions;
  if (!productQuestions || typeof productQuestions !== "object") return [];
  return Object.entries(productQuestions).map(([key, value], index) => ({
    numero: Number(String(key).replace(/\D/g, "")) || index + 1,
    pregunta: value?.pregunta || key,
    respuesta: value?.respuesta ?? value
  }));
}

function getAnswer(question) {
  if (question && typeof question === "object") return String(question.respuesta ?? "").trim();
  return String(question ?? "").trim();
}

function getQuestionKey(productKey, number) {
  return `${productKey}${number}`;
}

function getPersonalName(record) {
  if (Array.isArray(record?.datosPersonales)) {
    const name = record.datosPersonales.find(item => String(item?.campo).toLowerCase() === "nombre");
    return name?.valor;
  }
  return record?.datosPersonales?.nombre || record?.nombre;
}

function parseStar(value) {
  const match = String(value).match(/[1-5](?=\s*(?:de\s*5)?)/i);
  return match ? Number(match[0]) : null;
}

function normalizeRecords(snapshotValue) {
  if (!snapshotValue || typeof snapshotValue !== "object") return [];
  return Object.values(snapshotValue).filter(record => record && typeof record === "object");
}

function collectStats(records) {
  const stats = products.map(product => ({ ...product, ratings: [], questions: new Map() }));
  let totalAnswers = 0;

  records.forEach(record => {
    stats.forEach(product => {
      getQuestions(record, product.key).forEach((question, index) => {
        const number = Number(question?.numero) || index + 1;
        const answer = getAnswer(question);
        if (!validAnswer(answer)) return;
        totalAnswers += 1;
        const key = getQuestionKey(product.key, number);
        const item = product.questions.get(key) || { number, question: question?.pregunta || `Pregunta ${number}`, answers: [] };
        item.answers.push(answer);
        product.questions.set(key, item);
        if (number === product.starQuestion) {
          const rating = parseStar(answer);
          if (rating) product.ratings.push(rating);
        }
      });
    });
  });

  stats.forEach(product => {
    product.count = product.ratings.length;
    product.average = product.count ? product.ratings.reduce((sum, rating) => sum + rating, 0) / product.count : 0;
  });
  return { stats, totalAnswers };
}

function renderSummary(records, totalAnswers) {
  elements.totalSurveys.textContent = numberFormatter.format(records.length);
  elements.totalPeople.textContent = numberFormatter.format(records.filter(record => validAnswer(getPersonalName(record))).length);
  elements.totalAnswers.textContent = numberFormatter.format(totalAnswers);
}

function renderRanking(stats) {
  const maxAverage = Math.max(...stats.map(product => product.average), 0);
  const ranked = [...stats].sort((first, second) => second.average - first.average);
  elements.ranking.innerHTML = ranked.map((product, index) => {
    const percentage = maxAverage > 0 ? (product.average / maxAverage) * 100 : 0;
    return `<article class="ranking-row"><span class="rank-number">#${index + 1}</span><span class="rank-product">${safeText(product.label)}</span><span class="bar-track" aria-label="${percentage.toFixed(0)}% del máximo"><span class="bar-fill" style="width:${percentage.toFixed(2)}%"></span></span><span class="rank-score">${product.count ? product.average.toFixed(2) : "Sin datos"}</span><span class="rank-count">${numberFormatter.format(product.count)} calificaciones</span></article>`;
  }).join("");
}

function renderQuestion(item, productKey) {
  const key = getQuestionKey(productKey, item.number);
  const total = item.answers.length;
  if (starQuestions.has(key)) {
    const average = item.answers.map(parseStar).filter(Boolean);
    const mean = average.length ? average.reduce((sum, value) => sum + value, 0) / average.length : 0;
    return `<div class="question-block"><p class="question-text">${safeText(item.question)}</p><div class="response-meta"><span>Estrellas válidas: ${average.length}</span><strong>${mean ? mean.toFixed(2) : "Sin datos"} / 5</strong></div></div>`;
  }
  if (textQuestions.has(key)) {
    const suggestions = item.answers.slice(-5).map(answer => `<li>${safeText(answer)}</li>`).join("");
    return `<div class="question-block"><p class="question-text">${safeText(item.question)}</p><div class="response-meta"><span>Respuestas válidas</span><strong>${total}</strong></div><ul class="response-values">${suggestions}</ul></div>`;
  }
  const counts = item.answers.reduce((map, answer) => map.set(answer, (map.get(answer) || 0) + 1), new Map());
  const options = [...counts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 6).map(([answer, count]) => `<li>${safeText(answer)}: ${count} (${((count / total) * 100).toFixed(1)}%)</li>`).join("");
  return `<div class="question-block"><p class="question-text">${safeText(item.question)}</p><div class="response-meta"><span>Respuestas válidas</span><strong>${total}</strong></div><ul class="response-values">${options}</ul></div>`;
}

function renderDetails(stats) {
  elements.details.innerHTML = stats.map(product => {
    const questions = [...product.questions.values()].sort((first, second) => first.number - second.number);
    return `<article class="detail-card"><h3>${safeText(product.label)}</h3>${questions.length ? questions.map(item => renderQuestion(item, product.key)).join("") : '<p class="empty-note">Todavía no hay respuestas para este producto.</p>'}</article>`;
  }).join("");
}

function render(records) {
  const { stats, totalAnswers } = collectStats(records);
  elements.loading.hidden = true;
  elements.error.hidden = true;
  elements.empty.hidden = records.length > 0;
  elements.content.hidden = records.length === 0;
  if (!records.length) return;
  renderSummary(records, totalAnswers);
  renderRanking(stats);
  renderDetails(stats);
  elements.updated.textContent = `Actualizado ${new Date().toLocaleTimeString("es-NI")}`;
}

function setConnectionState(online, message) {
  elements.connection.classList.toggle("loading", !online);
  elements.connection.innerHTML = `<span class="status-dot"></span> ${message}`;
}

try {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  onValue(ref(database, "encuestas"), snapshot => {
    setConnectionState(true, "Datos en vivo");
    render(normalizeRecords(snapshot.val()));
  }, error => {
    elements.loading.hidden = true;
    elements.content.hidden = true;
    elements.empty.hidden = true;
    elements.error.hidden = false;
    setConnectionState(false, "Sin conexión");
    console.error("[statistics] Error de Firebase:", error);
  });
} catch (error) {
  elements.loading.hidden = true;
  elements.error.hidden = false;
  setConnectionState(false, "Error de conexión");
  console.error("[statistics] Error al iniciar Firebase:", error);
}
