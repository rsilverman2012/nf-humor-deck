(() => {
  const image = document.getElementById("card-image");
  const status = document.getElementById("status");
  const counter = document.getElementById("counter");

  const previousButton = document.getElementById("previous-button");
  const drawButton = document.getElementById("draw-button");
  const nextButton = document.getElementById("next-button");

  let cards = [];
  let currentIndex = 0;
  let changeTimer;

  function setControlsDisabled(disabled) {
    previousButton.disabled = disabled;
    drawButton.disabled = disabled;
    nextButton.disabled = disabled;
  }

  function updateCounter() {
    counter.textContent = cards.length
      ? `${currentIndex + 1} of ${cards.length}`
      : "";
  }

  function getAltText(card) {
    if (card.alt && card.alt.trim()) {
      return card.alt.trim();
    }

    return `Humor card ${currentIndex + 1} of ${cards.length} from The Neurodivergent Fundraiser`;
  }

  function showCard(index, animate = true) {
    if (!cards.length) {
      return;
    }

    currentIndex = (index + cards.length) % cards.length;
    const card = cards[currentIndex];

    window.clearTimeout(changeTimer);

    const loadCard = () => {
      image.src = card.src;
      image.alt = getAltText(card);
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (animate && !reducedMotion) {
      image.classList.add("is-changing");
      changeTimer = window.setTimeout(loadCard, 160);
    } else {
      loadCard();
    }

    updateCounter();
  }

  function drawRandomCard() {
    if (cards.length < 2) {
      return;
    }

    let randomIndex = currentIndex;

    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * cards.length);
    }

    showCard(randomIndex);
  }

  image.addEventListener("load", () => {
    image.hidden = false;
    status.hidden = true;

    window.requestAnimationFrame(() => {
      image.classList.remove("is-changing");
    });
  });

  image.addEventListener("error", () => {
    image.hidden = true;
    status.hidden = false;
    status.textContent = "This card could not be loaded.";
  });

  previousButton.addEventListener("click", () => {
    showCard(currentIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showCard(currentIndex + 1);
  });

  drawButton.addEventListener("click", drawRandomCard);

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      showCard(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showCard(currentIndex + 1);
    }
  });

  async function initializeDeck() {
    setControlsDisabled(true);

    try {
      const response = await fetch(
        `cards.json?v=${Date.now()}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const cardData = await response.json();

      cards = cardData.filter(card => {
        return card && typeof card.src === "string";
      });

      if (!cards.length) {
        status.textContent = "No humor cards have been added yet.";
        return;
      }

      showCard(0, false);
      setControlsDisabled(cards.length < 2);
    } catch (error) {
      console.error(error);

      status.textContent =
        "The humor deck could not be loaded. Please try again shortly.";
    }
  }

  initializeDeck();
})();
