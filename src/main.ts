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

const undoButton = document.createElement("button");
undoButton.textContent = "UNDO";
app.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "REDO";
app.appendChild(redoButton);

const context = canvas.getContext("2d");
let drawing: boolean = false;

type Point = {
  x: number;
  y: number;
};

let strokes: Point[][] = [];
let currentStroke: Point[] = [];

let redoStack: Point[][] = [];

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
    currentStroke = [];
    redoStack = [];
  }
  //context?.closePath();
});

canvas.addEventListener("mouseout", () => {
  drawing = false;
});

clearButton.addEventListener("click", () => {
  strokes = [];
  currentStroke = [];
  redoStack = [];
  context?.clearRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener("click", () => {
  if (strokes.length > 0) {
    const lastStroke = strokes.pop();

    if (lastStroke) {
      redoStack.push(lastStroke);
    }

    const drawingChangedEvent = new Event("drawing-changed");
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoStroke = redoStack.pop();
    if (redoStroke) {
      strokes.push(redoStroke);
    }

    const drawingChangedEvent = new Event("drawing-changed");
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

canvas.addEventListener("drawing-changed", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);

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
