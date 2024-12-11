let PosterViewer = (function(canv, images, preload) {
    let already = false;   
    let keys = {}; 
    let editor = false;

    function setEditor() {editor = true;}

    let preloaded = 0;
    let loaded = 0;
    let intervalId;
    let loadprocess = 0;
    let START = false;
    let sizefactorx = 1;
    let sizefactory = 1;
    let sizefactor = 1;
    let pwidth;
    let pheight;
    let lastOver = null;
    function setLastOver(l){lastOver = l;}

    let groupId = 1;
    function incGroupId(){return groupId++;}    

    
    let m = [1,0,0,1,0,0];
    let im = [1,0,0,1];
    
    let screen;
    let oldwidth; // temporaly var while screeh reduced
    let oldheight;
    let screenCopy;
    let screenTextArea;
    let g;
    let g2;
    let lock = false;
    let fullScreen = false;
    //let fileSelected;

    let translatex = 0;
    function getTx(){return translatex;}
    function setTx(s){translatex = s;}
    let translatey = 0;
    function getTy(){return translatey;}
    function setTy(s){translatey = s;}
    let rot = 0;
    function getRot(){return rot;}
    function setRot(s){rot = s;}
    let scale = 1;
    function getScale(){return scale;}
    function setScale(s){scale = s;}
    
    let eventX = 0;
    let eventY = 0;
    let oldX = 0;
    let oldY = 0;
    let lastSelected = null;
    function setLastSelected(s){lastSelected = s;}
    function getLastSelected(){return lastSelected;}

    let selectedStyle = "yellow";
    let groupSelectedStyle = "red";
    
    let lastId = 1;
    function getLastId(){return lastId;}

    let objects = new Set();
    
    let linew = 2;
    function setLineW(l){linew = l;}

    let editedText;
    function setEditedText(t){editedText = t;}

    let lastFont = "20px Arial";
    let cursorWhite = true;
    let textPos = 5;
    function setTextPos(p){textPos = p;}
    function getTextPos(){return textPos;}

    let textLine = 5;
    let setLinePos = false;
    function setSetLinePos(p){setLinePos = p;}
    
    let num = 0;
    function setNum(n) {num = n;}


    let frames = new Set();
    let ofmap = new Map();
    let lastFrame = null;
    let stopLastFrame = false;
    function setLastFrame(f){lastFrame = f;}
    function getLastFrame(){return lastFrame;}

    let ftx;
    let fty;
    let ftor;
    let fscale;
    let fxy;
    let stx;
    let sty;
    let srot;
    let sscale;
    let sxy;
    let finalFrame = null;
    function getFinalFrame() {return finalFrame;}
    let frameIntervalId = 0;
    function getFrameIntervalId() {return frameIntervalId;}

    let txstep = 0
    let tystep = 0
    let rotstep = 0
    let scalestep = 0
    let PLAY = false;
    function setPLAY(p){PLAY = p;}
    function getPLAY(){return PLAY;}

    let framesIterator;
    let playstop;
    let pauseIntervalId = 0;
    let pause = 0;
    
    let positions = new Set();
    let fmap = new Map();
    
 
    let audio = new AudioContext();
    
    
    /**/
    class Position {
      constructor(o) {
        if (o) {
          this.tx = o.tx;
          this.ty = o.ty;
          this.rot = o.rot;
          this.scale = o.scale;
          this.xy = {x: o.xy.x, y: o.xy.y};
          this.scalescale = o.scalescale;
          if (lastFrame) this.id = lastFrame.id;
          this.objectId = o.objectId;
          o.createRectMatrix();
          this.c = o.toRectWorld(0, 0);
        }
      }

      toJSON() {
        return {
          $type: "Position",
          tx: this.tx,
          ty: this.ty,
          rot: this.rot,
          scale: this.scale,
          scalescale: this.scalescale,
          xy: this.xy,
          c: this.c,
          id: this.id,
          objectId: this.objectId,
        }
      }

      static fromJSON(data) {
        let f = new Position(null);
        f.tx = data.tx;
        f.ty = data.ty;
        f.rot = data.rot;
        f.scale = data.scale;
        f.scalescale = data.scalescale;
        f.xy = data.xy;
        f.c = data.c;
        f.id = data.id;
        f.objectId = data.objectId;
        return f;
      }

      clone(o) {
        this.tx = o.tx;
        this.ty = o.ty;
        this.rot = o.rot;
        this.scale = o.scale;
        this.xy = o.xy;
        this.scalescale = o.scalescale;
        this.objectId = o.objectId;
        this.c = o.c;
      }
    }
    
    
    
    
    let frameId = 1;
    /*
    */
    class Frame {
      constructor() {
        this.tx = translatex;
        this.ty = translatey;
        this.rot = rot;
        this.scale = scale;
        this.id = frameId++;
        this.xy = toWorld(screen.width / 2, screen.height / 2);
        this.order = 0;
        this.animation = 30;
        this.pause = 1;
        this.auto = true;
        this.permanent = false; // временные объекты остаются на экране
        fmap.set(this.id, this);
      }
      toJSON() {
        return {
          $type: "Frame",
          tx: this.tx,
          ty: this.ty,
          scale: this.scale,
          rot: this.rot,
          id: this.id,
          xy: this.xy,
          auto: this.auto,
          order: this.order,
          animation: this.animation,
          pause: this.pause,
          permanent: this.permanent,
        }
      }
      static fromJSON(data) {
        let f = new Frame();
        f.tx = data.tx;
        f.ty = data.ty;
        f.rot = data.rot;
        f.scale = data.scale;
        f.id = data.id;
        f.xy = data.xy;
        f.auto = data.auto;
        f.order = data.order;
        f.animation = data.animation;
        f.pause = data.pause;
        f.permanent = data.permanent;
        if (frameId < f.id + 1) frameId = f.id + 1;
        return f;
      }
    }
    
    
    /*
     *
     *  Classes of functional objects
     *  
     */
    class Shape {
      constructor() {
        this.selected = false;
        this.scalescale = 0;
        this.xy = toWorld(screen.width / 2, screen.height / 2);
        this.scalable = true;
        this.factor = 1;
        this.group = 0;
        this.scale = 1;
        this.objectId = lastId++;
      }
    
      checkSelected(inside) {
        if (inside) {
          lastSelected = this;
          return true;
        }
        return false;
      }
      move(dx, dy, edx, edy) {
        //this.xy = toWorld(screen.width / 2, screen.height / 2);
      }
      rotate(a, x, y){
      }
      scaling(a, x, y){
      }
    }
    
    /**/
    class Text extends Shape {
    
      constructor(str, x, y) { 
        super(); 
        this.str = str; 
        this.x = x; 
        this.y = y; 
        this.w = 100;
        this.f = "20px Arial";
        this.font = lastFont;
        this.fontH = determineFontHeight("font: " + this.f + ";");
        this.calcWH();
        this.linePos = 0;
        this.style = "#ffff55";
        this.selp1 = 0;
        this.selp2 = str.length;
        this.sel = true;
      }
    
      toJSON() {
        return {
          $type: "Text",
          str: this.str,
          x: this.x,
          y: this.y,
          f: this.f,
          shadow: this.shadow,
          style: this.style,
          strokestyle: this.strokestyle,
          objectId: this.objectId,
        }
      };
    
      static fromJSON(data) {
        let t = new Text(data.str, data.x, data.y);
        t.str = data.str;
        t.font = data.f;
        t.shadow = data.shadow;
        t.strokestyle = data.strokestyle;
        t.style = data.style;
        t.objectId = data.objectId; if (lastId < t.objectId + 1) lastId = t.objectId;
        t.calcWH();
        return t;
      }
    
      set font(x) {
        let a = this.f.split(" ");
        let b = x.indexOf("px ");
    
        if (b == -1) {
          this.f = a[0] + " " + x;
        }
        else {
          this.f = x;
        }
        this.fontH = determineFontHeight("font: " + this.f + ";");
        this.calcWH();
      }  
    
      calcWH() {
        g.font = this.f;
        let a = this.str.split("\n");
        this.h = 0;
        this.w = 0;
        for(let s in a){
          this.h += this.fontH;
          let w = g.measureText(a[s]).width;
          if (w > this.w) this.w = w;
        }
      }
    
      getSelected() {
        if (this.sel) {
          let p1;
          let p2;
    
          if (this.selp1 > this.selp2) {
            p1 = this.selp2;
            p2 = this.selp1;
          }
          else {
            p1 = this.selp1;
            p2 = this.selp2;
          }
          let frag1 = this.str.slice(p1, p2 - p1 + 1);
          return frag1;
        }
      }
    
      deleteSelected(){
    
        if (this.sel) {
          let p1;
          let p2;
    
          if (this.selp1 > this.selp2) {
            p1 = this.selp2;
            p2 = this.selp1;
          }
          else {
            p1 = this.selp1;
            p2 = this.selp2;
          }
          let frag1 = this.str.slice(0, p1);
          let frag2 = this.str.slice(p2, this.str.length);
          this.sel = false;
          this.str = frag1 + frag2;
          textPos = p1;
        }
        return textPos;
      }
    
      draw(g) {
        g.font = this.f;
    
        if (this.shadow) {
          if (this.scalescale > 0) {
            let b = this.scalescale;
    
            if (b > 40) b = 40;
            let a = Math.sqrt(50 - b) / 40;
            g.shadowColor = "rgba(0, 0, 7, " + a + ")";
            g.shadowOffsetX = 4 + this.scalescale * scale;
            g.shadowOffsetY = 4 + this.scalescale * scale;
            g.shadowBlur = 5;
          }
          else {
            g.shadowColor = "rgba(0, 0, 7, 0.5)";
            g.shadowOffsetX = 4;
            g.shadowOffsetY = 4;
            g.shadowBlur = 5;   
          }
        }
        else {
          g.shadowColor = "rgba(0, 0, 0, 0)";
        }
        g.fillStyle = this.style;
        g.textAlign = "left";
        g.textBaseline = "middle";
    
        let a = this.str.split("\n");
        let y = this.y;
        let start = 0;
    
        
        for (let s in a) {
    
    
          let end = start + a[s].length + 1;
    
          if (editedText == this) {
    
            let frag = this.str.slice(start, end - 1);
    
            if (textPos >= start && textPos < end) {
    
              if (setLinePos) {
                if (this.linePos > frag.length) this.linePos = frag.length;
    
                textPos = start + this.linePos;
                setLinePos = false;
    
                this.selp2 = textPos;
              }
            }
    
            if (this.sel) {
              let p1;
              let p2;
    
              if (this.selp1 > this.selp2) {
                p1 = this.selp2;
                p2 = this.selp1;
              }
              else {
                p1 = this.selp1;
                p2 = this.selp2;
              }
    
              // draw selection
              if (p2 >= start && p1 <= end) {
                let p1x = 1e10;
    
                if (1 <= start) {
                  p1x = this.x; 
                }
    
                if (p1 >= start && p1 <= end) {
                  let frag2 = a[s].slice(0, p1 - start);
                  p1x = this.x + g.measureText(frag2).width;
                }
                let p2x = 1e10;
    
                if (p2 >= end) {
                  p2x = this.x + g.measureText(a[s]).width; 
                }
    
                if (p2 >= start && p2 < end) {
                  let frag2 = a[s].slice(0, p2 - start);
                  p2x = this.x + g.measureText(frag2).width;
                }
    
                g.fillStyle = "#000000";
                g.fillRect(p1x, y - this.fontH / 2, p2x - p1x, this.fontH);
                g.fillStyle = this.style;
              }
            }
    
            if (textPos >= start && textPos < end) {
              let frag2 = a[s].slice(0, textPos - start);
              let w = g.measureText(frag2).width;
    
              this.linePos = textPos - start;
              g.lineWidth = 0;
              g.strokeStyle = "#fff";
              g.beginPath();
              g.moveTo(this.x + w, y - this.fontH / 2);
              g.lineTo(this.x + w, y + this.fontH / 2);
              g.stroke();
            }
    
            start = end;
          }
          g.fillText(a[s], this.x, y); 
          
          y += this.fontH;
        }
        if (this.selected) {
    
          if (this.group) g.strokeStyle = groupSelectedStyle;
          else g.strokeStyle = selectedStyle;
    
          g.shadowColor = "rgba(0, 0, 0, 0)";
          g.lineWidth = 2 * this.scale / scale;
          g.strokeRect(this.x - 3, this.y - 3 - this.fontH / 2, this.w + 6, this.h + 6);
        }
      }
    
      select(g, xx, yy){
        g.beginPath();
        g.moveTo(this.x, this.y - this.fontH / 2);
        g.lineTo(this.x + this.w, this.y - this.fontH / 2);
        g.lineTo(this.x + this.w, this.y + this.h - this.fontH / 2);
        g.lineTo(this.x, this.y + this.h - this.fontH / 2);
        g.lineTo(this.x, this.y - this.fontH / 2);
        g.closePath();
        return super.checkSelected(g.isPointInPath(xx, yy));
      }
    
      setCursor(xx, yy) {
        g.font = this.f;
        let a = this.str.split("\n");
        let y = this.y - this.fontH / 2;
        let start = 0;
        let pos = 0;
    
        for(let s in a){
    
          let end = start + a[s].length + 1;
    
          if (yy >= y && yy < y + this.fontH) {
            textPos = pos;
            let frag = this.str.slice(start, end - 1);
            let x = this.x;
    
            for (let c of frag) {
              let x2 = x + g.measureText(c).width;
    
              if (xx >= x && xx < x2)  {
                textPos = pos;
    
                if (xx - x > x2 - xx) textPos = pos + 1;
                return textPos;
              }
    
              x = x2;
              pos++;
              textPos = pos;
            }
          }
          
          pos += a[s].length + 1;
          start = end;
          
          y += this.fontH;
        }
        return textPos;
      }
    
      cursor() {
        if (lock) return;
        g.save();
        g.resetTransform();
        g.shadowColor = "rgba(0, 0, 0, 0)";
    
        
        if (cursorWhite) {
          g2.drawImage(screen, 
            100, 100, 50, 50, 
            0, 0, 50, 50);
          g.fillStyle = "#888888";
          g.globalCompositeOperation = "exclusion";
          g.fillRect(110, 110, 30, 30);
        }
        else {
          g.drawImage(screenCopy, 
            100, 100);
        }
    
        cursorWhite = ! cursorWhite;
    
        g.restore();
      }
    
      move(dx, dy, edx, edy) {
        super.move(dx, dy, edx, edy);
        this.x += dx;
        this.y += dy;
      }
    }
    
    /** */
    class Rect extends Shape {
      constructor(x, y, w, h, style, over){
        super(); 
        this.x = x;
        this.w = w;
        this.y = y;
        this.h = h;
        this.style = style;
        this.overstyle = over;
      }
    
      toJSON() {
        return {
          $type: "Rect",
          style: this.style,
          strokestyle: this.strokestyle,
          overstyle: this.overstyle,
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          shadow: this.shadow,
          group: this.group,
          id: this.id,
          scalable: this.scalable,
          objectId: this.objectId,
        }
      };
    
      static fromJSON(data) {
        let t = new Rect(data.x, data.y, data.w, data.h, data.style, data.overstyle);
        t.shadow = data.shadow;
        t.group = data.group;
        t.id = data.id;
        t.scalable = data.scalable;
        t.strokestyle = data.strokestyle;
        t.objectId = data.objectId; if (lastId < t.objectId + 1) lastId = t.objectId;
        return t;
      }
    
      draw(g) {
    
        if (this.shadow) {
          if (this.scalescale > 0) {
            let b = this.scalescale;
    
            if (b > 40) b = 40;
            let a = Math.sqrt(50 - b) / 40;
            g.shadowColor = "rgba(0, 0, 7, " + a + ")";
            g.shadowOffsetX = 4 + this.scalescale * scale;
            g.shadowOffsetY = 4 + this.scalescale * scale;
            g.shadowBlur = 5;
          }
          else {
            g.shadowColor = "rgba(0, 0, 7, 0.5)";
            g.shadowOffsetX = 4;
            g.shadowOffsetY = 4;
            g.shadowBlur = 5;   
          }
        }
        else {
          g.shadowColor = "rgba(0, 0, 0, 0)";
        }
    
        if (this.scalable) {
    
          if (! this.nofill) {
            g.fillStyle = this.style;
            g.fillRect(this.x, this.y, this.w, this.h);  
          }
    
          if (this.selected) {
            g.lineWidth = 2 * this.scale / scale;
            g.shadowColor = "rgba(0, 0, 0, 0)";
    
            if (this.group) g.strokeStyle = groupSelectedStyle;
            else g.strokeStyle = selectedStyle;
            g.strokeRect(this.x, this.y, this.w, this.h);
          }
        }
        else {
          g.fillStyle = this.style;
          if (lastOver == this) {
            g.fillStyle =  this.overstyle;
          }
          g.fillRect(this.x, this.y, this.w, this.h);  
    
          if (this.selected) {
            g.lineWidth = 2 * this.scale / scale;
            g.shadowColor = "rgba(0, 0, 0, 0)";
            g.strokeStyle = "yellow";
            g.strokeRect(this.x, this.y, this.w, this.h);
          }
        }
      }
    
      select(g, xx, yy) {
        g.beginPath();
        g.moveTo(this.x, this.y);
        g.lineTo(this.x + this.w, this.y);
        g.lineTo(this.x + this.w, this.y + this.h);
        g.lineTo(this.x, this.y + this.h);
        g.lineTo(this.x, this.y);
        g.closePath();
    
        if (! this.scalable) {
          return g.isPointInPath(xx, yy);
        }

        return super.checkSelected(g.isPointInPath(xx, yy));
      }
    
      move(dx, dy, edx, edy) {
        super.move(dx, dy, edx, edy);
        this.x += dx;
        this.y += dy;
      }
    }
    

    /** */
    class TShape extends Shape {
      constructor(object) {
        super(); 
        this.object = object;
        this.tx = translatex;
        this.ty = translatey;
        this.scale = scale;
        this.rot = rot;
        this.m = [0,0,0,0,0,0];
        this.im = [0,0,0,0];
        this.frameId = 0;
        this.note = false; // for one frame object to notice some elements
        this.textnote = false;
        this.group = 0;
        this.createRectMatrix();
      }
    
      toJSON() {
        return {
          $type: "TShape",
          //object: JSON.stringify(this.object),
          internalId: this.object.objectId,
          xy: this.xy,
          scalable: this.scalable,
          scalescale: this.scalescale,
          tx: this.tx,
          ty: this.ty,
          scale: this.scale,
          rot: this.rot,
          m: this.m,
          im: this.im,
          group: this.group,
          shadow: this.shadow,
          style: this.style,
          strokestyle: this.strokestyle,
          objectId: this.objectId,
          frameId: this.frameId,
          note: this.note,
          textnote: this.textnote,
        }
      }
    
      static fromJSON(data) {
        let t = new TShape(null);
        t.tx = data.tx;
        t.ty = data.ty;
        t.scale = data.scale;
        t.rot = data.rot;
        t.xy = data.xy;
        t.scalable = data.scalable;
        t.scalescale = data.scalescale;
        t.group = data.group;
        t.shadow = data.shadow;
        t.strokestyle = data.strokestyle;
        t.style = data.style;
        t.objectId = data.objectId; if (lastId < t.objectId + 1) lastId = t.objectId;
        t.internalId = data.internalId;
        t.frameId = data.frameId;
        t.note = data.note;
        t.textnote = data.textnote;
        t.createRectMatrix();
        if (groupId <= t.group) groupId = t.group + 1;
        return t;
      }
    
      centered() {
        let rdx = -this.object.w / 2 - this.object.x;
        let rdy = -this.object.h / 2 - this.object.y;
    
        this.object.x = -this.object.w / 2;
        this.object.y = -this.object.h / 2;
        
        this.tx += rdx / this.scale;
        this.ty += rdy / this.scale;
        this.m[4] = this.tx;
        this.m[5] = this.ty;
      }
    
      draw(g) {
    
        if (PLAY && (this.note || this.textnote)) {
    
          if (! this.permanent && this.frameId != lastFrame.id) {
            return;
          }
          if(this.permanent && this.order > lastFrame.order) {
            return;
          }
        } 
    
        if (this.object.factor && this.object.factor != 1) {
          let wxy = this.toRectWorld(this.object.x, this.object.y);
          this.scaling(1 / this.object.factor, wxy.x, wxy.y);
          this.object.factor = 1;
        }
        this.object.shadow = this.shadow;
        this.object.scale = this.scale;
        this.object.strokestyle = this.strokestyle;
        this.object.style = this.style;
        this.object.strokestyle = this.strokestyle;
    
        this.object.scalescale = this.scalescale;
        g.save();
    
        g.rotate(-this.rot);
        g.translate(-this.tx, -this.ty);
        g.scale(1 / this.scale, 1 / this.scale);
    
        this.object.selected = this.selected;
        this.object.scale = this.scale;
        this.object.draw(g);
        
        g.restore();
      }
    
    
      centerToPoint(xy1) {
        let xy2 = this.toRectWorld(0,0);
        let dx = xy2.x - xy1.x;
        let dy = xy2.y - xy1.y;
    
        this.ty += dx * Math.sin(this.rot) + dy * Math.cos(this.rot);
        this.tx += dx * Math.cos(this.rot) - dy * Math.sin(this.rot);
    
        this.createRectMatrix();
      }
    
    
      // преобразует мировые координаты в локальную систему прямоугольника
      toRectScreen(x, y) { 
        let rx = x * Math.sin(this.rot) + y * Math.cos(this.rot);
        let ry = x * Math.cos(this.rot) - y * Math.sin(this.rot);
    
        let tx = ry + this.tx;
        let ty = rx + this.ty;
    
        let sx = tx * this.scale;
        let sy = ty * this.scale;
     
        return {
           x:   sx,
           y:   sy
        }
      }
    
      toRectWorld(x, y) {        
        var xx, yy, result;
        xx = x - this.m[4] * this.scale;     // remove the translation 
        yy = y - this.m[5] * this.scale;     // by subtracting the origin
        // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
        return {
           x:   (xx * this.im[0] + yy * this.im[2]),
           y:   xx * this.im[1] + yy * this.im[3]
        }
      }
    
      createRectMatrix() {
        // create the rotation and scale parts of the matrix
        this.m[3] = this.m[0] = Math.cos(this.rot) * this.scale;
        this.m[2] = -(this.m[1] = Math.sin(this.rot) * this.scale);
    
        // add the translation
        this.m[4] = this.tx;
        this.m[5] = this.ty;
    
        // calculate the inverse transformation
        // first get the cross product of x axis and y axis
        let cross = this.m[0] * this.m[3] - this.m[1] * this.m[2];
    
        // now get the inverted axis
        this.im[0] =  this.m[3] / cross;
        this.im[1] = -this.m[1] / cross;
        this.im[2] = -this.m[2] / cross;
        this.im[3] =  this.m[0] / cross;
      }   
    
      setCursor(xx, yy) {
    
        let sxy = this.toRectScreen(xx, yy);
        return this.object.setCursor(sxy.x, sxy.y);
      }
    
      select(g, x, y){
        g.save();
    
        g.rotate(-this.rot);
        g.translate(-this.tx, -this.ty);
        g.scale(1 / this.scale, 1 / this.scale);
    
        if (this.object.select(g, x, y)) {
          lastSelected = this;
        }
    
        g.restore();
      }
    
      move(dx, dy, oldxy, xy) {
        super.move(dx, dy, oldxy, xy);
        let oldsxy = this.toRectScreen(oldxy.x, oldxy.y);
        let sxy = this.toRectScreen(xy.x, xy.y);
        let rdx = sxy.x - oldsxy.x;
        let rdy = sxy.y - oldsxy.y;
        this.tx -= rdx / this.scale;
        this.ty -= rdy / this.scale;
        this.m[4] = this.tx;
        this.m[5] = this.ty;
      }
    
      rotate(a, x, y) {
        let oldsxy = this.toRectScreen(x, y);
        this.rot += a;
        this.createRectMatrix();
        let sxy = this.toRectScreen(x, y);
        let rdx = sxy.x - oldsxy.x;
        let rdy = sxy.y - oldsxy.y;
        this.tx -= rdx / this.scale;
        this.ty -= rdy / this.scale;
        //o.createRectMatrix();
        this.m[4] = this.tx;
        this.m[5] = this.ty;
        //this.object.move(rdx, rdy, oldsxy, sxy);
        return {x:-rdx / this.scale, y:-rdy / this.scale};
      }
    
      scaling(a, x, y) {
        let oldsxy = this.toRectScreen(x, y);
        this.scale *= a;
        this.createRectMatrix();
        let sxy = this.toRectScreen(x, y);
        let rdx = sxy.x - oldsxy.x;
        let rdy = sxy.y - oldsxy.y;
        this.tx -= rdx / this.scale;
        this.ty -= rdy / this.scale;
        this.m[4] = this.tx;
        this.m[5] = this.ty;
      }
    }
    
    /** */
    class Im extends Shape {

      constructor(id, src, x, y, style, over) {
        super(); 
        this.x = x;
        this.y = y;
        this.id = canv + id;
        this.src = src;
        this.style = style;
        this.overstyle = over;
        this.fix = false;
        this.fixstyle = "#eee";
        this.title = '';
        setImageOnload(this.id, src, this);
      }

      setTitle(title) {
        this.title = title
      }

      toJSON() {
        return {
          $type: "Im",
          id: this.id,
          src: this.src,
          x: this.x,
          y: this.y,
          style: this.style,
          strokestyle: this.strokestyle,
          overstyle: this.overstyle,
          group: this.group,
          script: this.script,
          scalable: this.scalable,
          objectId: this.objectId,
          id: this.id,
        }
      };
    
      static fromJSON(data) {
        let t = new Im(data.id, data.src, data.x, data.y, data.style, data.overstyle);
        t.group = data.group;
        t.script = data.script;
        t.scalable = data.scalable;
        t.strokestyle = data.strokestyle;
        t.objectId = data.objectId; if (lastId < t.objectId + 1) lastId = t.objectId;
        return t;
      }
    
      load() {
        this.image = document.getElementById(this.id);
        let xf = this.w / this.image.width;
        let yf = this.h / this.image.height;
        if (xf < yf) this.factor = xf;
        else this.factor = yf;
        this.w = this.image.width;
        this.h = this.image.height;
    
        if (START) redraw();
      }
    
      error() {
        redraw();
      }
    
      draw(g){
        
        // console.log('title: ' + this.title)

        if (this.scalable) {
    
          if (this.shadow) {
            if (this.scalescale > 0) {
              let b = this.scalescale;
    
              if (b > 40) b = 40;
              let a = Math.sqrt(50 - b) / 40;
              g.shadowColor = "rgba(0, 0, 7, " + a + ")";
              g.shadowOffsetX = 4 + this.scalescale * scale;
              g.shadowOffsetY = 4 + this.scalescale * scale;
              g.shadowBlur = 5;
            }
            else {
              g.shadowColor = "rgba(0, 0, 7, 0.5)";
              g.shadowOffsetX = 4;
              g.shadowOffsetY = 4;
              g.shadowBlur = 5;   
            }
          }
          else {
            g.shadowColor = "rgba(0, 0, 0, 0)";
          }
    
    
    
          g.fillStyle = this.style;
          g.fillRect(this.x, this.y, this.w, this.h);  
    
          if (this.image) {
            try {
              g.drawImage(this.image, this.x, this.y, this.w, this.h);
            }
            catch (e) {
              g.font = "12px Arial";
              g.shadowColor = "rgba(0, 0, 0, 0)";
              g.fillStyle ="red";
              g.fillText("Error: Resource not found!", this.x + 5, this.y + this.h / 2);
            }
          }
    
          if (this.selected) {
            g.lineWidth = 2 * this.scale / scale;
            g.shadowColor = "rgba(0, 0, 0, 0)";
    
            if (this.group) g.strokeStyle = groupSelectedStyle;
            else g.strokeStyle = selectedStyle;
            g.strokeRect(this.x, this.y, this.w, this.h);
          }
        }
        else {

          g.shadowColor = "rgba(0, 0, 0, 0)";
          g.fillStyle = this.style;
    
          if (lastOver == this) {
            g.fillStyle =  this.overstyle;

            g.beginPath();
            g.moveTo(this.x + this.w / 2, this.y - this.h / 2 + 4);
            g.lineTo(this.x + this.w / 2, this.y + 2);
            g.closePath();
            g.strokeStyle = 'silver'
            g.stroke()
            g.fillText(this.title, this.x + this.w / 2 - 4, this.y - this.h / 2);
          }
          if (this.fix) {
            g.fillStyle =  this.fixstyle;
          }
          g.fillRect(this.x, this.y, this.w, this.h);  
    
          if (this.image) {
            try {
              g.drawImage(this.image, this.x, this.y, this.w, this.h);
            }
            catch (e) {
              g.font = "12px Arial";
              g.shadowColor = "rgba(0, 0, 0, 0)";
              g.fillStyle ="red";
              g.fillText("Error: Resource not found!", this.x + 5, this.y + this.h / 2);
            }
          }
        }
      }
    
      select(g, x, y){
        g.beginPath();
        g.moveTo(this.x, this.y);
        g.lineTo(this.x + this.w, this.y);
        g.lineTo(this.x + this.w, this.y + this.h);
        g.lineTo(this.x, this.y + this.h);
        g.lineTo(this.x, this.y);
        g.closePath();
    
        if (! this.scalable) {
          return g.isPointInPath(x, y);
        }
    
        return super.checkSelected(g.isPointInPath(x, y));
      }
    
      move(dx, dy, edx, edy) {
        super.move(dx, dy, edx, edy);
        this.x += dx;
        this.y += dy;
      }
    }
    
    /** */
    class Poly extends Shape {
      constructor(regs, style){
        super(); 
        this.p = {regions: regs, inverted: false};
        this.style = style;
        this.linew = linew;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
      }
    
      toJSON() {
        return {
          $type: "Poly",
          p: this.p,
          style: this.style,
          strokestyle: this.strokestyle,
          group: this.group,
          shadow: this.shadow,
          nofill: this.nofill,
          linew: this.linew,
          x: this.x,
          y: this.y,
          w: this.w,
          h: this.h,
          objectId: this.objectId,
        }
      };
    
      static fromJSON(data) {
        let t = new Poly(data.p.regions, data.style);
        t.group = data.group;
        t.shadow = data.shadow;
        t.strokestyle = data.strokestyle;
        t.nofill = data.nofill;
        t.linew = data.linew;
        t.x = data.x;
        t.y = data.y;
        t.w = data.w;
        t.h = data.h;
        t.objectId = data.objectId; if (lastId < t.objectId + 1) lastId = t.objectId;
        return t;
      }
    
      draw(g){
        if (this.shadow) {
          if (this.scalescale > 0) {
            let b = this.scalescale;
    
            if (b > 40) b = 40;
            let a = Math.sqrt(50 - b) / 40;
            g.shadowColor = "rgba(0, 0, 7, " + a + ")";
            g.shadowOffsetX = 4 + this.scalescale * scale;
            g.shadowOffsetY = 4 + this.scalescale * scale;
            g.shadowBlur = 5;
          }
          else {
            g.shadowColor = "rgba(0, 0, 7, 0.5)";
            g.shadowOffsetX = 4;
            g.shadowOffsetY = 4;
            g.shadowBlur = 5;   
          }
        }
        else {
          g.shadowColor = "rgba(0, 0, 0, 0)";
        }
    
        if (! this.nofill) {
          g.fillStyle = this.style;
          polyFill(g, this.p);
        }
        else  {
          g.strokeStyle = this.strokestyle;
          g.lineWidth = this.linew /** this.scale / scale*/;
          if (this.max) polyStroke(g, this.p, this.max);
          else polyStroke(g, this.p);
        }
    
        if (this.selected) {
          g.shadowColor = "rgba(0, 0, 0, 0)";
          if (this.group) g.strokeStyle = groupSelectedStyle;
          else g.strokeStyle = selectedStyle;
          g.lineWidth = 2 * this.scale / scale;
          polyDrawSelect(g, this.p);
        }
      }
    
      select(g, x, y){
        if (this.nofill) {
          polyStrokeSelect(g, this.p);
        }
        else {
          polyFillSelect(g, this.p);
        }
    
        return super.checkSelected(g.isPointInPath(x,y));
      }
    
      move(dx, dy, edx, edy) {
        super.move(dx, dy, edx, edy);
    
        let ok = new Map();
    
        this.p.regions.forEach(function(region, i) {
              for (var i = 0; i < region.length; i++) {
            if (ok[region[i]] != 1) {
              region[i][0] += dx;
              region[i][1] += dy;
              ok[region[i]] = 1;
            }
          }
        });
      }
    }
    
    
    // TODO func determineFontHeight()
    function determineFontHeight(fontStyle) {
        var body = document.getElementsByTagName("body")[0];
        var dummy = document.createElement("div");
        var dummyText = document.createTextNode("M");
        dummy.appendChild(dummyText);
        dummy.setAttribute("style", fontStyle);
        body.appendChild(dummy);
        var result = dummy.offsetHeight;
        body.removeChild(dummy);
        return result;
      }
    
    
    // TODO func createMatrix()
    function createMatrix() {
        // create the rotation and scale parts of the matrix
        m[3] =   m[0] = Math.cos(rot) * scale;
        m[2] = -(m[1] = Math.sin(rot) * scale);
    
        // add the translation
        m[4] = translatex;
        m[5] = translatey;
    
        // calculate the inverse transformation
    
        // first get the cross product of x axis and y axis
        cross = m[0] * m[3] - m[1] * m[2];
    
        // now get the inverted axis
        im[0] =  m[3] / cross;
        im[1] = -m[1] / cross;
        im[2] = -m[2] / cross;
        im[3] =  m[0] / cross;
    
        //changeFrame();
    }   
    
    // TODO func toScreen()
    function toScreen(x,y) {        
      let rx = x * Math.sin(rot) + y * Math.cos(rot);
      let ry = x * Math.cos(rot) - y * Math.sin(rot);
    
      let tx = ry + translatex;
      let ty = rx + translatey;
    
      let sx = tx * scale;
      let sy = ty * scale;
    
      return {
          x:   sx,
          y:   sy
      }
    }
    
    // TODO func toWorld()
    function toWorld(x, y) {        
        var xx, yy, result;
        xx = x - m[4] * scale;     // remove the translation 
        yy = y - m[5] * scale;     // by subtracting the origin
        // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
        return {
           x:   (xx * im[0] + yy * im[2]),
           y:   xx * im[1] + yy * im[3]
        }
    }
    
    // TODO func toWorld2()
    function toWorld2(x, y) {        
        var xx, yy, result;
        xx = x - translatex * scale;     // remove the translation 
        yy = y - translatey * scale;     // by subtracting the origin
        // return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
        return {
           x:   (xx * im[0] + yy * im[2]),
           y:   xx * im[1] + yy * im[3]
        }
    }
    
    // TODO func drawRegions()
    function drawRegions(g, regions){
        regions.forEach(function(region, i){
            if (region.length <= 0)
                return;
            g.moveTo(region[0][0], region[0][1]);
            for (var i = 1; i < region.length; i++)
                g.lineTo(region[i][0], region[i][1]);
        g.closePath();
        });
    }
    function drawStrokeRegions(g, regions){
        regions.forEach(function(region, i){
            if (region.length <= 0)
                return;
            g.moveTo(region[0][0], region[0][1]);
            for (var i = 1; i < region.length; i++)
                g.lineTo(region[i][0], region[i][1]);
        });
    }
    
    // TODO func polyStroke()
    function polyStroke(g, result, max) {
      let cur = 0;
    
      if (max) {
        result.regions.forEach(function(region, i) {
          g.beginPath();
    
          if (region.length > 1) {
    
            g.moveTo(region[0][0], region[0][1]);
            cur++;
    
            for (var i = 1; i < region.length; i++) {
    
              if (max && cur >= max) break;
              g.lineTo(region[i][0], region[i][1]);
              cur++;
              if (max && cur >= max) break;
            }
          }
        });
        g.stroke();
      }
      else {
        result.regions.forEach(function(region, i) {
          g.beginPath();
    
          if (region.length > 1) {
            g.moveTo(region[0][0], region[0][1]);
    
            for (var i = 1; i < region.length; i++) {
              g.lineTo(region[i][0], region[i][1]);
            }
          }
        });
        g.stroke();
      }
    }
    
    // TODO func polyDrawSelect()
    function polyDrawSelect(g, result) {
      let off = 3;
    
        result.regions.forEach(function(region, i) {
    
        for (var i = 0; i < region.length; i++) {
          g.beginPath();
          g.moveTo(region[i][0] - off, region[i][1] - off);
          g.lineTo(region[i][0] + off, region[i][1] - off);
          g.lineTo(region[i][0] + off, region[i][1] + off);
          g.lineTo(region[i][0] - off, region[i][1] + off);
          g.lineTo(region[i][0] - off, region[i][1] - off);
          g.stroke();
        }
        });
    }
    
    // TODO func polyFill()
    function polyFill(g, result) {
        g.beginPath();
        drawRegions(g, result.regions);
        g.fill();
    }
    
    // TODO func polySelect()
    function polyFillSelect(g, result) {
        g.beginPath();
        drawRegions(g, result.regions);
    }
    
    function polyStrokeSelect(g, result) {
        g.beginPath();
        drawStrokeRegions(g, result.regions);
    }
    
    
    /*
     *
     * MAIN Redraw function
     * 
     */
     // TODO func redraw()
    function redraw() {
      if (! START) {
        return;
      }
      lock = true;
    
      g.resetTransform();
    
      g.lineJoin = "round";
      g.lineCap = "round";
      g.imageSmoothingEnabled = true;
      g.fillStyle = "#777777";
      g.fillRect(0, 0, screen.width, screen.height);
    
      let no = 0;
    
      g.scale(scale, scale);
      g.translate(translatex, translatey);
      g.rotate(rot);
    
    
      let i = 1;
      for (let o of objects) {
        o.order = i++;
      }
    
      let setb = Array.from(objects);
    
      let ssetb = setb.sort(function(e, r) { return (e.scalescale * 1e6 + e.order) - (r.scalescale * 1e6 - r.order);});
    
    
      for (let o of ssetb) {
    
        if (o.scalable) {
          g.save();
    
          if (o.scalescale) {
            let xy = toWorld2(screen.width / 2, screen.height / 2);
            let dx = xy.x - o.xy.x;
            let dy = xy.y - o.xy.y;
            if (PLAY) 
              g.translate(-dx * o.scalescale * scale / sizefactor / 100, -dy * o.scalescale * scale / sizefactor / 100);
            else 
              g.translate(-dx * o.scalescale * scale / 100, -dy * o.scalescale * scale / 100);
          }
    
    
          o.draw(g);
    
          g.restore();
        }
      }
    
      if (! PLAY && editor) {

        g.resetTransform();
    
        for (let o of objects) {
          if (! o.scalable) {
            o.draw(g);
          }
          else {
            no++;
          }
        }
    
        // todo: draw frames scrolling
        let x = 44 + num * 36 + 1;
        let y = screen.height - 56; 34
        let w = h = 32;
        let step = 34;
    
        g.font = "10px Arial";
    
        for (let f of frames) {
          g.fillStyle = "#fff";
          g.fillRect(x, y, w, h);
    
          if (lastFrame == f) {
            if (frameIntervalId == 0) g.fillStyle = "#ff2";
            else g.fillStyle = "#0fa";
            g.fillRect(x, y, w, h);
          }
    
          if (f.auto) {
            g.strokeStyle = "#000";
            g.beginPath();
            g.moveTo(x + 2, y + h / 2);
            g.lineTo(x + w - 2, y + h / 2);
            g.stroke();
            g.moveTo(x + w - 2, y + h / 2);
            g.lineTo(x + w - 2 - 3, y + h / 2 - 3);
            g.stroke();
            g.moveTo(x + w - 2, y + h / 2);
            g.lineTo(x + w - 2 - 3, y + h / 2 + 3);
            g.stroke();
          }
    
          g.fillStyle = "#000000";
          g.fillText(f.id, x + 2, y + 10); 
          let s = "";
          if (f.animation) s += f.animation + " ";
          else s += "0 ";
          if (f.pause) s += f.pause;
          else s += "0";
          g.fillText(s, x + 2, y + 30); 
    
          x += step;
        }
    
        g.font = "12px Arial";
        g.shadowColor = "rgba(0, 0, 0, 0)";
        let xy = toWorld(eventX, eventY);
        g.fillStyle = "#000000";
        let s = "";
        if (lastSelected && lastSelected.frameId) s+= "             Connected with frame " + lastSelected.frameId;
        g.fillText("Number of objects = " + no + " presentation width=" + pwidth + " screenwidth=" + screen.width + " f=" + sizefactor + s, 10, screen.height - 6); 
      }
    
      let n = 1;
      for (let f of frames) {
        f.order = n++;
        finalFrame = f;
      }

      g.resetTransform();
      //playstop.draw(g);
    
      cursorWhite = true;  
      lock = false;
    }
    
    
    
    
    function opacity(hex, a) {
        var c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + a + ')';
        }
    }
    
    
    
    let changedobjects = new Set();
    let stepmap = new Map();
    let steps;
    
    
    
    
    // TODO func GO
    function go() {
    
      if (lastFrame && frameIntervalId == 0) {
    

       // console.log("go", lastFrame);
        changedobjects.clear();
        stepmap.clear();
    
        frot = lastFrame.rot;
        fscale = lastFrame.scale * sizefactor;
        fxy = lastFrame.xy;
        sxy = toWorld(screen.width / 2, screen.height / 2);
    
        // запустим анимацию
        // TODO LINE ANIMATION setInterval
        let st = lastFrame.animation;
        if (! st) st = 1;
        txstep = (fxy.x - sxy.x) / st;
        tystep = (fxy.y - sxy.y) / st;
        rotstep = (frot - rot) / st;
        scalestep = (fscale - scale) / st;
    
        console.log('positions', positions)

        // create object steps
        for (let o of objects) {
    
          if (o.scalable) {
    
    
            let pos = ofmap.get(o.objectId * 1e6 + lastFrame.id);

            let prev = new Position(o);
    
            if (! o.note && ! o.textnote) {
    
              let init = ofmap.get(o.objectId * 1e6);
    
              if (! init) {
                continue;
              }
    
              if (! pos) {
                //pos = init;
    
                // looking for previouse state
                for (let p of positions) {
    
                  if (p.objectId == o.objectId) {
    
                      let f = fmap.get(p.id);
    
                      // если не было трансформаций, то считаем начальное положение объекта единственной трансформацией и устанавливаем ей порядок -1
                      if (! f) {

                        if (! pos) {
                          pos = p;
                          pos.order = -1;
                        }
                      } else {

                        // если для объекта добавлялась трансформация на кадре до текущего
                        if (f.order < lastFrame.order) {
    
                          // то берем такую трансформацию с максимальным порядком, самую приближенную к текущему кадру
                          if (pos && pos.order < f.order) { 
                            pos = p;
                            pos.order = f.order;
                          }
                        }
                        else {
                          pos = undefined
                        }
                      }
                  }
                }
              }
            }
    
            if (pos) {
    
              let ostep = new Position(o);
              if (! o.note && ! o.textnote) {
                changedobjects.add(o);
                ostep.tx = (pos.tx - prev.tx) / st;
                ostep.ty = (pos.ty - prev.ty) / st;
                ostep.rot = (pos.rot - prev.rot) / st;
                ostep.scale = (pos.scale - prev.scale) / st;
                ostep.scalescale = (pos.scalescale - prev.scalescale) / st;
                ostep.xy.x = (pos.xy.x - prev.xy.x) / st;
                ostep.xy.y = (pos.xy.y - prev.xy.y) / st;
                ostep.cx = (pos.c.x - prev.c.x) / st;
                ostep.cy = (pos.c.y - prev.c.y) / st;
                ostep.c = prev.c;
                ostep.pos = pos;
                stepmap.set(o,ostep);
              }
              else {
    
                if (o.textnote) {
                  changedobjects.add(o);
                  stepmap.set(o,ostep);
                }
                else {
                  changedobjects.add(o);
                  let max = 0;
                  let p = o.object.p;
    
                  p.regions.forEach(function(region, i) {
                    max += region.length;
                  });
                  ostep.max = max;
                  stepmap.set(o,ostep);
                }
              }
            }
          }
        }
    
        steps = 0;
    
        frameIntervalId = window.setInterval(
          function() { 
            if (START) {
              for (let o of changedobjects) {
                let s = stepmap.get(o);
    
                if (o.note) {
                  o.object.max = s.max * steps / st; 
                  if (! o.object.max) o.object.max = 1;
                }
                else if (o.textnote) {
                  let a = steps / st;
                  o.style = opacity(o.strokestyle, a);
                }
                else {
                  o.rot += s.rot;
                  o.scale += s.scale;
                  o.scalescale += s.scalescale;
                  o.xy.x += s.xy.x;
                  o.xy.y += s.xy.y;
                  s.c.x += s.cx;
                  s.c.y += s.cy;
                  o.createRectMatrix();
                  o.centerToPoint(s.c);
                }
              }
    
    
              rot += rotstep;
              scale += scalestep;
              sxy.x += txstep;
              sxy.y += tystep;
    
              centerToPoint(sxy);
    
              let final = 0;
    
    
              if (Math.abs(sxy.x - fxy.x) < 1e-7) {sxy.x = fxy.x; final++; txstep = 0;}
              if (Math.abs(sxy.y - fxy.y) < 1e-7) {sxy.y =  fxy.y; final++; tystep = 0;}
              if (Math.abs(rot - frot) < 1e-7) {rot = frot; final++; rotstep = 0;}
              if (Math.abs(scale - fscale) < 1e-7) {scale = fscale; final++; scalestep = 0;}
    
              steps++;
              
              if (steps == st) {
    
                for (let o of changedobjects) {
                  if (! o.note && ! o.textnote) {
                    let s = stepmap.get(o);
                    o.rot = s.pos.rot;
                    o.scale = s.pos.scale;
                    o.scalescale = s.pos.scalescale;
                    o.xy.x = s.pos.xy.x;
                    o.xy.y = s.pos.xy.y;
                    s.c.x = s.pos.cx;
                    s.c.y = s.pos.cy;
                    o.createRectMatrix();
                  }
                  else {
                    o.object.max = 0;
                  }
                }
    
                redraw();
    
                pauseIntervalId = window.clearInterval(frameIntervalId);
                frameIntervalId = 0;
                pause = 0;
                let maxpause = 0;
                if (lastFrame) maxpause = lastFrame.pause;
    
                if (maxpause) {
                  if (lastFrame && lastFrame.auto && PLAY) {
    
                    pauseIntervalId = window.setInterval(
                      function() {
                        pause++;
    
                        if (! PLAY) {
                          window.clearInterval(pauseIntervalId);
                        }
                        else if (pause == maxpause) {
    
                          window.clearInterval(pauseIntervalId);
                          pauseIntervalId = 0;
    
                          if (lastFrame == finalFrame) {
                            PLAY = false;
                            play();
                          }
                          else {
                            lastFrame = framesIterator.next().value; 
                            go();
                          }
                        }
                      }, 
                    30);
                  }
                }
                else {
                  if (lastFrame && lastFrame.auto && PLAY) {
                    if (lastFrame == finalFrame) {
                      PLAY = false;
                      play();
                    }
                    else {
                      lastFrame = framesIterator.next().value; 
                      go();
                    }
                  }
                }
              }
              else {
                redraw();
              }
              createMatrix();
            }
          }, 
          30
        );
      }
    }
    
    
    // TODO func clone()
    function clone(src) {
      return Object.assign({}, src);
    }
    
    // TODO func setImageOnload()
    function setImageOnload(o, src, im) {
      let img = document.createElement("img");
      let div = document.getElementById(images);
      img.hidden = true;
      img.src = src;
      img.id = o;
      //img.hidden = true;
      div.appendChild(img);
    
      img.onload = function() {
        im.load();
        loaded++;
      }
    
      img.onerror = function() {
        im.error();
        loaded++;
      }
    
      preloaded++;
    }
    
    
    
    // TODO func play()
    function play() {
      // запомним перманентные объекты
      for (let o of objects) {
    
        if (o.note || o.textnote) {
          let f = fmap.get(o.frameId);
    
          if (f.permanent) {
            o.permanent = true;
            o.order = f.order;
          }
          else {
            o.permanent = false;
          }
        }
      }
    
      if (! PLAY) {
        PLAY = true; 
        framesIterator = frames.values(); 
        lastFrame = framesIterator.next().value; 
        go();      
      }
      else {
        PLAY = false;
        redraw();
      }
    }
    
    
    
    // TODO centerToPoint() 
    function centerToPoint(xy1) {
      createMatrix();
      let xy2 = toWorld(screen.width / 2, screen.height / 2);
      let dx = xy2.x - xy1.x;
      let dy = xy2.y - xy1.y;
    
      translatey += dx * Math.sin(rot) + dy * Math.cos(rot);
      translatex += dx * Math.cos(rot) - dy * Math.sin(rot);
    
      createMatrix();
    }
    
 
    
    
    // TODO deleteAll() / selected
    function deleteAll() {
      objects.forEach(function(o) {
    
        if ( o.scalable) {
          if (o instanceof TShape) {
    
            if (o.object instanceof Im) {
              let elem = document.getElementById(o.object.id);
              elem.parentElement.removeChild(elem);
            }
            delete o.object;
          }
          objects.delete(o);
    
          if (o instanceof Im) {
            let elem = document.getElementById(o.id);
            elem.parentElement.removeChild(elem);
          }
        }
      });
    
      frames.clear();
      positions.clear();
      ofmap.clear();
      fmap.clear();
    
      groupId = 1;
      lastId = 1;
      frameId = 1;
      
      clearAllProcesses();
    }
  
    // TODO CLEAR ALL
    function clearAllProcesses() {
      createRect = false;
      createImage = false;
      createPoly = false;
      createText = false;
      pointi = 0;
      points = new Array();
      lastSelected = null;
      editedText = null;
      lastFrame = null;
      rect = null;
    
      for(let o of objects){
        o.selected = false;
      }
    
      PLAY = false;
    
      redraw();
    }
    
    
    window.addEventListener("resize", resizeCanvas, false);
    
    // TODO RESIZE
    function resizeCanvas() {
      screen.width = screen.clientWidth;
      screen.height = screen.clientHeight;
      createMatrix();
      redraw();
    }

    // TODO func MAIN()
    function init() {

      if (already) return;
      already = true;
   
      screen = document.getElementById(canv);
      g = screen.getContext("2d");
   
//      screenCopy = document.getElementById("copy");
//      g2 = screenCopy.getContext("2d");
    
      createMatrix();
    
      fs = ss = "#ffaa22";
    
      // If thie canvasContext class doesn't have  a fillRoundedRect, extend it now
      if (! g.constructor.prototype.fillRoundedRect) {
    
        // Extend the canvaseContext class with a fillRoundedRect method
        g.constructor.prototype.fillRoundedRect = 
          function (xx,yy, ww,hh, rad, fill, stroke) {
            if (typeof(rad) == "undefined") rad = 5;
            this.beginPath();
            this.moveTo(xx+rad, yy);
            this.arcTo(xx+ww, yy,    xx+ww, yy+hh, rad);
            this.arcTo(xx+ww, yy+hh, xx,    yy+hh, rad);
            this.arcTo(xx,    yy+hh, xx,    yy,    rad);
            this.arcTo(xx,    yy,    xx+ww, yy,    rad);
            this.closePath();
            if (stroke) this.stroke();  // Default to no stroke
            if (fill || typeof(fill)=="undefined") this.fill();  // Default to fill
        }; // end of fillRoundedRect method
      }
      
    /*  
     
      var poly1 = {
        regions: [
          [[50,50], [150,150], [190,50]],
          [[130,50], [290,150], [290,50]]
        ],
        inverted: false
      };
      var poly2 = {
        regions: [
          [[110,20], [110,110], [20,20]],
          [[130,170], [130,20], [260,20], [260,170]]
        ],
        inverted: false
      };
    
      let ps1 = [];
    
      ps1[0] = [50,40];
      ps1[1] = [150,170];
      ps1[2] = [190,45];
    
      let ps2 = [];
    
      ps2[0] = [190,40];
      ps2[1] = [280,160];
      ps2[2] = [320,30];  
    
      let p = {regions: [ps1, ps2], inverted: false};
    
      let res = PolyBool.intersect(poly1, poly2);
    */
    
    
    
    
      // TODO Loader setInterval
      intervalId = window.setInterval(function() { 
    
          if (loaded == preloaded) {
            //let elem = document.getElementById("loader");
            //elem.parentElement.removeChild(elem);
            //window.clearInterval(intervalId);
            START = true;
            redraw();
          }
        }, 
        2000
      );
      

      // TODO mousedown
      screen.addEventListener("mousedown", function(e){

        if (PLAY) {


          let w = getWorldXY(e);    
          worldX = w.x;
          worldY = w.y;
  
          let screenrect = screen.getBoundingClientRect();
          let x = e.clientX - screenrect.left;
          let y = e.clientY - screenrect.top;

          lastSelected = null;
          setLastSelected(lastSelected);

          setTransform(g);
              
          let setb = Array.from(objects);
          let ssetb = setb.sort(function(e, r) { return e.scalescale - r.scalescale;});
          let scale = getScale();
    
          for(let o of ssetb){
    
            if (o.scalable) {
              g.save();
    
              if (o.scalescale) {
                let xy = toWorld2(screen.width / 2, screen.height / 2);
                let dx = xy.x - o.xy.x;
                let dy = xy.y - o.xy.y;
                g.translate(-dx * o.scalescale * scale / 100, -dy * o.scalescale * scale / 100);
              }
    
              o.select(g, x, y);
              g.restore();
            }
          }

          lastSelected = getLastSelected();


          if (lastSelected && lastSelected.frameId != 0) {
            for (let f of frames) {
              if (f.id == lastSelected.frameId) {

                lastFrame = f;
  
                framesIterator = frames.values(); 
  
                while (framesIterator.next().value != lastFrame){}
  
                go();
              }
            }
          }
        
        
          if (! lastFrame.auto) {
    
            if (frameIntervalId == 0) {
    

              if (lastFrame.animation) {
                
                if (lastFrame == finalFrame) {
                  PLAY = false;
                  play();
                }
                else {
                  lastFrame = framesIterator.next().value; 
                  go();
                }
              }
            }
          }
    
          return;
        }
      });

   
      document.getElementById(canv).oncontextmenu = function (e) {
        return false;
      };
    
/*
      var fonts = ["Arial","Times New Roman","Verdana","Comic Sans MS","Agency FB", "Courier", "Cursive", "Impact", "Monospace", "Georgia"];
      var string = "";
      var select = document.getElementById(textProp + "f");
    
      for(let i = 0; i < fonts.length ; i++) {
        var opt = document.createElement('option');
        opt.value = opt.innerHTML = fonts[i];
        opt.style.fontFamily = fonts[i];
        select.add(opt);
      }
    
      fontChange();
*/
      
      let onfullscreenchange =  function(e){
        var fullscreenElement = 
          document.fullscreenElement || 
          document.mozFullscreenElement || 
          document.webkitFullscreenElement;
        var fullscreenEnabled = 
          document.fullscreenEnabled || 
          document.mozFullscreenEnabled || 
          document.webkitFullscreenEnabled;
        redraw();
      }
    
      screen.addEventListener("webkitfullscreenchange", onfullscreenchange);
      screen.addEventListener("mozfullscreenchange",    onfullscreenchange);
      screen.addEventListener("fullscreenchange",       onfullscreenchange);
    
      resizeCanvas();
      createMatrix();

      if (preload) {
        var res = preload.replace(/&&/g, "\\n");
        oldwidth = screen.width;
        oldheight = screen.height;

        Parse(res);
    
        if (frameId) {
          play();
        }
      }
    

    
    
      redraw();
    
    
    
      // TODO END END END
    }

    // TODO getWorldXY()
    function getWorldXY(e) {
        worldX = e.clientX;
        worldY = e.clientY;
        return {x: worldX, y: worldY};
    }

    //function getWorldX


    //Запустить отображение в полноэкранном режиме
    function launchFullScreen(element) {
      if(element.requestFullScreen) {
        element.requestFullScreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      }
    }
    
    // Выход из полноэкранного режима
    function cancelFullscreen() {
      if(document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if(document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
    
    let map;
    
    // TODO PARSE
    function Parse(s) { 
    
      map = new Map();
      sizefactor = 1;
      fmap.clear();
    
      JSON.parse(s, function(key, value) {
        let o;
    
        if (value.$type === "TShape") {
          o = TShape.fromJSON(value);
          let internal = map.get(o.internalId);
          o.object = internal;
          if (o.scalable) {
            objects.add(o);
          }
          objects.delete(internal);
          map.set(o.objectId, o);
          return o;
        }
        if (value.$type === "Text") {
          o = Text.fromJSON(value);
          if (o.scalable) objects.add(o);
          map.set(o.objectId, o);
          return o;
        }
        if (value.$type === "Rect") {
          o = Rect.fromJSON(value);
          if (o.scalable) objects.add(o);
          map.set(o.objectId, o);
          return o;
        }
        if (value.$type === "Im") {
          o = Im.fromJSON(value);
          if (o.scalable) objects.add(o);
          map.set(o.objectId, o);
          return o;
        }
        if (value.$type === "Poly") {
          o = Poly.fromJSON(value);
          if (o.scalable) objects.add(o);
          map.set(o.objectId, o);
          return o;
        }
        if (value.$type === "Frame") {
          o = Frame.fromJSON(value);
          fmap.set(o.id, o);
          frames.add(o);
          return o;
        }
        if (value.$type === "Position") {
          let p = Position.fromJSON(value);
          let o = map.get(p.objectId);
    
          if (p.id) {
            let f = fmap.get(p.id);
            ofmap.set(o.objectId * 1e6 + p.id, p);
          }
          else {
            ofmap.set(o.objectId * 1e6, p);
          }
          positions.add(p);
          return p;
        }
    
        if (key == "translatex") {
          translatex = value;
        }
        if (key == "translatey") {
          translatey = value;
        }
        if (key == "rotate") {
          rot = value;
        }
        if (key == "screenscale") {
          scale = value;
        }
        if (key == "screenwidth") {
          sizefactorx = oldwidth / value;
          if (sizefactor > sizefactorx) sizefactor = sizefactorx;
          pwidth = value;
        }
        if (key == "screenheight") {
          sizefactory = oldheight / value;
          if (sizefactor > sizefactory) sizefactor = sizefactory;
          pheight = value;
        }
    
        return value;
      });
    }
    
    
    
    // TODO ReadImage()  
    function ReadImage(fromdisk) { 
    
      if (fromdisk) {
    
        //Check the support for the File API support 
        if (window.File && window.FileReader && window.FileList && window.Blob) {

          keys["fileSelected"].click();
        }
      }
      else {
        let url = prompt("Enter image URL, please", "http://...");
    
        if (url) {
          if (lastSelected instanceof TShape && lastSelected.object instanceof Im) {
            document.getElementById(lastSelected.object.id).src = url;
            lastSelected.object.src = url;
          }
    
          if (lastSelected instanceof Im) {
            document.getElementById(lastSelected.id).src = url;
            lastSelected.src = url;
          }
          redraw();
        }
      }
    }
    
    let input;
    
    function setTransform(g) {
      g.resetTransform();
      g.scale(scale, scale);
      g.translate(translatex, translatey);
      g.rotate(rot);
    }

    keys["setTransform"] = setTransform;
    keys["ReadImage"] = ReadImage;
    keys["init"] = init;
    keys["redraw"] = redraw;
    keys["getScale"] = getScale;
    keys["setScale"] = setScale;
    keys["getRot"] = getRot;
    keys["setRot"] = setRot;
    keys["getTx"] = getTx;
    keys["setTx"] = setTx;
    keys["getTy"] = getTy;
    keys["setTy"] = setTy;
    keys["screen"] = screen;
    keys["setEditor"] = setEditor;
    keys["setNum"] = setNum;
    keys["getWorldXY"] = getWorldXY;
    keys["toWorld"] = toWorld;
    keys["toWorld2"] = toWorld2;
    keys["setLastOver"] = setLastOver;
    keys["createMatrix"] = createMatrix;
    keys["setEditedText"] = setEditedText;
    keys["setLastSelected"] = setLastSelected;
    keys["getLastSelected"] = getLastSelected;
    keys["objects"] = objects;
    keys["Im"] = Im;
    keys["Rect"] = Rect;
    keys["Poly"] = Poly;
    keys["Text"] = Text;
    keys["Shape"] = Shape;
    keys["TShape"] = TShape;
    keys["Frame"] = Frame;
    keys["Position"] = Position;
    keys["setLineW"] = setLineW;
    keys["deleteAll"] = deleteAll;
    keys["frames"] = frames;
    keys["ofmap"] = ofmap;
    keys["getFrameIntervalId"] = getFrameIntervalId;
    keys["go"] = go;
    keys["play"] = play;
    keys["setLastFrame"] = setLastFrame;
    keys["getLastFrame"] = getLastFrame;
    keys["positions"] = positions;
    keys["fmap"] = fmap;
    keys["getFinalFrame"] = getFinalFrame;
    keys["clearAllProcesses"] = clearAllProcesses;
    keys["getLastId"] = getLastId;
    keys["setTextPos"] = setTextPos;
    keys["getTextPos"] = getTextPos;
    keys["setSetLinePos"] = setSetLinePos;
    keys["setPLAY"] = setPLAY;
    keys["getPLAY"] = getPLAY;
    keys["incGroupId"] = incGroupId;
    keys["Parse"] = Parse;
    keys["stopLastFrame"] = stopLastFrame;
                
    
        
    return keys;
    
  });
    
  function test(){
    alert("in");
  }