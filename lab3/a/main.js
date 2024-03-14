import http from "http";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import readline from "readline";

const __dirname = import.meta.dirname;

const validStates = ["dev", "prod", "stop", "test", "idle"];
let serverState =
  process.argv.find((arg) => validStates.includes(arg)) || "dev";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  if (validStates.includes(input)) {
    serverState = input;
    console.log(`Server state changed to ${serverState}`);
  } else if (input === "exit") {
    console.log("See you next time...");
    process.exit(0);
  } else {
    console.log(
      "Invalid state. Please enter one of the following states: dev, prod, stop, test, idle"
    );
  }
});

const handlers = new Map();

const serveFile =
  (filename, contentType = "text/html", directory = "./") =>
  (_, res) => {
    fs.readFile(
      path.join(__dirname, directory, filename),
      "utf-8",
      (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end(`Error: ${err.message}`);
        } else {
          const rendered = ejs.render(data, {state: serverState});
          res.writeHead(200, {"Content-Type": contentType});
          res.end(rendered);
        }
      }
    );
  };

handlers.set("/state", serveFile("state.html"));

const server = http.createServer((req, res) => {
  if (handlers.has(req.url)) {
    handlers.get(req.url)(req, res);
  } else {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(3000, () => {
  console.log(
    `Server running at http://localhost:3000/ in ${serverState} mode`
  );
});
