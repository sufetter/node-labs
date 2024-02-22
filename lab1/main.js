import http from "http";

const handlers = new Map();

handlers.set("/task2", (req, res) => {
  res.writeHead(200, {"Content-Type": "text/html"});
  res.end("<h1>Hello World</h1>");
});

handlers.set("/task3", (req, res) => {
  res.writeHead(200, {"Content-Type": "text/html"});
  let requestDetails = `
        <p>Method: ${req.method}</p>
        <p>URL: ${req.url}</p>
        <p>Version: HTTP/${req.httpVersion}</p>
        <p>Headers: ${JSON.stringify(req.headers)}</p>
    `;
  req.on("data", (chunk) => {
    requestDetails += `<p>Body: ${chunk.toString()}</p>`;
  });
  req.on("end", () => {
    res.end(requestDetails);
  });
});

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
