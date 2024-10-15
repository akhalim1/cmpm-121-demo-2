import "./style.css";

const APP_NAME = "My Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "sketchpad";
app.appendChild(canvas);

const clearButton = document.createElement("button");
clearButton.textContent = "CLEAR";
app.appendChild(clearButton);

const context = canvas.getContext("2d");
let drawing: boolean = false;

canvas.addEventListener("mousedown", (event) => {
  drawing = true;
  context?.beginPath();
  context?.moveTo(event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  if (!drawing) return;

  context?.lineTo(event.offsetX, event.offsetY);
  context?.stroke();
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  context?.closePath();
});

canvas.addEventListener("mouseout", () => {
  drawing = false;
});

clearButton.addEventListener("click", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);
});
