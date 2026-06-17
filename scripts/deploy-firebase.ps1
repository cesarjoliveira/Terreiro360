$ErrorActionPreference = "Stop"

$projectId = $env:FIREBASE_PROJECT_ID

if (-not $projectId) {
  throw "Defina FIREBASE_PROJECT_ID com o ID do projeto GCP/Firebase antes do deploy."
}

$firebase = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebase) {
  throw "Firebase CLI nao encontrado. Instale com: npm install -g firebase-tools"
}

firebase use $projectId
firebase deploy --only hosting,firestore:rules,firestore:indexes
