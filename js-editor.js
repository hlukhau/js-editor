/*
    MIT License of Geometric library - https://github.com/HarryStevens/geometric?tab=readme-ov-file#polygonArea

*/

'use strict';


class canvasView {


    constructor(canvas, source) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        //this.image = new Image();
        //this.image.src = source.toDataURL("image/png");
        this.image = source;
        this.canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); return false;}
        this.isMove = false;
        this.x0 = 0.0;
        this.y0 = 0.0;
        this.x1 = 0.0;
        this.y1 = 0.0;
        this.w1 = this.image.width;
        this.h1 = this.image.height;
        this.mouseX = 0;
        this.mouseY = 0;
        this.scale = 1.0;
        this.grid = 10.0;

        this.ps = [];
        this.isCreateCountur = false;

        this.conturs = []
        this.selected


        this.canvas.addEventListener('mouseover', this.mouseuplistener.bind(this), {passive: true})
        this.canvas.addEventListener('mousedown', this.mousedownlistener.bind(this), {passive: true})
        this.canvas.addEventListener('mousemove', this.mousemovelistener.bind(this), {passive: true})
        this.canvas.addEventListener('mouseup', this.mouseuplistener.bind(this), {passive: true})
        this.canvas.addEventListener('dblclick', this.mouseupDBClickListener.bind(this), {passive: true})
        this.canvas.addEventListener('wheel', this.wheellistener.bind(this), {passive: true})



        this.x1 = -(this.image.width - this.canvas.width) / 2;
        this.y1 = -(this.image.height - this.canvas.height) / 2;
        this.x0 = this.x1 + this.w1 / 2;
        this.y0 = this.y1 + this.h1 / 2;

        var vertices = [[100, 100], [200, 300], [300, 0]];
        var area = geometric.polygonArea(vertices);
        console.log(
            'Square = ' + area +
            '   [200, 200] in polygone = ' + geometric.pointInPolygon([200, 200], vertices) +
            ' but [100, 200] in polygone = ' + geometric.pointInPolygon([100, 200], vertices)
        )

        this.draw();
    }

    mouseupDBClickListener(event) {
        this.isCreateCountur = false;
        this.conturs.push(this.ps)
        this.ps = []
        document.getElementById('btn_create_polygone').classList.toggle('pressed');
        this.draw();
    }

    mousedownlistener(event) {
        this.mouse(event);

        this.oldx = this.mouseX;
        this.oldy = this.mouseY;

        this.isMove = true;

        if (event.button == 0) {

            if (this.isCreateCountur) {
                this.ps.push([this.mouseModelGridX, this.mouseModelGridY]);
                this.draw();
            }

            this.selected = null;

            for (const contur of this.conturs) {

                if (geometric.pointInPolygon([
                    this.modelX(this.mouseX),
                    this.modelY(this.mouseY)
                ], contur)) {
                    this.selected = contur;
                }
            }

            if (this.selected != null) {
                this.draw();
            }
        }
    }

    mousemovelistener(event) {
        this.mouse(event);

        if (this.isMove) {
            let dx = this.mouseX - this.oldx;
            this.x1 += dx;

            let dy = this.mouseY - this.oldy;
            this.y1 += dy;

            this.x0 = this.x1 + this.w1 / 2;
            this.y0 = this.y1 + this.h1 / 2;
            this.scale = this.w1 / this.image.width;

            this.draw();

            this.oldx = this.mouseX;
            this.oldy = this.mouseY;

        }
        else {
            this.draw()
        }
    }

    mouseuplistener(event) {
        this.mouse(event);

        this.isMove = false;

        if (event.button == 2) {

            this.scale = this.w1 / this.image.width;
            var x = (this.mouseX - this.x1) / this.scale;
            var y = (this.mouseY - this.y1) / this.scale;
            console.log(x, y);
        }
    }

    wheellistener(e) {

        this.mouse(e);

        if (! this.isMove) {
            var delta = e.deltaY || e.detail || e.wheelDelta;

            if (delta < 0) {
                this.x1 = this.mouseX - (this.mouseX - this.x1) * 1.2;
                this.y1 = this.mouseY - (this.mouseY - this.y1) * 1.2;
                this.w1 *= 1.2;
                this.h1 *= 1.2;

                this.x0 = this.x1 + this.w1 / 2;
                this.y0 = this.y1 + this.h1 / 2;
                this.scale = this.w1 / this.image.width;
            }
            else {
                this.x1 = this.mouseX - (this.mouseX - this.x1) / 1.2;
                this.y1 = this.mouseY - (this.mouseY - this.y1) / 1.2;
                this.w1 /= 1.2;
                this.h1 /= 1.2;

                this.x0 = this.x1 + this.w1 / 2;
                this.y0 = this.y1 + this.h1 / 2;
                this.scale = this.w1 / this.image.width;
            }

            this.draw();
        }
    }

    mouse(e) {
        var boundings = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - boundings.left;
        this.mouseY = e.clientY - boundings.top;
    }


    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.image, this.x1, this.y1, this.w1, this.h1);
        this.drawAxis();
    }

    drawAxis() {
        this.line(this.x0 - 10000, this.y0, this.x0 + 10000, this.y0, 'red');
        this.line(this.x0, this.y0 - 10000, this.x0, this.y0 + 10000, 'red');

        var iw = this.canvas.width / this.scale;
        var step = 1;

        while (Math.floor(iw) / Math.floor(step) > 30 && step < 10000) {
            step *= 10;
        }

        //        console.log('width=' + iw + ' step=' + step + ' mouse x=' + this.modelX(this.mouseX) + ' y=' + this.modelY(this.mouseY));

        this.context.font = "10px serif";
        this.context.fillStyle = 'black'

        var minx = 0;
        var maxx = 0;
        var miny = 0;
        var maxy = 0;

        for (var x = 0; x > this.modelX(0) > 0; x -= step) {
            this.line(this.screenX(x), this.y0 - 5, this.screenX(x), this.y0 + 5, 'red')
            minx = x;

            if (x != 0) this.context.fillText("" + x, this.screenX(x) - 5, this.y0 - 7);
        }

        for (var x = 0; x < this.modelX(this.canvas.width); x += step) {
            this.line(this.screenX(x), this.y0 - 5, this.screenX(x), this.y0 + 5, 'red')
            maxx = x;
            if (x != 0) this.context.fillText("" + x, this.screenX(x) - 5, this.y0 - 7);
        }

        for (var y = 0; y > this.modelY(0) > 0; y -= step) {
            this.line(this.x0 - 5, this.screenY(y), this.x0 + 5, this.screenY(y), 'red')
            miny = y;
            if (y != 0) this.context.fillText("" + y, this.x0 + 7, this.screenY(y) + 4);
        }

        for (var y = 0; y < this.modelY(this.canvas.height); y += step) {
            this.line(this.x0 - 5, this.screenY(y), this.x0 + 5, this.screenY(y), 'red')
            maxy = y;
            if (y != 0) this.context.fillText("" + y, this.x0 + 7, this.screenY(y) + 4);
        }

        for (var x = minx; x <= maxx; x += step) {

            for (var y = miny; y <= maxy; y += step) {
                this.line(this.screenX(x), this.screenY(y), this.screenX(x) + 1, this.screenY(y) + 1, 'red')
            }
        }

        this.mouseModelGridX = Math.round(this.modelX(this.mouseX) / this.grid) * this.grid;
        this.mouseModelGridY = Math.round(this.modelY(this.mouseY) / this.grid) * this.grid;
        var mouseGridX = this.screenX(this.mouseModelGridX);
        var mouseGridY = this.screenY(this.mouseModelGridY);

        this.line(this.mouseX, this.mouseY, mouseGridX, mouseGridY, 'green');


        for (const contur of this.conturs) {

            this.polygon(contur);
        }


        if (this.isCreateCountur) {

            this.context.strokeStyle = 'red';
            this.context.fillStyle = 'white';

            this.polygon(this.ps);

            for (const pair of this.ps) {
                this.context.beginPath();
                this.context.arc(this.screenX(pair[0]), this.screenY(pair[1]), 4, 0, 2 * Math.PI);
                this.context.fill();
                this.context.stroke();
            }
        }
    }

    mLine(x1, y1, x2, y2, style) {
        this.context.beginPath();
        this.context.strokeStyle = style;
        this.context.lineWidth = 1;
        this.context.moveTo(screenX(x1), screenY(y1))
        this.context.lineTo(screenX(x2), screenY(y2))
        this.context.stroke();
    }

    line(x1, y1, x2, y2, style) {
        this.context.beginPath();
        this.context.strokeStyle = style;
        this.context.lineWidth = 1;
        this.context.moveTo(x1, y1)
        this.context.lineTo(x2, y2)
        this.context.stroke();
    }

    polygon(vertexes) {

        this.context.strokeStyle = 'black';
        this.context.fillStyle = 'gray';

        if (this.selected == vertexes) {
            this.context.strokeStyle = 'yellow';
        }

        this.context.beginPath();
        var first = true;

        for (var point of vertexes) {

            if (first) {
                this.context.moveTo(this.screenX(point[0]), this.screenY(point[1]));
                first = false;
            }
            else {
                this.context.lineTo(this.screenX(point[0]), this.screenY(point[1]));
            }
        }
        this.context.stroke();
        this.context.fill();
    }

    screenX(x) {
        return this.x0 + x * this.scale;
    }

    screenY(y) {
        return this.y0 + y * this.scale;
    }

    modelX(x) {
        return (x - this.x0) / this.scale;
    }

    modelY(y) {
        return (y - this.y0) / this.scale;
    }
};







window.onload = function () {

    // Definitions
    var image = document.getElementById('source');
    var canvas = document.getElementById("paint-canvas");

    var viewer = new canvasView(canvas, image);

    document.getElementById('btn_create_polygone')
        .addEventListener('click', (e) => {
        e.target.closest('button').classList.toggle('pressed');
        viewer.isCreateCountur = 1 - viewer.isCreateCountur;
        viewer.ps = []
    })

};



