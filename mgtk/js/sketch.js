var s = function (p) {
  let name;

  function Agent () {
    this.transformFunc;
    this.lineFunc;
    this.sigFunc;
  }
  let transformFunc;
  let lineFunc;
  let sigFunc;
  let startFrame;
  let targetII;
  let agents = [];
  let theVideo;
  let tintR, tintG, tintB;

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(1280/2, 560/2);
    p.frameRate(30);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    let t = getCount() / 30.0;
    if (getCount() % 30 == 0) {
      tintR = p.random(255);
      tintG = p.random(255);
      tintB = p.random(255);
      targetII = Math.floor(p.random(-1, 2));
      // if(theVideo != undefined) theVideo.stop();
      // theVideo = p.movies[Math.floor(p.random(p.movies.length))];
      // theVideo.loop();
    }
    if (getCount() % 30 == 0) {
      // targetII = Math.floor(p.random(-1, 2));
      {
        transformFunc = p.random([
          function (tween, l) {
            p.rotate(tween * Math.PI * 2.0);
            return l;
          }
          ,
          function (tween, l) {
            if (tween < 0.5) {
              p.translate(0.0, tween * 300, 0.0);
            }
            else {
              p.translate(0.0, (1.0 - tween) * 300, 0.0);
            }
            return l;
          }
          ,
          function (tween, l) {
            p.translate(l / 2, 0);
            p.rotate(tween * Math.PI * 2.0);
            p.translate(-l / 2, 0);
            return l;
          }
          ,
          function (tween, l) {
            if (tween < 0.5) {
              return p.map(tween, 0.0, 0.5, 1.0, 0.1) * l;
            }
            else {
              return p.map(tween, 0.5, 1.0, 0.1, 1.0) * l;
            }
          }
        ]);

        sigFunc = p.random([
          function (dx, tw) {
            return Math.sin(dx * 0.1 + tw * 10.0);
          }
          ,
          function (dx, tw) {
            return Math.sin(dx * 0.1);
          }
          ,
          function (dx, tw) {
            return p.random(-1, 1);
          }
        ]);
        lineFunc = p.random([
          function (tween, l) {
            p.ellipse(0, 0, 5);
            p.line(0, 0, l, 0);
            p.ellipse(l, 0, 5);
          }
          ,
          // function (tween, l) {
          //   p.ellipse(0, 0, 5);
          //   if (tween < 0.5) {
          //     p.line(0, 0, p.map(tween, 0.0, 0.5, 1.0, 0.1) * l, 0);
          //   }
          //   else {
          //     p.line(0, 0, p.map(tween, 0.5, 1.0, 0.1, 1.0) * l, 0);
          //   }
          //   p.ellipse(l, 0, 5);
          // }
          // ,
          // function (tween, l) {
          //   p.ellipse(0, 0, 5);
          //   p.line(tween * l, 0, (1.0 - tween) * l, 0);
          //   p.ellipse(l, 0, 5);
          // }
          // ,
          // function (tween, l) {
          //   p.ellipse(0, 0, 5);
          //   p.push();
          //   p.rotate(tween * Math.PI * 2.0);
          //   p.line(0, 0, l, 0);
          //   p.pop();
          //   p.ellipse(l, 0, 5);
          // }
          // ,
          function (tween, l) {
            p.ellipse(0, 0, 5);
            let tw;
            if (tween < 0.5) {
              tw = tween * 2.0;
            }
            else {
              tw = 2.0 - tween * 2.0;
            }
            p.noFill();
            p.beginShape(p.POINTS);
            for (let dx = 0.0; dx < l; dx += 1.0) {
              let y = Math.sin(dx / l * Math.PI) * sigFunc(dx, tw, l) * tw;
              p.vertex(dx, y * 50);
            }
            p.endShape();
            p.fill(255);
            p.ellipse(l, 0, 5);
          }
        ]);
      }
    }

    p.background(0);
    p.stroke(255);
    p.strokeWeight(2);

    p.translate(p.width / 2, p.height / 2);

    // p.image(p.movies[0], -213,-213,426,426);

    for (let ii = -1; ii <= 1; ii++) {
      let tween = (t * 1.0 % 1.0) * 2.0 - 1.0;
      let tweenp = 2.0;
      if (tween < 0) {
        tween = Math.pow(p.map(tween, -1, 0, 0, 1), tweenp) * 0.5;
      }
      else {
        if (ii == targetII) {
          tweenp = 1.0;
        }
        tween = 1.0 - Math.pow(p.map(tween, 0, 1, 1, 0), tweenp) * 0.5;
      }

      p.push();
      p.translate(ii * p.width / 3, 0);
      p.translate(-50, 0);
      // if (ii == targetII) {
      //   let alpha = p.map(getCount() % 240, 220, 240, 1.0, 0.0);
      //   if(alpha > 1.0) alpha = 1.0;
      //   alpha = Math.pow(alpha, 4.0);
      //   // p.tint(tintR * alpha, tintG * alpha, tintB * alpha);
      //   // p.image(theVideo, -135,-265,370,560);
      //   // p.tint(255, 255, 255);
      // }
      let l = 100;
      l = transformFunc(tween, l);
      lineFunc(tween, l);

      p.pop();
    }

    p.syphonServer.sendScreen();
  }
};

var p080 = new p5(s);