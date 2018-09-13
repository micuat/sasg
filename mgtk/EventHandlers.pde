void keyPressed(KeyEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.keyPressed != null) globalSketch.keyPressed(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void keyReleased(KeyEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.keyReleased != null) globalSketch.keyReleased(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void keyTyped(KeyEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.keyTyped != null) globalSketch.keyTyped(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mouseClicked(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mouseClicked != null) globalSketch.mouseClicked(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mouseDragged(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mouseDragged != null) globalSketch.mouseDragged(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mouseMoved(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mouseMoved != null) globalSketch.mouseMoved(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mouseReleased(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mouseReleased != null) globalSketch.mouseReleased(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mouseWheel(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mouseWheel != null) globalSketch.mouseWheel(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void mousePressed(MouseEvent event) {
  try {
    nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

    nashorn.eval("var pAppletEvent = {};");
    Object pAppletEvent = nashorn.eval("this.pAppletEvent");
    Object jsObject = nashorn.eval("Object");
    ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", pAppletEvent, event);

    nashorn.eval("if(globalSketch.mousePressed != null) globalSketch.mousePressed(this.pAppletEvent)");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void oscEvent(OscMessage theOscMessage) {
  if (theOscMessage.checkAddrPattern("/livid/control")==true) {
   int index = theOscMessage.get(0).intValue();
   if (index < 20) {
     oscFaders[index] = theOscMessage.get(1).intValue() / 127.0;
   }
  }
  else if (theOscMessage.checkAddrPattern("/livid/note")==true) {
   int index = theOscMessage.get(0).intValue();
   if (index <= 35 && theOscMessage.get(1).intValue() > 0) {
     oscPreset = index;
   }
   else if (38 <= index && index <= 41 && theOscMessage.get(1).intValue() > 0) {
     seqOffset = index - 38;
   }
   else if (index < 57 && theOscMessage.get(1).intValue() > 0) {
     oscButton[index] = theOscMessage.get(1).intValue() > 0 ? 1 : 0;
   }
  }
  else 
  if (theOscMessage.checkAddrPattern("/face/points")==true) {
    for(int i = 0; i < 68; i++) {
      facePoints[i][0] = theOscMessage.get(i * 2 + 0).floatValue();
      facePoints[i][1] = theOscMessage.get(i * 2 + 1).floatValue();
    }
  }
  else if (theOscMessage.checkAddrPattern("/pose/points")==true) {
    int index = theOscMessage.get(0).intValue();
    if(index < 8)
    {
      for(int i = 0; i < 17; i++) {
        posePoints[index][i][0] = theOscMessage.get(i * 2 + 1).floatValue();
        posePoints[index][i][1] = theOscMessage.get(i * 2 + 2).floatValue();
      }
     }
  }
  //else if (theOscMessage.checkAddrPattern("/data")==true) {
  //  openPose = theOscMessage.get(0).stringValue();
  //}
  //try {
  //  nashorn.eval("for(var prop in pApplet) {if(!this.isReservedFunction(prop)) {globalSketch[prop] = pApplet[prop]}}");

  //  nashorn.eval("var theOscMessage = {}");
  //  Object theOscMessageObject = nashorn.eval("this.theOscMessage");
  //  Object jsObject = nashorn.eval("Object");
  //  ((Invocable)nashorn).invokeMethod(jsObject, "bindProperties", theOscMessageObject, (OscMessage)theOscMessage);

  //  nashorn.eval("if(globalSketch.oscEvent != null) globalSketch.oscEvent(this.theOscMessage)");
  //}
  //catch (Exception e) {
  //  e.printStackTrace();
  //}
}
