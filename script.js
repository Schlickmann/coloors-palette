// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");

let initialColors;

const savedPalettes = [];

// Event Listeners
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

generateButton.addEventListener("click", randomColors);

lockButton.forEach((button, index) => {
  button.addEventListener("click", (event) => {
    lockLayer(event, index);
  });
});

// Functions

// Color generator
function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const icons = div.querySelectorAll(".controls button");
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(randomColor.hex());
    }

    // Add color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Checking contrast
    checkTextContrast(randomColor, hexText);

    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

    // Add color to sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  // reset inputs
  resetInputs();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = "#333";
  } else {
    text.style.color = "#f5f5f5";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  // scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["#000", midBright, "#fff"]);

  // Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75,75), rgb(204,204,75), rgb(75,204,75), rgb(75, 204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

function hslControls(event) {
  const index =
    event.target.getAttribute("data-brightness") ||
    event.target.getAttribute("data-hue") ||
    event.target.getAttribute("data-saturation");

  let sliders = event.target.parentElement.querySelectorAll(
    'input[type="range"]'
  );

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // colorize sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];

  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  // checking contrast
  checkTextContrast(color, textHex);

  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];

      slider.value = Math.floor(hueValue);
    }

    if (slider.name === "saturation") {
      const saturationColor =
        initialColors[slider.getAttribute("data-saturation")];
      const saturationValue = chroma(saturationColor).hsl()[1];

      slider.value = Math.floor(saturationValue * 100) / 100;
    }

    if (slider.name === "brightness") {
      const brightnessColor =
        initialColors[slider.getAttribute("data-brightness")];
      const brightnessValue = chroma(brightnessColor).hsl()[2];

      slider.value = Math.floor(brightnessValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);

  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // show popup
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockLayer(event, index) {
  const lockSVG = event.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    event.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    event.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// Save palette to library and local storage
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const saveButton = document.querySelector(".save");
const submitSaveButton = document.querySelector(".submit-save");
const closeSaveButton = document.querySelector(".close-save");

// Event Listeners
saveButton.addEventListener("click", openPalette);

// Functions
function openPalette(event) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

randomColors();
