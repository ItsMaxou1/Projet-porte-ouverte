// Variables globales
let playerName = "";
let startTime = null;
let timerInterval = null;

// Sélecteurs DOM
const playerSetup = document.getElementById("player-setup");
const gameArea = document.getElementById("game-area");
const scoreboard = document.getElementById("scoreboard");
const playerNameInput = document.getElementById("player-name");
const startGameButton = document.getElementById("start-game");
const randomPhraseElement = document.getElementById("random-phrase");
const userInput = document.getElementById("user-input");
const timerElement = document.getElementById("time");
const submitGameButton = document.getElementById("submit-game");
const scoresList = document.getElementById("scores-list");
const restartGameButton = document.getElementById("restart-game");

// Démarrer le jeu
startGameButton.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Veuillez entrer votre nom.");
    return;
  }

  playerSetup.classList.add("hidden");
  gameArea.classList.remove("hidden");
  fetchRandomPhrase();
  startTimer();
});

// Gestion de l'entrée utilisateur
userInput.addEventListener("input", () => {
  const userText = userInput.value;
  const originalText = randomPhraseElement.textContent;

  // Crée une chaîne avec les caractères colorés selon leur exactitude
  let updatedPhrase = "";

  for (let i = 0; i < originalText.length; i++) {
    if (i < userText.length) {
      // Si le caractère tapé est correct
      if (originalText[i] === userText[i]) {
        updatedPhrase += `<span class="correct">${originalText[i]}</span>`;
      } else {
        // Si le caractère tapé est incorrect
        updatedPhrase += `<span class="error">${originalText[i]}</span>`;
      }
    } else {
      // Si l'utilisateur n'a pas encore tapé ce caractère
      updatedPhrase += `<span>${originalText[i]}</span>`;
    }
  }

  // Met à jour l'affichage de la phrase avec les couleurs
  randomPhraseElement.innerHTML = updatedPhrase;

  // Vérifie si la phrase est terminée correctement
  if (userText === originalText) {
    finishGame();
  }
});

// Fonction pour terminer automatiquement le jeu
function finishGame() {
  const userText = userInput.value.trim();
  const originalText = randomPhraseElement.textContent.trim();

  if (userText === originalText) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    const wpm = calculateWPM(userText, elapsedTime);
    const errors = countErrors(userText, originalText);

    stopTimer();
    saveScore(playerName, elapsedTime, wpm, errors);
    showScores();
  }
}

// Recommencer le jeu
restartGameButton.addEventListener("click", () => {
  // Réinitialisation des variables
  playerName = "";
  startTime = null; // Réinitialise le temps
  playerNameInput.value = "";
  userInput.value = "";
  scoresList.innerHTML = "";
  timerElement.textContent = "0"; // Remet le timer à zéro

  // Cache les sections
  scoreboard.classList.add("hidden");
  playerSetup.classList.remove("hidden");
  gameArea.classList.add("hidden");
});

// Fonction pour démarrer le chronomètre
function startTimer() {
  startTime = Date.now(); // Enregistre l'heure de début
  timerInterval = setInterval(() => {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    timerElement.textContent = elapsedTime; // Affiche le temps écoulé
  }, 1000);
}

// Fonction pour arrêter le chronomètre
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// Fonction pour récupérer une phrase aléatoire depuis l'API
async function fetchRandomPhrase() {
  try {
    const response = await fetch("citations-fr.json");
    const data = await response.json();
    const randomQuote = data[Math.floor(Math.random() * data.length)].quote;
    randomPhraseElement.textContent = randomQuote;
  } catch (error) {
    console.error("Erreur lors de la récupération de la phrase :", error);
    randomPhraseElement.textContent =
      "Erreur : impossible de récupérer une phrase.";
  }
}

// Fonction pour calculer les mots par minute (WPM)
function calculateWPM(text, timeInSeconds) {
  const words = text.split(" ").length;
  const minutes = timeInSeconds / 60;
  return Math.round(words / minutes);
}

// Fonction pour compter les erreurs
function countErrors(userText, originalText) {
  let errors = 0;
  for (let i = 0; i < Math.min(userText.length, originalText.length); i++) {
    if (userText[i] !== originalText[i]) {
      errors++;
    }
  }
  return errors;
}

// Fonction pour sauvegarder un score
function saveScore(name, time, wpm, errors) {
  const score = { name, time, wpm, errors };
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push(score);
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem("scores", JSON.stringify(scores));
}

// Fonction pour afficher les scores
function showScores() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scoresList.innerHTML = scores
    .map(
      (score) => `<li>${score.name} - ${score.time}s - ${score.wpm} WPM</li>`
    )
    .join("");

  gameArea.classList.add("hidden");
  scoreboard.classList.remove("hidden");
}
