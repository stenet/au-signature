import { autoinject } from "aurelia-framework";

@autoinject
export class Signature {
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _onMouseDown: MouseEvent;
  private _onMouseUp: MouseEvent;
  private _onMouseMove: MouseEvent;

  private _data: IData;

  constructor(
    private _element: Element
  ) {
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
  }

  attached() {
    this.createCanvas();
  }
  detached() {
    this._element.removeChild(this._canvas);
  }

  clear() {
    this._element.removeChild(this._canvas);
    this.createCanvas();
  }
  getDataUrl() {
    return this._canvas.toDataURL("image/png");
  }

  resize() {
    this._canvas.width = this._element.clientWidth;
    this._canvas.height = this._element.clientHeight;
  }

  private createCanvas() {
    this._canvas = document.createElement("canvas");
    this._element.appendChild(this._canvas);

    this._context = this._canvas.getContext("2d");

    this.resetData();
    this.resize();
    this.initializeCanvas();
    this.registerEvents();
  }
  private resetData() {
    this._data = {
      empty: false,
      disableSave: true,
      pixels: [],
      cpixels: [],
      xyLast: {
        x: null,
        y: null
      },
      xyAddLast: {
        x: null,
        y: null
      },
      calculate: false
    }
  }
  private initializeCanvas() {
    this._context.fillStyle = "#fff";
    this._context.strokeStyle = "#444";
    this._context.lineWidth = 1.2;
    this._context.lineCap = "round";

    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this._context.fillStyle = "#3a87ad";
    this._context.strokeStyle = "#3a87ad";
    this._context.lineWidth = 1;
    this._context.moveTo((this._canvas.width * 0.042), (this._canvas.height * 0.7));
    this._context.lineTo((this._canvas.width * 0.958), (this._canvas.height * 0.7));
    this._context.stroke();

    this._context.fillStyle = "#fff";
    this._context.strokeStyle = "#444";
  }
  private registerEvents() {
    this._canvas.addEventListener("mousedown", this._onMouseDown, false);
    this._canvas.addEventListener("touchstart", this._onMouseDown, false);
  }
  private removeEvents() {
    this._canvas.removeEventListener("mousemove", this._onMouseMove, false);
    this._canvas.removeEventListener("mouseup", this._onMouseUp, false);
    this._canvas.removeEventListener("touchmove", this._onMouseMove, false);
    this._canvas.removeEventListener("touchend", this._onMouseUp, false);

    document.body.removeEventListener("mouseup", this._onMouseUp, false);
    document.body.removeEventListener("touchend", this._onMouseUp, false);
  }
  private getBoardCoords(e) {
    let x, y;

    if (e.changedTouches && e.changedTouches[0]) {
      const offsety = this._canvas.offsetTop || 0;
      const offsetx = this._canvas.offsetLeft || 0;

      x = e.changedTouches[0].pageX - offsetx;
      y = e.changedTouches[0].pageY - offsety;
    } else if (e.layerX || 0 == e.layerX) {
      x = e.layerX;
      y = e.layerY;
    } else if (e.offsetX || 0 == e.offsetX) {
      x = e.offsetX;
      y = e.offsetY;
    }

    return {
      x: x,
      y: y
    };
  }

  private onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    this._canvas.addEventListener("mousemove", this._onMouseMove, false);
    this._canvas.addEventListener("mouseup", this._onMouseUp, false);
    this._canvas.addEventListener("touchmove", this._onMouseMove, false);
    this._canvas.addEventListener("touchend", this._onMouseUp, false);

    document.body.addEventListener("mouseup", this._onMouseUp, false);
    document.body.addEventListener("touchend", this._onMouseUp, false);

    this._data.empty = false;

    const xy = this.getBoardCoords(e);
    this._context.beginPath();
    this._data.pixels.push("moveStart");
    this._context.moveTo(xy.x, xy.y);
    this._data.pixels.push(xy.x, xy.y);
    this._data.xyLast = xy;
  }
  private onMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();

    const xy = this.getBoardCoords(e);
    const xyAdd = {
      x: (this._data.xyLast.x + xy.x) / 2,
      y: (this._data.xyLast.y + xy.y) / 2
    };

    if (this._data.calculate) {
      const xLast = (this._data.xyAddLast.x + this._data.xyLast.x + xyAdd.x) / 3;
      const yLast = (this._data.xyAddLast.y + this._data.xyLast.y + xyAdd.y) / 3;
      this._data.pixels.push(xLast, yLast);
    } else {
      this._data.calculate = true;
    }

    this._context.quadraticCurveTo(this._data.xyLast.x, this._data.xyLast.y, xyAdd.x, xyAdd.y);
    this._data.pixels.push(xyAdd.x, xyAdd.y);
    this._context.stroke();
    this._context.beginPath();
    this._context.moveTo(xyAdd.x, xyAdd.y);
    this._data.xyAddLast = xyAdd;
    this._data.xyLast = xy;
  }
  private onMouseUp(e) {
    this.removeEvents();
    this._data.disableSave = false;
    this._context.stroke();
    this._data.pixels.push("e");
    this._data.calculate = false;
  }
}

interface IData {
  empty: boolean;
  disableSave: boolean;
  pixels: any[];
  cpixels: ICoord[];
  xyLast: ICoord;
  xyAddLast: ICoord;
  calculate: boolean;
}
interface ICoord {
  x: number;
  y: number;
}
type MouseEvent = { (e): void };