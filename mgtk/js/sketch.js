var s = function (p) {
  let name;
  let transformFunc;
  let startFrame;
  let targetII;

  p.setup = function () {
    name = p.folderName;
    p.createCanvas(1280, 560);
    p.frameRate(30);
    startFrame = p.frameCount;
  }

  function getCount() { return p.frameCount - startFrame };

  p.draw = function () {
    p.background(0);
    p.stroke(255);

    p.translate(p.width / 2, p.height / 2);

    if(getCount() % 60 == 0) {
      // targetII = Math.floor(p.random(-1, 2));
      targetII = Math.floor(p.random(-5, 2));
      transformFunc = p.random([
        function(tween, l) {
          p.rotate(tween * Math.PI * 2.0);
          return l;
        }
        ,
        function(tween, l) {
          if(tween < 0.5) {
            p.translate(0.0, tween * 300, 0.0);
          }
          else {
            p.translate(0.0, (1.0 - tween) * 300, 0.0);
          }
          return l;
        }
        ,
        function(tween, l) {
          p.translate(l / 2, 0);
          p.rotate(tween * Math.PI * 2.0);
          p.translate(-l / 2, 0);
          return l;
        }
        ,
        function(tween, l) {
          if(tween < 0.5) {
            return p.map(tween, 0.0, 0.5, 1.0, 0.1) * l;
            // p.scale(1.0 - tween, 1.0);
          }
          else {
            return p.map(tween, 0.5, 1.0, 0.1, 1.0) * l;
            // p.scale(tween, 1.0);
          }
        }
      ]);
    }

    let t = getCount() / 30.0;

    for(let ii = -1; ii <= 1; ii++) {
      let tween = (t * 0.5 % 1.0) * 2.0 - 1.0;
      let tweenp = 4.0;
      if(tween < 0) {
        tween = Math.pow(p.map(tween, -1, 0, 0, 1), tweenp) * 0.5;
      }
      else {
        if(ii == targetII) {
          tweenp = 1.0;
        }
        tween = 1.0 - Math.pow(p.map(tween, 0, 1, 1, 0), tweenp) * 0.5;
      }

      p.push();
      p.translate(ii * p.width / 3, 0);
      let l = 150;
      l = transformFunc(tween, l);
      p.ellipse(0, 0, 10);
      p.line(0,0,l,0);
      p.ellipse(l, 0, 10);
      p.pop();
    }
  }
};

var p080 = new p5(s);