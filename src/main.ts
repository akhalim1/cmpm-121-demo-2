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

let stickers: string[] = ["🐸", "🦁", "🦓", "🐶", "🐱", "😎"];

// constants
const THIN_MARKER_SIZE = 3;
const THICK_MARKER_SIZE = 15;
const EMOJI_SIZE = "64px serif";

const stickerContainer = document.createElement("div");
app.appendChild(stickerContainer);

const renderStickers = () => {
  stickerContainer.innerHTML = "";
  stickers.forEach((sticker) => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = sticker;
    stickerContainer.appendChild(stickerButton);

    stickerButton.addEventListener("click", () => {
      toolPreviewCommand = new StickerPreviewCommand(sticker, 0, 0);
      canvas.dispatchEvent(new Event("tool-moved"));

      updateSelectedTool(stickerButton);
    });
  });
};

renderStickers();

// buttons
const exportButton = document.createElement("button");
exportButton.textContent = "EXPORT";
app.appendChild(exportButton);

const customStickerButton = document.createElement("button");
customStickerButton.textContent = "CREATE CUSTOM STICKER";
app.appendChild(customStickerButton);

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
let drawing = false;
let toolPreviewCommand: ToolPreviewCommand | StickerPreviewCommand | null =
  null;

let currentStroke: MarkerLine | null = null;

let currentThickness = THIN_MARKER_SIZE;
let currentStrokeColor = "black";

let actions: (MarkerLine | StickerCommand)[] = [];
let redoStack: (MarkerLine | StickerCommand)[] = [];

const updateSelectedTool = (selectedButton: HTMLButtonElement) => {
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");

  const allStickerButtons = stickerContainer.querySelectorAll("button");
  allStickerButtons.forEach((button) => {
    button.classList.remove("selectedTool");
  });
  selectedButton.classList.add("selectedTool");
};

thinMarkerButton.addEventListener("click", () => {
  currentThickness = THIN_MARKER_SIZE;
  updateSelectedTool(thinMarkerButton);
  toolPreviewCommand = new ToolPreviewCommand(0, 0, currentThickness);
  canvas.dispatchEvent(new Event("tool-moved"));
});

thickMarkerButton.addEventListener("click", () => {
  currentThickness = THICK_MARKER_SIZE;
  updateSelectedTool(thickMarkerButton);
  toolPreviewCommand = new ToolPreviewCommand(0, 0, currentThickness);
  canvas.dispatchEvent(new Event("tool-moved"));
});

// Commands
class MarkerLine {
  points: { x: number; y: number }[] = [];
  thickness: number;
  color: string;

  constructor(
    initialPoint: { x: number; y: number },
    thickness: number,
    color: string
  ) {
    this.points.push(initialPoint);
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

interface PreviewCommand {
  updatePosition(x: number, y: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

class ToolPreviewCommand implements PreviewCommand {
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
    actions.forEach((action) => action.display(ctx));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
}

class StickerPreviewCommand implements PreviewCommand {
  sticker: string;
  x: number;
  y: number;

  constructor(sticker: string, x: number, y: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actions.forEach((action) => action.display(ctx));
    ctx.font = EMOJI_SIZE;
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

class StickerCommand {
  sticker: string;
  x: number;
  y: number;

  constructor(sticker: string, x: number, y: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = EMOJI_SIZE;
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

// handlers
exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  const exportContext = exportCanvas.getContext("2d");

  if (exportContext) {
    exportContext?.scale(4, 4);

    actions.forEach((action) => action.display(exportContext));

    // download img
    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
  } else {
    console.log("Failed to get 2D rendering context");
  }
});

customStickerButton.addEventListener("click", () => {
  const newSticker = prompt("Enter custom sticker: ", "🧽");

  if (newSticker) {
    stickers.push(newSticker);
    renderStickers();
  }
});

canvas.addEventListener("mousedown", (event) => {
  if (toolPreviewCommand instanceof StickerPreviewCommand) {
    const stickerCommand = new StickerCommand(
      toolPreviewCommand.sticker,
      event.offsetX,
      event.offsetY
    );

    actions.push(stickerCommand);

    redoStack = [];
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    drawing = true;

    currentStroke = new MarkerLine(
      { x: event.offsetX, y: event.offsetY },
      currentThickness,
      currentStrokeColor
    );
    actions.push(currentStroke);
  }
});

canvas.addEventListener("mousemove", (event) => {
  //console.log(toolPreviewCommand);
  if (!drawing) {
    if (toolPreviewCommand) {
      toolPreviewCommand.updatePosition(event.offsetX, event.offsetY);
    }

    canvas.dispatchEvent(new Event("tool-moved"));
  }

  if (drawing && currentStroke) {
    currentStroke.drag(event.offsetX, event.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

window.addEventListener("mouseup", () => {
  if (drawing && currentStroke) {
    drawing = false;
    currentStroke = null;
    redoStack = [];
  }
});

// buttons
clearButton.addEventListener("click", () => {
  actions = [];
  redoStack = [];
  context?.clearRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener("click", () => {
  if (actions.length > 0) {
    const lastAction = actions.pop();
    if (lastAction) redoStack.push(lastAction);

    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const redoAction = redoStack.pop();
    if (redoAction) actions.push(redoAction);

    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("tool-moved", () => {
  if (!drawing && toolPreviewCommand) {
    toolPreviewCommand.draw(context!);
  }
});

canvas.addEventListener("drawing-changed", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);

  actions.forEach((action) => action.display(context!));
  if (toolPreviewCommand && !drawing) {
    toolPreviewCommand.draw(context!);
  }
});
