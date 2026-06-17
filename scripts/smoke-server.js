const { spawn } = require("child_process");

const port = 4181;
const child = spawn(process.execPath, ["server.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let settled = false;

function finish(error) {
  if (settled) return;
  settled = true;
  child.kill();
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("Servidor local respondeu com index.html.");
}

child.stderr.on("data", (chunk) => {
  finish(chunk.toString());
});

child.stdout.on("data", async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}`);
    const body = await response.text();
    if (!response.ok || !body.includes("Terreiro360")) {
      finish(`Resposta inesperada: ${response.status} ${body.slice(0, 80)}`);
      return;
    }
    finish();
  } catch (error) {
    finish(error.message);
  }
});

setTimeout(() => finish("Servidor nao respondeu dentro do tempo esperado."), 5000);
