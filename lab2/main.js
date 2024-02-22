import http from "http";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const handlers = new Map();

const serveFile =
  (filename, contentType = "text/html", directory = "pages") =>
  (_, res) => {
    fs.readFile(path.join(__dirname, directory, filename), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error: ${err.message}`);
      } else {
        res.writeHead(200, {"Content-Type": contentType});
        res.end(data);
      }
    });
  };

handlers.set("/html", serveFile("index.html"));
handlers.set("/png", serveFile("pic.png", "image/png", "."));
handlers.set("/api/name", (_, res) => {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Lobunets Daniil && Gigachad");
});
handlers.set("/xmlhttprequest", serveFile("xmlhttprequest.html"));
handlers.set("/fetch", serveFile("fetch.html"));
handlers.set("/async_fetch", serveFile("async_fetch.html"));

const server = http.createServer((req, res) => {
  if (handlers.has(req.url)) {
    handlers.get(req.url)(req, res);
  } else {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
