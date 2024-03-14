import http from "http";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import readline from "readline";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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

const factorial = (n) => {
  return n === 0 ? 1 : n * factorial(n - 1);
};

handlers.set("/state", serveFile("state.html"));

handlers.set("/fact", (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  if (queryObject.k) {
    const k = Number(queryObject.k);
    const fact = factorial(k);
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify({k, fact}));
  } else {
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.end("Invalid request");
  }
});

handlers.set("/", serveFile("fact.html"));

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  for (let [route, handler] of handlers) {
    if (reqUrl.pathname.startsWith(route)) {
      handler(req, res);
      return;
    }
  }
  res.writeHead(404, {"Content-Type": "text/html"});
  res.end("<h1>Page not found</h1>");
});

server.listen(3000, () => {
  console.log(
    `Server running at http://localhost:3000/ in ${serverState} mode`
  );
});
