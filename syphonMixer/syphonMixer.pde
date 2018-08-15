// Use in combination with MultipleServers

import codeanticode.syphon.*;

int nClients = 4;
PGraphics[] canvas;
SyphonClient[] clients;

void setup() {
  size(400, 400, P3D);

  canvas = new PGraphics[nClients];
  for (int i = 0; i < nClients; i++) {
    canvas[i] = createGraphics(200, 200, P2D);
  }

  // Create syhpon clients to receive the frames.
  clients = new SyphonClient[nClients];
  for (int i = 0; i < nClients; i++) { 
    clients[i] = new SyphonClient(this, "MultipleServers", "Processing Syphon."+i);
  }
}

void draw() {
  if (frameCount % 60 == 0) {
    // needs to be in other thread
    HashMap<String, String>[] allServers = SyphonClient.listServers();

    int nServers = allServers.length;

    if (nServers != nClients) {

      canvas = new PGraphics[nServers];
      clients = new SyphonClient[nServers];


      for (int i = 0; i < allServers.length; i++) {

        String appName = allServers[i].get("AppName");
        String serverName = allServers[i].get("ServerName");

        clients[i] = new SyphonClient(this, appName, serverName);
      }

      nClients = nServers;
    }
  }

  background(0);
  blendMode(ADD);
  for (int i = 0; i < nClients; i++) {
    if (clients[i].newFrame()) {
      //tint(255, 255.0 / nClients);
      canvas[i] = clients[i].getGraphics(canvas[i]);
      //image(canvas[i], 200 * (i % 2), 200 * (i / 2));
      image(canvas[i], 0, 0);
    }
  }
}
