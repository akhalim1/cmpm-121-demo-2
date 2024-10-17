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

/*
type Point = {
  x: number;
  y: number;
};
*/
class MarkerLine {
  points: { x: number; y: number }[];

  constructor(initialPoint: { x: number; y: number }) {
    this.points = [initialPoint];
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }

      ctx.stroke();
      ctx.closePath();
    }
  }
}

let strokes: MarkerLine[] = [];
let currentStroke: MarkerLine | null = null;
let redoStack: MarkerLine[] = [];

canvas.addEventListener("mousedown", (event) => {
  drawing = true;

  currentStroke = new MarkerLine({ x: event.offsetX, y: event.offsetY });
  //context?.beginPath();
  //context?.moveTo(event.offsetX, event.offsetY);
});

canvas.addEventListener("mousemove", (event) => {
  if (!drawing || !currentStroke) return;

  currentStroke.drag(event.offsetX, event.offsetY);
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
  //context?.lineTo(event.offsetX, event.offsetY);
  //context?.stroke();
});

window.addEventListener("mouseup", () => {
  if (drawing && currentStroke) {
    drawing = false;
    strokes.push(currentStroke);
    currentStroke = null;
    redoStack = [];
  }
  //context?.closePath();
});

clearButton.addEventListener("click", () => {
  strokes = [];
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

  // redraw all strokes
  strokes.forEach((stroke) => {
    stroke.display(context!);
  });

  // redraw current
  if (currentStroke) {
    currentStroke.display(context!);
  }
});
