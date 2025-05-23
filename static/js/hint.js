const helpToggle = document.getElementById("help-toggle");
const hintDropdown = document.getElementById("hintDropdown");
const getHintButton = document.getElementById("getHintButton");
const fillLetterButton = document.getElementById("fillLetterButton");
const helpIconContainer = document.getElementById("lottie-help-icon");
const defaultFrame = 120;

let currentHint = 0;
let incorrectGuesses = 0;
let displayedHints = [];
let helpAnimation = null;

getHintButton.disabled = true;
fillLetterButton.disabled = true;

function registerGuess(isCorrect) {
  if (!isCorrect) {
    incorrectGuesses++;
    updateHintButtonState();
  }
}

function updateHintButtonState() {
  if (incorrectGuesses < 2) {
    getHintButton.disabled = true;
    fillLetterButton.disabled = true;
  } else {
    getHintButton.disabled = false;
    fillLetterButton.disabled = false;
  }
}

function showHintModal(content) {
  if (!content) {
    console.warn("hint.js: showHintModal called with empty content!");
  }

  displayedHints.push(content);

  const box = document.createElement("div");
  box.className = "hint-box";
  let hintList = displayedHints.map((hint) => `<p>${hint}</p>`).join("");
  box.innerHTML = `
    <div class="hint-content">
        ${hintList}
        <div class="modal-button-wrapper">
          <button id="closeHintButton">OK</button>
        </div>
    </div>
  `;
  document.body.appendChild(box);

  const closeButton = document.getElementById("closeHintButton");
  closeButton.addEventListener("click", closeHintModal);
}

function closeHintModal() {
  const box = document.querySelector(".hint-box");
  if (box) {
    box.remove();
  }
}

function loadHelpAnimation() {
  helpAnimation = lottie.loadAnimation({
    container: helpIconContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "/static/animations/help.json",
    initialSegment: [defaultFrame, defaultFrame],
  });
}

loadHelpAnimation();

helpToggle.addEventListener("mouseenter", () => {
  if (helpAnimation) {
    helpAnimation.playSegments([1, 120], true);
  }
});

helpToggle.addEventListener("mouseleave", () => {
  if (helpAnimation) {
    helpAnimation.goToAndStop(defaultFrame, true);
  }
});

getHintButton.addEventListener("click", () => {
  if (currentHint < window.gameHints.length && currentHint < incorrectGuesses) {
    showHintModal(window.gameHints[currentHint]);
    currentHint++;
    updateHintButtonState();
    if (currentHint >= window.gameHints.length) {
      getHintButton.disabled = true;
      getHintButton.textContent = "No more hints";
    }
  }
  hintDropdown.classList.remove("show");
});

fillLetterButton.addEventListener("click", () => {
  fillRandomLetter();
  fillLetterButton.disabled = true;
  getHintButton.disabled = true;
  hintDropdown.classList.remove("show");
});

helpToggle.addEventListener("click", () => {
  hintDropdown.classList.toggle("show");
});

window.addEventListener("click", (event) => {
  if (
    !event.target.matches(".dropbtn") &&
    !event.target.matches("#getHintButton") &&
    !event.target.matches("#fillLetterButton")
  ) {
    if (hintDropdown.classList.contains("show")) {
      hintDropdown.classList.remove("show");
    }
  }
});

updateHintButtonState();

function fillRandomLetter() {
  const currentInputs = Array.from(
    document.querySelectorAll("#input-container .guess-row:last-child input")
  );

  const allPreviousRows = Array.from(
    document.querySelectorAll("#input-container .guess-row.past-guess")
  );

  const correctPositions = new Set();

  allPreviousRows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    inputs.forEach((input, index) => {
      if (input.classList.contains("green")) {
        correctPositions.add(index);
      }
    });
  });

  const letterPositions = [...targetWord]
    .map((char, index) => (/[a-z]/i.test(char) ? index : -1))
    .filter((index) => index !== -1);

  const eligibleIndexes = currentInputs
    .map((input, index) =>
      input.value === "" && !correctPositions.has(index) ? index : -1
    )
    .filter((index) => index !== -1);

  if (eligibleIndexes.length === 0) {
    alert("No empty letters to fill!");
    return;
  }

  const randomIndex =
    eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];
  const targetIndex = letterPositions[randomIndex];

  if (targetIndex === undefined) {
    alert("Could not determine correct letter position.");
    return;
  }

  const correctLetter = targetWord[targetIndex]?.toUpperCase();

  if (/[A-Z]/.test(correctLetter)) {
    currentInputs[randomIndex].value = correctLetter;
  } else {
    alert("Target character is not a valid letter.");
  }
}
