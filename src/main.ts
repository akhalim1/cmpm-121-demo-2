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

type Point = {
  x: number;
  y: number;
};

let strokes: Point[][] = [];
let currentStroke: Point[] = [];

canvas.addEventListener("mousedown", (event) => {
  drawing = true;

  currentStroke = [
    {
      x: event.offsetX,
      y: event.offsetY,
    },
  ];
  //context?.beginPath();
  //context?.moveTo(event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  if (!drawing) return;

  currentStroke.push({ x: event.offsetX, y: event.offsetY });
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
  //context?.lineTo(event.offsetX, event.offsetY);
  //context?.stroke();
});

canvas.addEventListener("mouseup", () => {
  if (drawing) {
    drawing = false;
    strokes.push(currentStroke);
  }
  //context?.closePath();
});

canvas.addEventListener("mouseout", () => {
  drawing = false;
});

clearButton.addEventListener("click", () => {
  strokes = [];
  currentStroke = [];

  context?.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("drawing-changed", () => {
  // draw all strokes
  strokes.forEach((stroke) => {
    if (stroke.length > 0) {
      context?.beginPath();
      context?.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        context?.lineTo(stroke[i].x, stroke[i].y);
      }

      context?.stroke();
      context?.closePath();
    }
  });

  // draw current stroke
  if (currentStroke.length > 0) {
    context?.beginPath();
    context?.moveTo(currentStroke[0].x, currentStroke[0].y);

    for (let i = 1; i < currentStroke.length; i++) {
      context?.lineTo(currentStroke[i].x, currentStroke[i].y);
    }

    context?.stroke();
    context?.closePath();
  }
});
