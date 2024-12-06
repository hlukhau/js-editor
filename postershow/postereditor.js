let PosterEditor = (function(keys, canv, file, textProp, imageProp, fillcolor) {

    let Im = keys["Im"];
    let Rect = keys["Rect"];    
    let Poly = keys["Poly"];    
    let Text = keys["Text"];    
    let Shape = keys["Shape"];    
    let TShape = keys["TShape"];    
    let Frame = keys["Frame"];
    let Position = keys["Position"];
    let textPos = 5;

    let already = false;    
    let viewerInit = keys["init"];
    let screen;
    let g;
    let getWorldXY = keys["getWorldXY"];
    let toWorld = keys["toWorld"];
    let toWorld2 = keys["toWorld2"];
    let createMatrix = keys["createMatrix"];
    let oldx = 0;
    let oldy = 0;
    let rect;
    let trect;
    let lastOver = null;
    let setLastOver = keys["setLastOver"];
    let editedText = null;
    let setEditedText = keys["setEditedText"];
    let multiSelect = false;
    let setTransform = keys["setTransform"];
    let getScale = keys["getScale"];
    let setScale = keys["setScale"];
    let getRot = keys["getRot"];
    let setRot = keys["setRot"];
    let getTx = keys["getTx"];
    let setTx = keys["setTx"];
    let getTy = keys["getTy"];
    let setTy = keys["setTy"];
    let setLineW = keys["setLineW"];
    let deleteAll = keys["deleteAll"];
    let frames = keys["frames"];
    let ofmap = keys["ofmap"];
    let getFrameIntervalId = keys["getFrameIntervalId"];
    let go = keys["go"];
    let play = keys["play"];
    let setLastFrame = keys["setLastFrame"];
    let getLastFrame = keys["getLastFrame"];
    let getFinalFrame = keys["getFinalFrame"];
    let clearAllProcesses = keys["clearAllProcesses"];
    let getLastId = keys["getLastId"];
    let setTextPos = keys["setTextPos"];
    let getTextPos = keys["getTextPos"];
    let setSetLinePos = keys["setSetLinePos"];
    let setPLAY = keys["setPLAY"];
    let getPLAY = keys["getPLAY"];
    let incGroupId = keys["incGroupId"];
    let Parse = keys["Parse"];
    let stopLastFrame = keys["stopLastFrame"];



    let createRect = false;
    let createImage = false;
    let createPoly = false;
    let points = new Array();
    let pointi = 0;
    let nofill = false;
    let createText = false;
    let polydraw = false;
    let objects = keys["objects"];
    let linew = 2;

    let moveMode = false;
    let rotateMode = false;
    let moveSelected = false;
    let rotateSelected = false;
    let scaleSelected = false;
    let worldX;
    let worldY;

    let lastSelected = null;
    let setLastSelected = keys["setLastSelected"];
    let getLastSelected = keys["getLastSelected"];
    let redraw = keys["redraw"];

    let num = 0;
    let tools = new Map();
    let panel1;
    let panel2;
    let panel3;
    let panel4;
    let fs;
    let ss;
    let timetools = new Map();

    let TIED = false;
    let FRAMETIED = false;
    let positions = keys["positions"];
    let fmap = keys["fmap"];


    keys["init"] = init2;
    keys["fontChange"] = fontChange;
    

    function lineWidthButton() {
      let res = prompt("Enter line width, please", linew);
    
      if (res) {
        linew = Number.parseInt(res);
        setLineW(linew);
    
        if (lastSelected instanceof TShape && lastSelected.object instanceof Poly) {
          lastSelected.object.linew = linew;
    
          redraw();
        }
      }
    }


    // TODO MAIN
    function init2() {
      screen = document.getElementById(canv);
      g = screen.getContext("2d");

      fs = ss = "#ffaa22";

      if (already) return;
      already = true;

      viewerInit();

      keys["setEditor"]();
      makePanels();
      let num = 0;
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("clearButton", "icons/clear.png", num++, "#bbb", "#ccc", "deleteAll(); redraw();");
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("rectButton", "icons/rect.png", num++, "#bbb", "#ccc", "rectButtonscript()");
      addtool("imageButton", "icons/image.png", num++, "#bbb", "#ccc", "imageButtonscript()");
      addtool("polyfButton", "icons/polyf.png", num++, "#bbb", "#ccc", "polyfButtonscript()");
      addtool("polyButton", "icons/poly.png", num++, "#bbb", "#ccc", "polyButtonscript()");
      addtool("textButton", "icons/text.png", num++, "#bbb", "#ccc", "textButtonscript()");
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("polyDraw", "icons/polydraw.png", num++, "#bbb", "#ccc", "polydrawButtonscript()");
      addtool("textDraw", "icons/text.png", num++, "#bbb", "#ccc", "textDrawButtonscript()");
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("frontButton", "icons/front.png", num++, "#bbb", "#ccc", "bringToFront(); redraw();");
      addtool("backButton", "icons/back.png", num++, "#bbb", "#ccc", "bringToBack(); redraw();");
      addtool("catButton", "icons/cat.png", num++, "#bbb", "#ccc", "deleteSelected();");
      addtool("groupButton", "icons/group.png", num++, "#bbb", "#ccc", "groupSelected();");
      addtool("ungroupButton", "icons/ungroup.png", num++, "#bbb", "#ccc", "ungroupSelected();");
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");

      addsmalltool("sm1", "icons/sm1.png", num, "#bbb", "#ccc", "setShadow();", 1); // shadow
      addsmalltool("sm2", "icons/sm2.png", num, "#bbb", "#ccc", "setColor();", 2); // color picker
      addsmalltool("sm3", "icons/sm3.png", num, "#bbb", "#ccc", "setLayerUp();", 3); // up offset
      addsmalltool("sm4", "icons/sm4.png", num++, "#bbb", "#ccc", "setLayerDown();", 4); // down offset
    
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("loadButton", "icons/load.png", num++, "#bbb", "#ccc", "loadFile();");
      addtool("saveButton", "icons/save.png", num++, "#bbb", "#ccc", "saveFile();");
      addtool("divButton1", "icons/div.png", num++, "#aaa", "#aaa", "");
      addtool("linewButton", "icons/linew.png", num++, "#bbb", "#ccc", "lineWidthButton();");
      
      num = 0;
      addtimetool("playButton", "icons/play.png", num++, "#bbb", "#ccc", "unselectAll(); play();", "Запуск презентации");
      addtimetool("plusButton", "icons/plus.png", num++, "#bbb", "#ccc", "addFrame();", "Добавить кадр");
      addtimetool("minusButton", "icons/minus.png", num++, "#bbb", "#ccc", "deleteFrame()", "Удалить кадр");
      addtimetool("fleftButton", "icons/fleft.png", num++, "#bbb", "#ccc", "leftFrame();", "Переместить кадр влево");
      addtimetool("frightButton", "icons/fright.png", num++, "#bbb", "#ccc", "rightFrame();", "Переместить кадр вправо");
      addtimetool("frameToObject", "icons/connect.png", num++, "#bbb", "#ccc", "connectFrameToObject();", "Добавить звуковое сопровождение");
      addtimetool("framesaveButton", "icons/framesave.png", num++, "#bbb", "#ccc", "tiedFrameMode();", "Сохранение настроек камеры");
      addtimetool("connectButton", "icons/tied.png", num++, "#bbb", "#ccc", "tiedMode();", "Сохранение настроек объектоа");
      keys["setNum"](num);

      let fileSelected = document.getElementById(file);
      keys["fileSelected"] = fileSelected;
  
      fileSelected.addEventListener("change", function (e) { 
        //Set the extension for the file 
        var fileExtension = /image.*/; 
        //Get the file object 
        var fileTobeRead = fileSelected.files[0];

        if (! fileTobeRead) return;

        if (fileTobeRead.name) {
          let url = "images/" + fileTobeRead.name;

          document.getElementById(lastSelected.object.id).src = url;
          lastSelected.object.src = url;

          keys["redraw"]();

          document.getElementById(imageProp).hidden = true;
        }

      });
  
      let cp = document.getElementById(fillcolor);
      cp.addEventListener("input", function() {
        
        if (lastSelected) {
          for (let o of objects) {
            if (o.selected) {
              if (o.object.nofill) {
                o.strokestyle = cp.value;
              }
              else {
                o.style = cp.value;
                o.strokestyle = cp.value;
              }
            }
          }
        }
        else {
          fs = ss = cp.value;
        }
        redraw();
      }, false);
  

      // TODO mousedown
      screen.addEventListener("mousedown", function(e){

        let lastFrame = getLastFrame();

        let w = getWorldXY(e);    
        worldX = w.x;
        worldY = w.y;

        let screenrect = screen.getBoundingClientRect();
        let x = e.clientX - screenrect.left;
        let y = e.clientY - screenrect.top;

        if (e.shiftKey) {
          if (Math.abs(y - oldY) < Math.abs(x - oldX)) y = oldY;
          else x = oldX;
        }
    
        oldY = y;
        oldX = x;
    
        eventX = x;
        eventY = y;
    
        if (lastOver) {
    
          eval(lastOver.script);
    
          // check new frame clivked
          if (lastOver == panel4) {
    
    
            if (getFrameIntervalId() == 0) {
              let x = 4 + num * 36 + 1;
              let y = screen.height - 56; 34
              let w = h = 32;
              let step = 34;
    
              let oldlf = getLastFrame();
              setLastFrame(null);
    
              for (let f of frames) {
                if (eventX > x && eventX < x + w) {
                  setLastFrame(f);
                  break;
                }
                x += step;
              }
              
              let lastFrame = getLastFrame();

              if (lastFrame /*&& oldlf != lastFrame*/) {
                go();
              }
    
              redraw();
            }
          }
          
    
          return;
        }
    
        createMatrix();
    
        var xy = toWorld(x,y);
        
        if (! getPLAY()) {
          if (createRect) {
    
            if (! rect) {
              rect = new Rect(0,0,0,0, fs);
              trect = new TShape(rect);
              let rectxy = toWorld(eventX, eventY);
              let xy = trect.toRectScreen(rectxy.x, rectxy.y);
              rect.x = xy.x;
              rect.y = xy.y;
              trect.selected = true;
              trect.style = fs;
              trect.strokestyle = ss;
              document.getElementById(fillcolor).value = rect.style;
              lastSelected = trect;
              setLastSelected(lastSelected);
              objects.add(trect);
              redraw();
              return;
            }
            else {
              trect.centered();
              rect = null;
              createRect = false;
              tools.get("rectButton").fix = false;
              redraw();
              return;
            }
          }
    
          if (createImage) {
            if (! rect) {
              rect = new Im("imins" + getLastId(), "", 0, 0, fs);
              trect = new TShape(rect);
              let rectxy = toWorld(eventX, eventY);
              let xy = trect.toRectScreen(rectxy.x, rectxy.y);
              rect.x = xy.x;
              rect.y = xy.y;
              trect.selected = true;
              trect.style = fs;
              trect.strokestyle = ss;
              document.getElementById(fillcolor).value = rect.style;
              lastSelected = trect;
              setLastSelected(lastSelected);
              objects.add(trect);
              redraw();
              return;
            }
            else {
              trect.centered();
              rect = null;
              createImage = false;
              tools.get("imageButton").fix = false;
              redraw();
              return;
            }
          }
    
          if (createPoly) {
    
            if (e.button === 0) {
    
              if (! rect && (! polydraw || polydraw && getLastFrame())) {
                rect = new Poly([points], fs);
                rect.nofill = nofill;
                trect = new TShape(rect);
                
                if (! polydraw) trect.selected = true;
                else {
                  //rect.linew = 10;
                  trect.frameId = lastFrame.id;
                  let p = new Position(trect);
                  ofmap.set(trect.objectId * 1e6 + lastFrame.id, p);
                  positions.add(p);
                  trect.note = true;
                }
                document.getElementById(fillcolor).value = rect.style;
                lastSelected = trect;
                setLastSelected(lastSelected);
                trect.style = fs;
                trect.strokestyle = ss;
                objects.add(trect);
              }
    
              let rectxy = toWorld(eventX, eventY);
              xy = trect.toRectScreen(rectxy.x, rectxy.y);        
              points[pointi] = [xy.x, xy.y];
              pointi++;
    
              rect.regions = [points];
              redraw();
              return;
            }
            
            if (e.button === 2) {
              createPoly = false;
              tools.get("polyButton").fix = false;
              tools.get("polyfButton").fix = false;
              tools.get("polyDraw").fix = false;
    
              // special centered
              // найдем габариты x,y,w,h
              let minx = points[0][0];
              let maxx = points[0][0];
              let miny = points[0][1];
              let maxy = points[0][1];
    
              for (let i = 1; i < points.length; i++) {
                if (points[i][0] < minx) minx = points[i][0];
                if (points[i][0] > maxx) maxx = points[i][0];
                if (points[i][1] < miny) miny = points[i][1];
                if (points[i][1] > maxy) maxy = points[i][1];
              }
    
              rect.x = minx;
              rect.y = miny;
              rect.w = maxx - minx;
              rect.h = maxy - miny;
    
              let rdx = -rect.w / 2 - rect.x;
              let rdy = -rect.h / 2 - rect.y;
    
              rect.x = -rect.w / 2;
              rect.y = -rect.h / 2;
    
              for (let i = 0; i < points.length; i++) {
                points[i][0] += rdx;
                points[i][1] += rdy;
              }
    
              trect.tx += rdx / trect.scale;
              trect.ty += rdy / trect.scale;
              trect.m[4] = trect.tx;
              trect.m[5] = trect.ty;
    
              rect = null;
              pointi = 0;
              points = new Array();
              redraw();
              return;
            }
          }
    
          if (createText) {
            rect = new Text("Text...", 520, 80);
            trect = new TShape(rect);
            let rectxy = toWorld(eventX, eventY);
            let xy = trect.toRectScreen(rectxy.x, rectxy.y);
            rect.x = xy.x;
            rect.y = xy.y;
            trect.selected = true;
            lastSelected = trect;
            setLastSelected(lastSelected);
            trect.style = fs;
            trect.strokestyle = ss;
            trect.centered();
            objects.add(trect);
            trect.centered();
    
            if (polydraw) {
              trect.frameId = lastFrame.id;
              let p = new Position(trect);
              ofmap.set(trect.objectId * 1e6 + lastFrame.id, p);
              positions.add(p);
              trect.textnote = true;
            }
    
            rect = null;
            createText = false;
            tools.get("textButton").fix = false;
            tools.get("textDraw").fix = false;
            redraw();
            return;
          }
          if (e.button === 2) {
            moveMode = true;
            rotateMode = true;
            oldx = xy.x;
            oldy = xy.y;
          }
        }
    
    
        if (e.button === 0) {
    
          if (e.ctrlKey) {
            multiSelect = true;
          }
          else {
            multiSelect = false;
          }
    
          // Selection
          g.resetTransform();
    
          let oldLastSelected = lastSelected;
    
          if (lastSelected && lastSelected instanceof TShape) {
            lastSelected.centered();
          }
    
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
    
          // jump to object frame
/*
          if (getPLAY()) {
    
            if (lastSelected && lastSelected.frameId != 0) {
              for (let f of frames) {
                if (f.id == lastSelected.frameId) {

                  console.log("frame found", f, lastSelected.frameId);
                  lastFrame = f;
                  setLastFrame(lastFrame);
    
                  framesIterator = frames.values(); 
    
                  while (framesIterator.next().value != lastFrame){}
    
                  go();
                  return;
                }
              }
            }
          }
*/          
    
          if (! getPLAY()) {
            if (! multiSelect) {
              
              if (lastSelected) {
    
                if (! lastSelected.selected) {
    
                  for(let o of objects){
                    o.selected = false;
                  }
                }
                lastSelected.selected = true;
    
                // Group selection
                if (lastSelected.group) {
    
                  for(let o of objects){
    
                    if (o.group == lastSelected.group) o.selected = true;
                  }
                }
    
                if (TIED) tieObject(lastSelected);
    
                moveSelected = true;
    
                oldEventX = x;
                oldEventY = y;
                oldx = xy.x;
                oldy = xy.y;
                document.getElementById(imageProp).hidden = true;
                document.getElementById(textProp).hidden = true;
    
                if (lastSelected != oldLastSelected) {
                  editedText = null;
                  setEditedText(editedText);
                }
                else {
    
                  if (editedText) {
    
                    if (lastSelected instanceof TShape) {
                      let xy1 = toWorld2(screen.width / 2, screen.height / 2);
                      let dx = xy1.x - lastSelected.xy.x;
                      let dy = xy1.y - lastSelected.xy.y;
                      xy.x += dx * lastSelected.scalescale * scale / 100;
                      xy.y += dy * lastSelected.scalescale * scale / 100;
                      textPos = lastSelected.setCursor(xy.x, xy.y);
                    }
    
                    editedText.sel = false;
                  }
                }
              }
              else {
    
                for(let o of objects){
                  o.selected = false;
                }
    
                editedText = null;
                setEditedText(editedText);
                document.getElementById(imageProp).hidden = true;
                document.getElementById(textProp).hidden = true;
              }
            }
            else {
              if (lastSelected) {
                lastSelected.selected = ! lastSelected.selected;
    
                // Group inverse selection
                if (lastSelected.group) {
    
                 for(let o of objects){
    
                    if (o.group == lastSelected.group) o.selected = lastSelected.selected;
                  }
                }
    
              }
              else {
    
                for(let o of objects){
                  o.selected = false;
                }
    
              }
            }
          }

          redraw();
        }
    
      });

      // TODO mousemove
      screen.addEventListener("mousemove", function(e){
    
        let screenrect = screen.getBoundingClientRect();
        let x = e.clientX - screenrect.left;
        let y = e.clientY - screenrect.top;

        getWorldXY(e);    

        let xy = toWorld(x,y);
        let dx = xy.x - oldx;
        let dy = xy.y - oldy;
    
        if (! dx && ! dy) return;
    
        eventX = x;
        eventY = y;
    
        let oldLO = lastOver;
        lastOver = null;
        setLastOver(null);    
    
        if (createPoly && polydraw && trect && rect) {
          let rectxy = toWorld(eventX, eventY);
          let xy = trect.toRectScreen(rectxy.x, rectxy.y);        
          points[pointi] = [xy.x, xy.y];
          pointi++;
    
          rect.regions = [points];
    
          redraw();
          return;
        }
    
    
        for (let o of objects) {
          if (! o.scalable) {
            if (o.select(g, x, y)) {
              lastOver = o;
            }
          }
        }
    
        if (lastOver) {
          document.getElementById(imageProp).hidden = true;
          document.getElementById(textProp).hidden = true;
          setLastOver(lastOver);
        }
    
        if (lastOver != oldLO || oldLO && ! lastOver || lastOver && !oldLO) {
          redraw();
        }
    
        if ((createRect || createImage) && rect) {
          let rectxy = toWorld(eventX, eventY);
          let xy = trect.toRectScreen(rectxy.x, rectxy.y);
          rect.w = xy.x - rect.x;
          rect.h = xy.y - rect.y;
          redraw();
          return;
        }
    
        if (moveMode) {
          rotateMode = false;
          let tx = getTx();
          let ty = getTy();
          let rot = getRot();
          ty += dx * Math.sin(rot) + dy * Math.cos(rot);
          tx += dx * Math.cos(rot) - dy * Math.sin(rot);
          setTx(tx);
          setTy(ty);
          oldx = xy.x;
          oldy = xy.y;
          changeFrame();
          redraw();
        }
    
        if (moveSelected) {
    
          for(let o of objects){
    
            if (o.selected) {
              o.move(dx, dy, {x: oldx, y: oldy}, xy);
              if (TIED) tieObject(o);
            }
          }
          oldx = xy.x;
          oldy = xy.y;
          oldEventX = x;
          oldEventY = y;
          redraw();
        }
      });
    
      // TODO mousewheel
      screen.addEventListener("mousewheel", function(e){
        getWorldXY(e);    

        let screenrect = screen.getBoundingClientRect();
        let x = e.clientX - screenrect.left;
        let y = e.clientY - screenrect.top;

        createMatrix();
        var xy1 = toWorld(x,y);
    
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    
        if (rotateMode) {
          moveMode = false;
          let a;
    
          if (delta > 0) a = -Math.PI / 16;
          else if (delta < 0) a = Math.PI / 16;
          else a = 0;
    
          rotateWorld(xy1, a, x, y);
    
          redraw();
        }
        else if (rotateSelected) {
          moveMode = false;
    
          if (lastSelected) {
    
            if (delta > 0) drot = Math.PI / 16;
            else if (delta < 0) drot = -Math.PI / 8;
            else drot = 0;
    
            for(let o of objects){
    
              if (o.selected) {
                let oldxy1 = xy1;
    
                if (o.scalescale) {
                  let xy = toWorld2(screen.width / 2, screen.height / 2);
                  let dx = xy.x - o.xy.x;
                  let dy = xy.y - o.xy.y;
                  xy1.x += dx * o.scalescale * scale / 100;
                  xy1.y += dy * o.scalescale * scale / 100;
                }
    
                o.rotate(drot, xy1.x, xy1.y);
                if (TIED) tieObject(o, xy1.x, xy1.y);
                xy1 = oldxy1;
              }
            }
          }
    
          redraw();
        }
        else if (scaleSelected) {
          moveMode = false;
           
          if (lastSelected) {
    
            if (delta > 0) dscale = 1 / 1.1;
            else if (delta < 0) dscale = 1.1;
    
            for(let o of objects){
    
              if (o.selected) {
                let oldxy1 = xy1;
    
                if (o.scalescale) {
                  let xy = toWorld2(screen.width / 2, screen.height / 2);
                  let dx = xy.x - o.xy.x;
                  let dy = xy.y - o.xy.y;
                  xy1.x += dx * o.scalescale * scale / 100;
                  xy1.y += dy * o.scalescale * scale / 100;
                }
    
                o.scaling(dscale, xy1.x, xy1.y);
                if (TIED) tieObject(o, xy1.x, xy1.y);
                xy1 = oldxy1;
              }
            }
          }
    
          redraw();
        }
        else if (moveMode) {
        }
        else {
    
          let a;
          let scale = getScale();
    
          if (delta > 0) a = 0.05 * scale;
          else if (delta < 0) a = -0.05 * scale;
          else a = 0;

          scaleWorld(xy1, a, x, y);
    
          redraw();
        }
      });
    
      // TODO mouseup
      screen.addEventListener("mouseup", function(e){
    
        if (moveMode) {
          moveMode = false;
          createMatrix();
        }
        if (rotateMode) {
          rotateMode = false;
          createMatrix();
        }
        if (moveSelected) {
          moveSelected = false;
        }
     
      });
    
      // TODO keyup
      window.addEventListener("keyup", function(e){
    
        // r
        if (e.keyCode == 82) {
          rotateSelected = false;
        }
    
        // q
        if (e.keyCode == 81) {
          rotateMode = false;
        }
    
        // s
        if (e.keyCode == 83) {
          scaleSelected = false;
        }
      });
    
      // TODO ondblclick
      window.addEventListener("dblclick", function(e){
        let lastFrame = getLastFrame();

        if (lastOver) {
          // check new frame clivked
          if (lastOver == panel4) {
    
            if (lastFrame) {
    
              let s = "30 30";
    
              if (lastFrame.animation || lastFrame.pause) {
                s = lastFrame.animation + " " + lastFrame.pause;
              }
    
              if (lastFrame.permanent) s += "p";
    
              let res = prompt("Enter (n n) animation and pause time (0 means 30sec. animation and manual control)", s);
    
              if (res) {
                if (res.indexOf("p") != -1) {
                  lastFrame.permanent = true;  
                }
                else lastFrame.permanent = false;
                let a = res.split(" ");
                let animation = Number.parseInt(a[0]);
                let pause = Number.parseInt(a[1]);
                lastFrame.animation = animation;
                lastFrame.pause = pause;
    
                //if (! animation) animation = 1;
                if (! pause) lastFrame.auto = false;  
                else lastFrame.auto = true;  
              }
              else {
                lastFrame.animation = 30;
                lastFrame.pause = 0;
                lastFrame.auto = false;  
              }
            }
            redraw();
          }
          return;
        }
    
        if (createPoly) {
          createPoly = false;
          tools.get("polyButton").fix = false;
          tools.get("polyfButton").fix = false;
          rect = null;
          pointi = 0;
          points = new Array();
          redraw();
          return;
        }
    
        let xy = toWorld(eventX, eventY);
    
    
    
        if (lastSelected instanceof TShape && lastSelected.object instanceof Rect) {
        }
    
    
        if (lastSelected instanceof TShape && lastSelected.object instanceof Text) {
    
          if (editedText) {
            let f = document.getElementById(textProp);
            f.style.left = worldX;
            f.style.top = worldY;
            f.hidden = false;
          }
    
          editedText = lastSelected.object;
          setEditedText(editedText);

          if (editedText) {
    
            if (lastSelected instanceof TShape) {
              let scale = getScale();
              let xy1 = toWorld2(screen.width / 2, screen.height / 2);
              let dx = xy1.x - lastSelected.xy.x;
              let dy = xy1.y - lastSelected.xy.y;
              xy.x += dx * lastSelected.scalescale * scale / 100;
              xy.y += dy * lastSelected.scalescale * scale / 100;

              textPos = lastSelected.setCursor(xy.x, xy.y);
            }
          }
          redraw();
          
        }
    
    
        if (lastSelected instanceof TShape && lastSelected.object instanceof Im || lastSelected instanceof Im) {
    
          let f = document.getElementById(imageProp);
          f.style.left = worldX;
          f.style.top = worldY;
          f.hidden = false;
        }
      });
    
      // TODO keydown
      window.addEventListener("keydown", function(e){
    
    
        if (e.key == 'm' && e.ctrlKey) {
    
          launchFullScreen(screen);
          return;
        }
    
    
        if (editedText) {
    
          if (e.key == 'a' && e.ctrlKey) {
            editedText.sel = true;
            editedText.selp1 = 0;
            editedText.selp2 = editedText.str.length;
            redarw();
            return;
          }
          if (e.key == 'c' && e.ctrlKey) {
            if (editedText.sel) {
              navigator.clipboard.writeText(editedText.getSelected());
            }
            else navigator.clipboard.writeText(editedText.str);
            return;
          }
          if (e.key == 'v' && e.ctrlKey) {
            navigator.clipboard.readText().then(
              result => {
                if (editedText) {
                  if (editedText.sel) {
                    editedText.deleteSelected();
                  }
                  editedText.str = textInsert(editedText.str, result, textPos);
                  editedText.calcWH();
                  lastSelected.centered();
                }
              }
            );
            return;
          }
    
          if (e.keyCode == 13) {
            editedText.str = textInsert(editedText.str, "\n", textPos++); 
            editedText.calcWH();
          }
          else if (e.keyCode == 37) { // left
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            else {
              editedText.sel = false;
            }
            if (textPos > 0) textPos--;
            if (e.shiftKey) {
              editedText.selp2 = textPos;
            }
          }
          else if (e.keyCode == 39) { //right
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            else {
              editedText.sel = false;
            }
            if (textPos < editedText.str.length) textPos++;
            if (e.shiftKey) {
              editedText.selp2 = textPos;
            }
          }
          else if (e.keyCode == 40) { // down
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            else {
              editedText.sel = false;
            }
            while (textPos < editedText.str.length) {
              if (editedText.str[textPos] == '\n') {
                if (textPos < editedText.str.length) {
                  textPos++;
                }
                setSetLinePos(true);
                setTextPos(textPos);
                redraw();
                redraw();
                textPos = getTextPos();
                return;
              } 
              textPos++;
            }
          }
          else if (e.keyCode == 38) { // up
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            else {
              editedText.sel = false;
            }
            while (textPos > 0) {
              textPos--;
              if (editedText.str[textPos] == '\n') {
    
                setSetLinePos(true);
                setTextPos(textPos);
                redraw();
                redraw();
                textPos = getTextPos();
                return;
              } 
            }
          }
          else if (e.keyCode == 8) { // backspace
            if (editedText.sel) {
              textPos = editedText.deleteSelected();
            }
            else editedText.str = textBackspace(editedText.str, textPos--); 
            editedText.calcWH();
          }
          else if (e.keyCode == 46) { // delete
            if (editedText.sel) {
              textPos = editedText.deleteSelected();
            }
            else editedText.str = textDelete(editedText.str, textPos); 
            editedText.calcWH();
          }
          else if (e.keyCode == 36) { // home
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            setSetLinePos(true);
            setTextPos(textPos);
            editedText.linePos = 0;
            redraw();
            redraw();
            textPos = getTextPos();
            return;
          }
          else if (e.keyCode == 35) { // end
            if (e.shiftKey) {
              if (! editedText.sel) {
                editedText.sel = true;
                editedText.selp1 = textPos;
              }
            }
            setSetLinePos(true);
            setTextPos(textPos);
            editedText.linePos = 1000;
            redraw();
            redraw();
            textPos = getTextPos();
            return;
          }
          else if (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18 || e.keyCode == 27 || e.keyCode == 33 || e.keyCode == 34) { // shift
          }
          else {
            if (editedText.sel) {
              textPos = editedText.deleteSelected();
            }
            editedText.str = textInsert(editedText.str, e.key, textPos++); 
            editedText.calcWH();
          }
    
          setTextPos(textPos);
          redraw();
        }
        else {
    
          // r
          if (e.keyCode == 82) {
            rotateSelected = true;
          }
    
          // q
          if (e.keyCode == 81) {
            rotateMode = true;
          }
    
          // s
          if (e.keyCode == 83) {
            scaleSelected = true;
          }
    
          if (e.key == "Escape") {
            tools.get("rectButton").fix = false;
            tools.get("imageButton").fix = false;
            tools.get("polyButton").fix = false;
            tools.get("polyfButton").fix = false;
            tools.get("textButton").fix = false;
            clearAllProcesses();
          }
        }
      });

      keys["redraw"]();
    }

    // TODO unselectAll() / selected
    function unselectAll() {
      objects.forEach(function(o) {
        o.selected = false;
      });
      lastSelected = null;
      setLastSelected(lastSelected);
      editedText = null;
    }

    function logoscript() { window.location.href = 'http://cloudtechnology.by'; } 
    function rectButtonscript() {unselectAll(); createRect = true; tools.get('rectButton').fix = true; /*fs = '#555555'; ss = 'rgba(0,0,0,0)';*/ redraw();}
    function imageButtonscript() {unselectAll(); createImage = true; tools.get('imageButton').fix = true; /*fs = '#ffaa22'; ss = 'rgba(0,0,0,0)';*/ redraw();}
    function polyfButtonscript() {unselectAll(); createPoly = true; tools.get('polyfButton').fix = true; /*fs = '#0000ff'; ss = 'rgba(0,0,0,0)';*/ nofill = false; redraw();}
    function polyButtonscript() {unselectAll(); createPoly = true; tools.get('polyButton').fix = true; /*fs = 'rgba(0,0,0,0)'; ss = '#ffff55';*/ nofill = true; polydraw = false; redraw();}
    function polydrawButtonscript() {if (getLastFrame()) {unselectAll(); createPoly = true; tools.get('polyDraw').fix = true; /*fs = 'rgba(0,0,0,0)'; ss = '#ffff55';*/ nofill = true; polydraw = true; redraw();}}
    function textDrawButtonscript() {if (getLastFrame()) {unselectAll(); createText = true; tools.get('textDraw').fix = true; /*fs = 'rgba(0,0,0,0)'; ss = '#ffff55';*/ polydraw = true; redraw();}}
    function textButtonscript() {unselectAll(); createText = true; tools.get('textButton').fix = true; /*fs = '#ffff55'; ss = 'rgba(0,0,0,0)';*/ redraw();}

    // TODO func bringToFront()
    function bringToFront() {
      if (lastSelected) {
        let os = new Set();

        objects.forEach(function(o, i) {
          if (o.selected) {
            os.add(o);
            objects.delete(o);
          }
        });
        
        os.forEach(function(o, i) {
          objects.add(o);
        });

        redraw();
      }
    }
    
    // TODO func bringToBack()
    function bringToBack() {
      let lastSelected = getLastSelected();

      if (lastSelected) {
        let os = new Set();

        objects.forEach(function(o, i) {
          if (o.selected) {
            os.add(o);
            objects.delete(o);
          }
        });

        objects.forEach(function(o, i) {
          os.add(o);
        });

        objects.clear();

        os.forEach(function(o, i) {
          objects.add(o);
        });
      }
    }


    // TODO addtimetool
    function addtimetool(id, src, i, a, b, script, title) {
      let tmp = new Im(id, src, 4 + i * 36, panel3.y + 4, a, b, script);
      tmp.setTitle(title)
      tmp.scalable = false;
      tmp.script = script;
      objects.add(tmp);
      tools.set(id, tmp);
      timetools.set(id, -56);
    }
    
    // TODO addtool
    function addtool(id, src, i, a, b, script) {
      let tmp = new Im(id, src, 140 + i * 36, 4, a, b, script);
      tmp.scalable = false;
      tmp.script = script;
      objects.add(tmp);
      tools.set(id, tmp);
    }
    
    // TODO addsmalltool
    function addsmalltool(id, src, i, a, b, script, n) {
      let tmp;
      if (n == 1) {
        tmp = new Im(id, src, 140 + i * 36, 4, a, b, script);
      }
      if (n == 2) {
        tmp = new Im(id, src, 140 + i * 36, 4 + 16, a, b, script);
      }
      if (n == 3) {
        tmp = new Im(id, src, 140 + 16 + i * 36, 4, a, b, script);
      }
      if (n == 4) {
        tmp = new Im(id, src, 140 + 16 + i * 36, 4 + 16, a, b, script);
      }
      
      tmp.scalable = false;
      tmp.script = script;
      objects.add(tmp);
      tools.set(id, tmp);
    }
    
    // TODO addFrame
    function addFrame() {
      let lastFrame = getLastFrame();

      let frame = new Frame();
      frames.add(frame);

      if (lastFrame) {
        framesIterator = frames.values(); 
        let prev = framesIterator.next();
        let next = framesIterator.next();
    
        while (prev.value != lastFrame){
          prev = next;
          next = framesIterator.next();
        }
    
        if (next && next.value != frame) swapFrames(next.value, frame);
        frame = next.value;
      }

      lastFrame = frame;
      setLastFrame(frame);
      redraw();
    }


    // TODO func swapFrames(a, b)
    function swapFrames(a, b) {
    
      let tx = a.tx;
      let ty = a.ty;
      let s = a.scale;
      let r = a.rot;
      let xy = a.xy;
      let id = a.id;
      let au = a.auto;
      a.tx = b.tx;
      a.ty = b.ty;
      a.scale = b.scale;
      a.rot = b.rot;
      a.id = b.id;
      a.xy = b.xy;
      a.auto = b.auto;
      b.tx = tx;
      b.ty = ty;
      b.scale = s;
      b.rot = r;
      b.xy = xy;
      b.id = id;
      b.auto = au;
    }
    
    function storeOtoP(o,p) {
      p.tx = o.tx;
      p.ty = o.ty;
      p.scale = o.scale;
      p.rot = o.rot;
      p.xy.x = o.xy.x;
      p.xy.y = o.xy.y;
      p.scalescale = o.scalescale;
      o.createRectMatrix();
      p.c = o.toRectWorld(0, 0);
    }
    

    // TODO func tieObject()
    function tieObject(o) {
    
      if (! getLastFrame()) return;
    
      let ok = true;
    
      for (let p of positions) {
    
        // exist
        if (p.objectId == o.objectId && p.id == getLastFrame().id) {
          storeOtoP(o,p);
          ok = false;
        }
      }
    
      // new position
      if (ok) {
        let init = ofmap.get(o.objectId * 1e6);
    
        // imitial position
        if (! init){
          init = new Position(o);
          init.f = null;
          init.id = 0;
          init.order = 0;
          positions.add(init);
        }
    
        let p = new Position(o);
    
        // acselerating map
        ofmap.set(o.objectId * 1e6, init);
        ofmap.set(o.objectId * 1e6 + p.id, p);
        positions.add(p);
      }
    }
    
    // TODO func connectFrameToObject()
    function connectFrameToObject() {
    
      if (lastSelected/* && frameId*/) {
    
        let res = prompt("Enter number of frame to be connected and mp3", 1);
        
        if (res) {
          let arr = res.split(" ");

          if (arr.length > 0) {
            lastSelected.frameId = Number.parseInt(arr[0]);

            if (arr.length > 1) {
              let sound = arr[1];

              window.fetch(sound)
              .then(response => response.arrayBuffer())
              .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
              .then(audioBuffer => {
                lastSelected.buffer = audioBuffer;
              });
            }
          }
        }
      }
    }
   
    // TODO func tiedFrameMode()
    function tiedFrameMode() {
    
      tools.get('framesaveButton').fixstyle = "#f00";
    
      if (tools.get('framesaveButton').fix) {
        tools.get('framesaveButton').fix = false;
        FRAMETIED = false;
      }
      else {
        tools.get('framesaveButton').fix = true;
        FRAMETIED = true;
        changeFrame();
      }
    
      redraw();
    }
    
    
    // TODO func tiedMode()
    function tiedMode() {
      if (getLastFrame()) {
        tools.get('connectButton').fixstyle = "#f00";
    
        if (tools.get('connectButton').fix) {
          tools.get('connectButton').fix = false;
          TIED = false;
        }
        else {
          tools.get('connectButton').fix = true;
          TIED = true;
        }
    
        redraw();
      }
    }
    
    // TODO func leftFrame()
    function leftFrame() {
      let lastFrame = getLastFrame();

      if (lastFrame && lastFrame != frames.values().next().value) {
    
        let prev;
    
        for (let f of frames) {
    
          if (lastFrame == f) break;
    
          prev = f;
        }
    
        swapFrames(lastFrame, prev);
        lastFrame = prev;
        setLastFrame(lastFrame);
      }
    
      redraw();
    }
    
    // TODO func rightFrame()
    function rightFrame() {
      let lastFrame = getLastFrame();
    
      let prev = null;
      let next = null;
    
      if (lastFrame && lastFrame != getFinalFrame()) {
        for (let f of frames) {
    
          next = f;
          if (prev) break;
    
          if (lastFrame == f) prev = f;
        }
    
        swapFrames(lastFrame, next);
        lastFrame = next;
        setLastFrame(lastFrame);

        redraw();
      }
    }
    
    // TODO func changeFrame()
    function changeFrame() {
      let lastFrame = getLastFrame();

      if (FRAMETIED && lastFrame) {
        lastFrame.tx = getTx(); 
        lastFrame.ty = getTy(); 
        lastFrame.rot = getRot(); 
        lastFrame.scale = getScale();
        lastFrame.xy = toWorld2(screen.width / 2, screen.height / 2);
      }
    }
    
    // TODO func deleteFrame()
    function deleteFrame() {
      let lastFrame = getLastFrame();
    
      if (lastFrame) {
    
        for (let p of positions) {
    
          // exist
          if (p.id == lastFrame.id) {
    
            ofmap.forEach(function(v, k) {
              if (v == p) ofmap.delete(k);
            });
            positions.delete(p);
          }
        }
    
        frames.delete(lastFrame); 
        fmap.delete(lastFrame.id);
        lastFrame = null; 
        setLastFrame(lastFrame);

        redraw();
      }
    }


    // TODO rotateWorld() 
    function rotateWorld(xy1, a, x, y) {
      let rot = getRot();
      rot += a;
      setRot(rot);
      createMatrix();
      var xy2 = toWorld(x,y);
      let dx = xy2.x - xy1.x;
      let dy = xy2.y - xy1.y;

      let tx = getTx();
      let ty = getTy();
      ty += dx * Math.sin(rot) + dy * Math.cos(rot);
      tx += dx * Math.cos(rot) - dy * Math.sin(rot);
      setTx(tx);
      setTy(ty);
      createMatrix();
    }
    
    // TODO factorWorld() 
    function factorWorld(g, a, x, y) {
    
      var xy1 = toWorld(x,y);
      g.scale(a, a);
    
      var xy2 = toWorld(x,y);
      let dx = xy2.x - xy1.x;
      let dy = xy2.y - xy1.y;
    }
    
    // TODO scaleWorld() 
    function scaleWorld(xy1, a, x, y) {
    
      let scale = getScale();
      scale += a;
      setScale(scale);
      createMatrix();

      var xy2 = toWorld(x,y);
      let dx = xy2.x - xy1.x;
      let dy = xy2.y - xy1.y;

      let tx = getTx();
      let ty = getTy();
      let rot = getRot();
      ty += dx * Math.sin(rot) + dy * Math.cos(rot);
      tx += dx * Math.cos(rot) - dy * Math.sin(rot);
      setTx(tx);
      setTy(ty);
      createMatrix();
    }

    // TODO func makePanels()
    function makePanels(){
      panel1 = new Rect(0, 0, screen.width, 40, "#aaa", "#aaa");
      panel1.scalable = false;
      panel1.shadow = true;
      panel1.id = "panel1";
      objects.add(panel1);
    
      panel2 = new Rect(0, screen.height - 20, screen.width, 20, "#aaa", "#aaa");
      panel2.scalable = false;
      panel2.id = "panel2";
      objects.add(panel2);
    
      panel3 = new Rect(0, screen.height - 60, screen.width, 40, "#aaa", "#aaa");
      panel3.scalable = false;
      panel3.id = "panel3";
      objects.add(panel3);
    
      let logo = new Im("imLogo", "icons/logo2.png", 6, 4, "#aaa", "#bbb");
      logo.scalable = false;
      logo.script = "logoscript();";
      objects.add(logo);

      let x = 4 + num * 36;
      panel4 = new Rect(x, screen.height - 58, screen.width - x - 4, 36, "#999", "#999");
      panel4.scalable = false;
      panel4.id = "panel4";
      objects.add(panel4);
    }

    // TODO func setLayerUp()
    function setLayerUp() {
      let scale = getScale();

      for (let o of objects) {
        if (o.selected) {
          if (o.scalescale < 40) {
    
            let xy = toWorld2(screen.width / 2, screen.height / 2);
            let dx = xy.x - o.xy.x;
            let dy = xy.y - o.xy.y;
    
            let tdx = -dx * o.scalescale * scale / 100;
            let tdy = -dy * o.scalescale * scale / 100;
            o.scalescale += 10; 
    
            o.xy.x = xy.x + tdx * 100 / o.scalescale / scale;
            o.xy.y = xy.y + tdy * 100 / o.scalescale / scale;
    
            if (TIED) tieObject(o);
          }
        }
      }
      redraw();
    }
    
    // TODO func setLayerDown()
    function setLayerDown() {
      let scale = getScale();
      let rot = getRot();

      for (let o of objects) {
        if (o.selected) {
          if (o.scalescale > 9.9) {
    
            let xy = toWorld2(screen.width / 2, screen.height / 2);
            let dx = xy.x - o.xy.x;
            let dy = xy.y - o.xy.y;
    
            let tdx = -dx * o.scalescale * scale / 100;
            let tdy = -dy * o.scalescale * scale / 100;
    
            o.scalescale -= 10; 
    
            let tdx2 = -dx * o.scalescale * scale / 100;
            let tdy2 = -dy * o.scalescale * scale / 100;
    
            dx = tdx2 - tdx;
            dy = tdy2 - tdy;
    
            tdx = dx * Math.cos(rot) - dy * Math.sin(rot);
            tdy = dx * Math.sin(rot) + dy * Math.cos(rot);
    
            o.tx += tdx;
            o.ty += tdy;
    
            if (TIED) tieObject(o);
          } 
        }
      }
      redraw();
    }

    // TODO func setShadow()
    function setShadow() {
      for (let o of objects) {
        if (o.selected) {
          if (! o.shadow) o.shadow = true; 
          else o.shadow = false; 
        }
      }
      redraw();
    }

    // TODO func setColor()
    function setColor() {
      let cp = document.getElementById(fillcolor);
    
      if (lastSelected) {
        let o = lastSelected;
    
        if (o instanceof TShape) {
          if (o.object.nofill) {
            cp.value = o.strokeStyle;
          }
          else {
            cp.value = o.fillStyle;
          }
          
          cp.click();
        }
      }
      cp.click();
    }

    // TODO func fontChange()
    function fontChange() {
    
      if (editedText) {
        var x = document.getElementById(textProp + "f").selectedIndex;
        var y = document.getElementById(textProp + "f").options;
        document.getElementById(textProp + "f").style.fontFamily = y[x].text;
        editedText.font = y[x].text;
        lastFont = y[x].text;
        redraw();
      }
    }

    // TODO func instextInsertert()
    function textInsert(main_string, ins_string, pos) {
      if(typeof(pos) == "undefined") {
        pos = 0;
      }
      if(typeof(ins_string) == "undefined") {
        ins_string = "";
      }
      return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
    }
    
    // TODO func intextBackspacesert()
    function textBackspace(main_string, pos) {
      return main_string.slice(0, pos - 1) + main_string.slice(pos);
    }
    
    // TODO func textDelete()
    function textDelete(main_string, pos) {
      return main_string.slice(0, pos) + main_string.slice(pos + 1);
    }

    // TODO deleteSelected
    function deleteSelected() {
    
      objects.forEach(function(o) {
        if (o.selected) {
    
          for (let p of positions) {
    
            // exist
            if (p.objectId == o.objectId) {
    
              ofmap.forEach(function(v, k) {
                if (Math.floor(k / 1e6) == o.objectId) {
                  ofmap.delete(k);
                }
              });
              positions.delete(p);
            }
          }
    
    
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
    
        lastSelected = null;
      });
    
      redraw();
    }

    // TODO groupSelected
    function groupSelected() {
      let g = incGroupId();
    
      objects.forEach(function(o) {
        if (o.selected) {
          o.group = g;
          o.object.group = g;
        }
      });
      redraw();
    }
    
    // TODO ungroupSelected
    function ungroupSelected() {
    
      objects.forEach(function(o) {
        if (o.selected) {
          o.group = 0;
          o.object.group = 0;
        }
      });
      redraw();
    }

    // TODO saveFile()  
    function saveFile() {
      let v = [];
    
      v.push({"translatex": getTx()});
      v.push({"translatey": getTy()});
      v.push({"rotate": getRot()});
      v.push({"screenscale": getScale()});
      v.push({"screenwidth": screen.width});
      v.push({"screenheight": screen.height});
    
      objects.forEach(function(o, i) {
    
        if (o.scalable) {
          if (o instanceof TShape) {
            v.push(o.object);
          }
          v.push(o);
        }
      });
    
      frames.forEach(function(f, i) {
        v.push(f);
      });
    
      positions.forEach(function(f, i) {
        v.push(f);
      });
    
    
      // TODO STRING TO
      let str = JSON.stringify( v );
    
      var res = str.replace(/\\n/g, "&&");
    
      let datastr = "let data = '";
      datastr += res;
      datastr += "';";
     
      saveData(datastr, "data.txt");
    }
    
    function saveData(data, fileName) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        blob = new Blob([data], {type: "text/plain"});
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    window.addEventListener("resize", resizeCanvas, false);
    
    // TODO RESIZE
    function resizeCanvas() {
      screen.width = screen.clientWidth;
      screen.height = screen.clientHeight;
      createMatrix();

      panel1.w = screen.width;
      panel2.y = screen.height - 20;
      panel2.w = screen.width;
      panel3.y = screen.height - 60;
      panel3.w = screen.width;
      panel4.y = screen.height - 58;
      panel4.w = screen.width - 240;
      
      timetools.forEach(function(value, key) {
        tools.get(key).y = screen.height + value;
      });  

      redraw();
    }

    // TODO loadFile()  
    function loadFile() {
    
      ReadText();
    }

    // TODO ReadText()  
    function ReadText() { 
    
      //Check the support for the File API support 
      if (window.File && window.FileReader && window.FileList && window.Blob) {
    
      input = document.createElement("input");
      input.type = "file";
      input.id = "dynamicFile";
      let div = document.getElementById("form");
      div.appendChild(input);
    
      input.click();
    
      input.addEventListener("change", function (e) { 
    
          //Set the extension for the file 
          var fileExtension = /text.plain/; 
          //Get the file object 
          var fileTobeRead = input.files[0];
    
          //Check of the extension match 
          if (fileTobeRead.type.match(fileExtension)) { 
            //Initialize the FileReader object to read the 2file 
            var fileReader = new FileReader(); 
            fileReader.onload = function (e) { 
    
              deleteAll();
              loaded = 0;
              preloaded = 0;
              oldwidth = screen.width;
              oldheight = screen.height;
              //screen.width = screen.height = 0;
              START = false;
              frames.clear();
              sizefactor = 1;
    
              let str = fileReader.result.substring(12, fileReader.result.length - 2);
              var res = str.replace(/&&/g, "\\n");
    
              Parse(res);
    
              START = false;
              resizeCanvas();
    
              createMatrix();
              redraw();
            } 
    
            fileReader.readAsText(fileTobeRead); 
          } 
    
          let div = document.getElementById("form");
          div.removeChild(input);
    
        }, false);
      } 
    }






    return keys;
});