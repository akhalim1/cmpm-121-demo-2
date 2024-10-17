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
canvas.style.cursor = "none";
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

const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "THIN";
thinMarkerButton.id = "thin-tool";
app.append(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "THICK";
thickMarkerButton.id = "thick-tool";
app.append(thickMarkerButton);

const context = canvas.getContext("2d");
let drawing: boolean = false;
let toolPreviewCommand: ToolPreviewCommand | null = null;

let currentThickness: number = 1;
let currentStrokeColor: string = "black";

const updateSelectedTool = (selectedButton: HTMLButtonElement) => {
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");
  selectedButton.classList.add("selectedTool");
};

updateSelectedTool(thinMarkerButton);

thinMarkerButton.addEventListener("click", () => {
  currentThickness = 1;
  updateSelectedTool(thinMarkerButton);
});

thickMarkerButton.addEventListener("click", () => {
  currentThickness = 10;
  updateSelectedTool(thickMarkerButton);
});

class MarkerLine {
  points: { x: number; y: number }[];
  thickness: number;
  color: string;

  constructor(
    initialPoint: { x: number; y: number },
    thickness: number,
    color: string
  ) {
    this.points = [initialPoint];
    this.thickness = thickness;
    this.color = color;
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

      ctx.lineWidth = this.thickness;
      ctx.strokeStyle = this.color;
      ctx.stroke();
      ctx.closePath();
    }
  }
}

class ToolPreviewCommand {
  x: number;
  y: number;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      stroke.display(ctx);
    });

    if (currentStroke) {
      currentStroke.display(ctx);
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}

let strokes: MarkerLine[] = [];
let currentStroke: MarkerLine | null = null;
let redoStack: MarkerLine[] = [];

canvas.addEventListener("mousedown", (event) => {
  drawing = true;
  toolPreviewCommand = null;

  currentStroke = new MarkerLine(
    { x: event.offsetX, y: event.offsetY },
    currentThickness,
    currentStrokeColor
  );
});

canvas.addEventListener("mousemove", (event) => {
  if (!drawing) {
    if (toolPreviewCommand) {
      toolPreviewCommand.updatePosition(event.offsetX, event.offsetY);
    } else {
      toolPreviewCommand = new ToolPreviewCommand(
        event.offsetX,
        event.offsetY,
        currentThickness
      );
    }

    const toolMovedEvent = new Event("tool-moved");
    canvas.dispatchEvent(toolMovedEvent);
  }

  if (drawing && currentStroke) {
    currentStroke.drag(event.offsetX, event.offsetY);
    const drawingChangedEvent = new Event("drawing-changed");
    canvas.dispatchEvent(drawingChangedEvent);
  }
});

window.addEventListener("mouseup", () => {
  if (drawing && currentStroke) {
    drawing = false;
    strokes.push(currentStroke);
    currentStroke = null;
    redoStack = [];
  }
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

canvas.addEventListener("tool-moved", () => {
  if (!drawing && toolPreviewCommand) {
    toolPreviewCommand.draw(context!);
  }
});

canvas.addEventListener("drawing-changed", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);

  // Redraw all strokes
  strokes.forEach((stroke) => {
    stroke.display(context!);
  });

  // Redraw current stroke
  if (currentStroke) {
    currentStroke.display(context!);
  }

  // draw the tool preview cursor
  if (toolPreviewCommand && !drawing) {
    toolPreviewCommand.draw(context!);
  }
});
