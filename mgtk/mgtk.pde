import javax.script.ScriptEngineManager;
import javax.script.ScriptEngine;
import javax.script.ScriptContext;
import javax.script.ScriptException;
import javax.script.Invocable;

import java.lang.NoSuchMethodException;
import java.lang.reflect.*;

import java.util.ArrayList;
import java.util.List;

import java.io.IOException;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

import processing.pdf.*;

import com.ning.http.client.*;

import processing.awt.PSurfaceAWT;

import peasy.PeasyCam;

import toxi.physics3d.*;
import toxi.physics3d.behaviors.*;
import toxi.physics3d.constraints.*;
import toxi.geom.*;

import oscP5.*;
import netP5.*;

import geomerative.*;

import codeanticode.syphon.*;

import processing.video.*;

import themidibus.*;

public float[] oscFaders = new float[20];
public int oscPreset = 0;
public int[] oscButton = new int[57];
public int seqOffset = 0;
public float[][] facePoints = new float[68][2];
public float[][][] posePoints = new float[4][17][2];
public int[] poseMillis = new int[4];
public String openPose = "";

MidiBus myBus;

public ArrayList<Movie> movies = new ArrayList<Movie>();
public Capture cam;

public OscP5 oscP5;
NetAddress myRemoteLocation;

private static ScriptEngineManager engineManager;
private static ScriptEngine nashorn;

public static String VERSION = "0.1";

public PGraphicsPDF gPdf;

private static ArrayList<String> libPaths = new ArrayList<String>();
private static ArrayList<String> scriptPaths = new ArrayList<String>();
private static long prevModified;

public String drawMode = "p2d"; // "p2d" / "webgl"
public int newWidth, newHeight;

public PApplet that = this;

public String folderName = "js";

public SyphonServer syphonServer;

public PShape warehouseShape;

boolean libInited = false;

float frameRate() {
  return frameRate;
}

void setup() {
  noSmooth();
  hint(DISABLE_TEXTURE_MIPMAPS);
  hint(DISABLE_DEPTH_TEST);

  //smooth();
  //hint(ENABLE_TEXTURE_MIPMAPS);

  oscP5 = new OscP5(this, 13000);

  RG.init(this);

  size(400, 400, P3D);
  //size(850, 1150, PDF, "../CC_97_Book_of_Pi_2/bookofpi-10million-text.pdf");
  //gPdf = (PGraphicsPDF)g;
  surface.setResizable(true);
  frameRate(60);


  libPaths.add(sketchPath("libs/event-loop-nashorn.js"));
  libPaths.add(sketchPath("libs/shader-helper.js"));
  libPaths.add(sketchPath("libs/synaptic.min.js"));
  libPaths.add(sketchPath("libs/regression.min.js"));

  scriptPaths.add(sketchPath(folderName + "/sketch.js"));

  syphonServer = new SyphonServer(this, "mgtk");

  myBus = new MidiBus(this, "USB MIDI Interface", "USB MIDI Interface"); // Create a new MidiBus using the device names to select the Midi input and output devices respectively.
}

public void loadVideos(int i) {
  println(sketchPath() + "/videos");
  File[] files = listFiles(sketchPath() + "/data/videos");
  println(files.length);
  //for (int i = 0; i < files.length; i++)
  if (i < files.length)
  {
    File f = files[i];
    println(f.getName());
    //println(i);
    Movie myMovie = new Movie(this, sketchPath() + "/data/videos/" + f.getName());
    myMovie.stop();
    //myMovie.loop();
    movies.add(myMovie);
  }
}

void setupCamera() {
  String[] cameras = Capture.list();

  if (cameras == null) {
    println("Failed to retrieve the list of available cameras, will try the default...");
    cam = new Capture(this, 1280, 720);
  } else if (cameras.length == 0) {
    println("There are no cameras available for capture.");
    exit();
  } else {
    println("Available cameras:");
    printArray(cameras);

    if(cameras.length > 15) {
      println("loading HD cam");
      // cam = new Capture(this, 1280, 720, "USB Capture HDMI", 30);
      for(int i = 0; i < cameras.length; i++) {
        if(cameras[i].startsWith("name=USB Capture HDMI")) {
          cam = new Capture(this, cameras[i]);
          break;
        }
      }
    }
    else {
      println("loading builtin cam");
      cam = new Capture(this, cameras[0]);
    }

    // Start capturing the images from the camera
    cam.start();
  }
}

void setupModel() {
  PShape sOrg = loadShape("models/warehouse.obj");
  PShape s = createShape(GROUP);
  s.beginShape();
  for (int i = 0; i < sOrg.getChildCount(); i++) {
    //println(s.getChild(i).getChildCount());
    PShape sc = createShape();
    sc.beginShape(LINE_STRIP);
    sc.stroke(255);
    for (int j = 0; j < sOrg.getChild(i).getVertexCount(); j++) {
      PVector v = sOrg.getChild(i).getVertex(j);
      sc.vertex(v.x, v.y, v.z);
    }
    sc.endShape();
    s.addChild(sc);
  }
  warehouseShape = s;
}

// Called every time a new frame is available to read
void movieEvent(Movie m) {
  m.read();
}

void initNashorn() {
  String[] options = new String[] { "--language=es6" };
  jdk.nashorn.api.scripting.NashornScriptEngineFactory  factory = new jdk.nashorn.api.scripting.NashornScriptEngineFactory();
  nashorn = (jdk.nashorn.api.scripting.NashornScriptEngine) factory.getScriptEngine(options);

  try {
    // init placehoders
    nashorn.eval("var pApplet = {}; var globalSketch = {};");
    Object global = nashorn.eval("this.pApplet");
    Object jsObject = nashorn.eval("Object");
    // calling Object.bindProperties(global, this);
    // which will "bind" properties of the PApplet object
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", global, (PApplet)this);

    // Array.prototype.includes
    // nashorn.eval("Array.prototype.includes = function (val){return this.indexOf(val) != -1;}");

    // console.log is print
    nashorn.eval("var console = {}; console.log = print;");

    nashorn.eval("var alternateSketch = new function(){};");

    // PConstants
    nashorn.eval("var PConstantsFields = Packages.processing.core.PConstants.class.getFields();");
    nashorn.eval("for(var i = 0; i < PConstantsFields.length; i++) {alternateSketch[PConstantsFields[i].getName()] = PConstantsFields[i].get({})}");

    // **_ARROW in p5.js
    nashorn.eval("alternateSketch.UP_ARROW = alternateSketch.UP");
    nashorn.eval("alternateSketch.DOWN_ARROW = alternateSketch.DOWN");
    nashorn.eval("alternateSketch.LEFT_ARROW = alternateSketch.LEFT");
    nashorn.eval("alternateSketch.RIGHT_ARROW = alternateSketch.RIGHT");

    // static methods
    nashorn.eval("var PAppletFields = pApplet.class.getMethods();");
    nashorn.eval(
      "for(var i = 0; i < PAppletFields.length; i++) {" +
      "var found = false;" +
      "  for(var prop in pApplet) {" +
      "    if(prop == PAppletFields[i].getName() ) found = true;" +
      "  }" +
      "  if(!found){"+
      "    alternateSketch[PAppletFields[i].getName()] = PAppletFields[i];" +
      "    eval('alternateSketch[PAppletFields[i].getName()] = function() {" +
      "      if(arguments.length == 0) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'();" +
      "      if(arguments.length == 1) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'(arguments[0]);" +
      "      if(arguments.length == 2) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'(arguments[0], arguments[1]);" +
      "      if(arguments.length == 3) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'(arguments[0], arguments[1], arguments[2]);" +
      "      if(arguments.length == 4) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'(arguments[0], arguments[1], arguments[2], arguments[3]);" +
      "      if(arguments.length == 5) return Packages.processing.core.PApplet.'+PAppletFields[i].getName()+'(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);" +
      "    }')" +
      "  }" +
      "}");

    // overwrite random
    nashorn.eval("alternateSketch.random = function() {" +
      "  if(arguments.length == 1) {" +
      "    if(Array.isArray(arguments[0])) {" +
      "      let index = Math.floor(Math.random() * arguments[0].length);" +
      "      return arguments[0][index];" +
      "    }" +
      "    else {" +
      "      return Math.random() * arguments[0];" +
      "    }" +
      "  }" +
      "  else if(arguments.length == 2) return alternateSketch.map(Math.random(), 0, 1, arguments[0], arguments[1]);" +
      "}");

    // overwrite randomGaussian
    nashorn.eval("alternateSketch.randomGaussian = function (m, v) {" +
      "  if (m === undefined) return pApplet.randomGaussian();" +
      "  else if (v === undefined) return pApplet.randomGaussian() + m;" +
      "  else return pApplet.randomGaussian() * v + m;" +
      "}");

    // overwrite constrain (int/float arity signature problem)
    nashorn.eval("alternateSketch.constrain = function(x, xl, xh) {" +
      "  return Math.min(Math.max(x, xl), xh);" +
      "}");

    // overwrite ellipse for short handed circle
    nashorn.eval("alternateSketch.ellipse = function() {" +
      "  if(arguments.length == 3) return pApplet.ellipse(arguments[0], arguments[1], arguments[2], arguments[2]);" +
      "  if(arguments.length == 4) return pApplet.ellipse(arguments[0], arguments[1], arguments[2], arguments[3]);" +
      "}");

    // createVector
    nashorn.eval("alternateSketch.createVector = function() {" +
      "  let x = 0, y = 0, z = 0;" +
      "  if(arguments.length == 2) {x = arguments[0]; y = arguments[1];}" +
      "  else if(arguments.length == 3) {x = arguments[0]; y = arguments[1]; z = arguments[2];}" +
      "  return new Packages.processing.core.PVector(x, y, z);" +
      "}");

    // push / pop
    nashorn.eval("alternateSketch.push = function() {alternateSketch.pushMatrix(); alternateSketch.pushStyle();}");
    nashorn.eval("alternateSketch.pop = function() {alternateSketch.popMatrix(); alternateSketch.popStyle();}");

    // createCanvas reads draw mode
    nashorn.eval("alternateSketch.P2D = 'p2d';");
    nashorn.eval("alternateSketch.WEBGL = 'webgl';");
    nashorn.eval("alternateSketch.createCanvas = function(w, h, mode) {"+
      "  alternateSketch.width = w; alternateSketch.height = h;" +
      "  pApplet.newWidth = w; pApplet.newHeight = h; pApplet.drawMode = mode;" +
      "}");

    // define const to tell if it's livejs or p5.js
    nashorn.eval("alternateSketch.isLiveJs = true;");

    // utility
    // avoids standard functions like setup/draw/... as they will be overwritten in the script
    // also avoids ellipse, color to define separately
    nashorn.eval("this.isReservedFunction = function (str) {" +
      "  var isArgument_ = function (element) { return str === element; };" +
      "  return ['ellipse', 'color', 'random', 'randomGaussian', 'setup', 'draw', 'keyPressed', 'keyReleased', 'keyTyped', 'mouseClicked', 'mouseDragged', 'mouseMoved', 'mousePressed', 'mouseReleased', 'mouseWheel', 'oscEvent'].some(isArgument_);" +
      "}");

    // p5js entry point
    nashorn.eval("var p5 = function(sketch) {sketch(alternateSketch); globalSketch = alternateSketch; return alternateSketch;}");

    // p5.Vector
    nashorn.eval("p5.Vector = Packages.processing.core.PVector;");
    // random2D dirty fix - all the PVector functions should be bound to p5.Vector
    nashorn.eval("p5.Vector.random2D = function() { return Packages.processing.core.PVector.random2D(); }");
    // random3D dirty fix
    nashorn.eval("p5.Vector.random3D = function() { return Packages.processing.core.PVector.random3D(); }");

    // overwrite color (int/float arity signature problem)
    // does not support hex/string colors
    // but this is SLOW
    nashorn.eval("alternateSketch.color = function() {" +
      "  if(arguments.length == 1) return pApplet.color(new java.lang.Float(arguments[0]));" +
      "  else if(arguments.length == 2) return pApplet.color(new java.lang.Float(arguments[0]), new java.lang.Float(arguments[1]));" +
      "  else if(arguments.length == 3) return pApplet.color(new java.lang.Float(arguments[0]), new java.lang.Float(arguments[1]), new java.lang.Float(arguments[2]));" +
      "  else if(arguments.length == 4) return pApplet.color(new java.lang.Float(arguments[0]), new java.lang.Float(arguments[1]), new java.lang.Float(arguments[2]), new java.lang.Float(arguments[3]));" +
      "}");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void draw() {
  //if(frameCount < 42) loadVideos(frameCount);

  if (libInited == false) {
    setupCamera();
    setupModel();
    surface.setLocation(100, 100);

    try {
      initNashorn();
      readLibs(libPaths);
      libInited = true;
    }
    catch (IOException e) {
      e.printStackTrace();
    }
  }
  try {
    readFiles(scriptPaths);
  }
  catch (IOException e) {
    e.printStackTrace();
  }
  stroke(255);
  //background(0);

  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {alternateSketch[prop] = pApplet[prop]}}");
    if (drawMode == "webgl") {
      translate(width / 2, height / 2);
    }
    if (nashorn.eval("alternateSketch.draw") != null)
      nashorn.eval("alternateSketch.draw();");
  }
  catch (ScriptException e) {
    e.printStackTrace();
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

private static byte[] encoded;
public static String readFile(String path) throws IOException {
  long lastModified = Files.getLastModifiedTime(Paths.get(path)).toMillis();
  if (prevModified < lastModified || encoded == null) {
    encoded = Files.readAllBytes(Paths.get(path));
    println("updated at " + lastModified);
    prevModified = lastModified;

    try {
      nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {alternateSketch[prop] = pApplet[prop]}}");
      nashorn.eval(new String(encoded, StandardCharsets.UTF_8));
      nashorn.eval("alternateSketch.setup();");
      print("script loaded in java");
    }
    catch (ScriptException e) {
      e.printStackTrace();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
  return new String(encoded, StandardCharsets.UTF_8);
}

public void readLibs(ArrayList<String> paths) throws IOException {
  println("loading libraries");

  for (String path : paths) {
    encoded = Files.readAllBytes(Paths.get(path));

    try {
      nashorn.eval(new String(encoded, StandardCharsets.UTF_8));
    }
    catch (ScriptException e) {
      e.printStackTrace();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
}

public void readFiles(ArrayList<String> paths) throws IOException {
  long lastModified = 0;
  for (String path : paths) {
    long modified = Files.getLastModifiedTime(Paths.get(path)).toMillis();
    if (modified > lastModified) lastModified = modified;
  }
  if (prevModified < lastModified || encoded == null) {
    println("updated at " + lastModified);
    prevModified = lastModified;

    try {
      nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {alternateSketch[prop] = pApplet[prop]}}");
    }
    catch (ScriptException e) {
      e.printStackTrace();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
    for (String path : paths) {
      encoded = Files.readAllBytes(Paths.get(path));

      try {
        nashorn.eval(new String(encoded, StandardCharsets.UTF_8));
      }
      catch (ScriptException e) {
        e.printStackTrace();
      }
      catch (Exception e) {
        e.printStackTrace();
      }
    }
    try {
      nashorn.eval("if(alternateSketch.preload !== undefined) alternateSketch.preload();");
      nashorn.eval("alternateSketch.setup();");
      surface.setSize(newWidth, newHeight);
    }
    catch (ScriptException e) {
      e.printStackTrace();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
}

boolean midiDebugOut = true;

void noteOn(int channel, int pitch, int velocity) {
  if (midiDebugOut) println(str(pitch) + " pressed");
  int index = pitch;
  if (index <= 35) {
    oscPreset = index;
  }
  else if (38 <= index && index <= 41) {
    seqOffset = index - 38;
  }

  if (index < 57) {
    oscButton[index] = 1;
  }
}

void noteOff(int channel, int pitch, int velocity) {
  int index = pitch;
  if (index < 57) {
    oscButton[index] = 0;
  }
}

void controllerChange(int channel, int number, int value) {
  if (midiDebugOut) println(str(number) + " changed to " + str(value));
  int index = number;
  if (index < 20) {
    oscFaders[index] = value / 127.0;
  }
}
