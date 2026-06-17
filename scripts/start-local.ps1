$ErrorActionPreference = "Stop"

$node = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$server = Join-Path (Split-Path -Parent $PSScriptRoot) "server.js"

if (-not (Test-Path $node)) {
  throw "Node.js do runtime interno nao encontrado em: $node"
}

& $node $server
