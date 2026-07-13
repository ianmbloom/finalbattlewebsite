# Upload the July_12 encodes from public/videos/ to Cloudflare R2 under the
# `videos/` prefix, then delete the superseded `-jun27` objects. Public CDN:
# https://videos.finalbattle.video/videos/<file>.mp4
#
# Usage: pwsh scripts/upload-videos-r2.ps1

$ErrorActionPreference = "Stop"
$env:Path = "$env:LOCALAPPDATA\nodejs;" + $env:Path
$Root = Join-Path $PSScriptRoot ".."
Set-Location $Root

$Bucket = "finalbattleiran-media"
$VideoDir = Join-Path $Root "public\videos"

$Uploads = @(
  "captive-nation.mp4",
  "captive-nation-fa.mp4",
  "returning-to-democracy.mp4",
  "returning-to-democracy-fa.mp4",
  "transitional-leader.mp4",
  "transitional-leader-fa.mp4",
  "the-nation-has-a-future.mp4",
  "the-nation-has-a-future-fa.mp4",
  "by-the-people.mp4",
  "by-the-people-fa.mp4",
  "far-from-home.mp4",
  "far-from-home-fa.mp4"
)

foreach ($file in $Uploads) {
  $local = Join-Path $VideoDir $file
  if (-not (Test-Path $local)) { Write-Error "Missing encode: $local" }
  $key = "videos/$file"
  Write-Host "`nUploading $key ..."
  npx wrangler r2 object put "$Bucket/$key" --remote --file $local --content-type video/mp4
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

# Remove the superseded date-suffixed objects (idempotent; ignore misses).
$Stale = @(
  "videos/captive-nation-jun27.mp4",
  "videos/captive-nation-fa-jun27.mp4",
  "videos/returning-to-democracy-jun27.mp4",
  "videos/returning-to-democracy-fa-jun27.mp4",
  "videos/transitional-leader-jun27.mp4",
  "videos/transitional-leader-fa-jun27.mp4",
  "videos/the-nation-has-a-future-jun27.mp4",
  "videos/the-nation-has-a-future-fa-jun27.mp4",
  "videos/iran-has-a-future-jun27.mp4",
  "videos/iran-has-a-future-fa-jun27.mp4"
)

foreach ($key in $Stale) {
  Write-Host "`nDeleting stale $key ..."
  npx wrangler r2 object delete "$Bucket/$key" --remote
}

Write-Host "`nAll uploads complete."
