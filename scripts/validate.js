const fs = require("fs");
const path = require("path");

const required = [
  "index.html",
  "server.js",
  "src/app.js",
  "src/styles.css",
  "docs/gcp-setup.md",
  "firestore.rules",
];

const missing = required.filter((file) => !fs.existsSync(path.join(__dirname, "..", file)));

if (missing.length) {
  console.error(`Arquivos obrigatorios ausentes: ${missing.join(", ")}`);
  process.exit(1);
}

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
if (!html.includes('id="app"') || !html.includes("src/app.js")) {
  console.error("index.html nao aponta para a aplicacao corretamente.");
  process.exit(1);
}

console.log("Validacao estrutural concluida.");
