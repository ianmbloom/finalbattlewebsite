# Transcode July_12 masters to web-friendly MP4s in public/videos/ and extract
# 9:16 WebP poster thumbnails. Masters are high-bitrate H.264 (12-27 Mbps), so
# every clip is transcoded down to a capped web bitrate (not remuxed).
#
# On Windows, invoke ffmpeg via Start-Process (or redirect stderr) — calling
# ffmpeg directly from PowerShell can deadlock on progress-output buffering.
# Encode to a temp file then move into place to avoid overwrite hangs.
#
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/encode-videos.ps1

$ErrorActionPreference = "Stop"
$SourceDir = "D:\FinalBattle\Output\July_12"

$OutDir = Join-Path $PSScriptRoot "..\public\videos"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

$ThumbDir = Join-Path $OutDir "thumbs"
New-Item -ItemType Directory -Force -Path $ThumbDir | Out-Null

$TmpDir = Join-Path $OutDir "_tmp"
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

$Jobs = @(
  @{ In = "Captive_Nation_English_July_12.mov";      Out = "captive-nation.mp4" },
  @{ In = "Captive_Nation_Farsi_July_12.mov";        Out = "captive-nation-fa.mp4" },
  @{ In = "Return_To_Democracy_English_July_12.mov"; Out = "returning-to-democracy.mp4" },
  @{ In = "Return_To_Democracy_Farsi_July_12.mov";   Out = "returning-to-democracy-fa.mp4" },
  @{ In = "Transitional_Leader_English_July_12.mov"; Out = "transitional-leader.mp4" },
  @{ In = "Transitional_Leader_Farsi_July_12.mov";   Out = "transitional-leader-fa.mp4" },
  @{ In = "Bright_Future_English_July_12.mov";       Out = "the-nation-has-a-future.mp4" },
  @{ In = "Bright_Future_Farsi_July_12.mov";         Out = "the-nation-has-a-future-fa.mp4" },
  @{ In = "By_The_People_English_July_12.mov";       Out = "by-the-people.mp4" },
  @{ In = "By_The_People_Farsi_July_12.mov";         Out = "by-the-people-fa.mp4" },
  @{ In = "Far_From_Home_English_July_12.mov";       Out = "far-from-home.mp4" },
  @{ In = "Far_From_Home_Farsi_July_12.mov";         Out = "far-from-home-fa.mp4" }
)

try {
  foreach ($job in $Jobs) {
    $input = Join-Path $SourceDir $job.In
    $tmpOut = Join-Path $TmpDir $job.Out
    $output = Join-Path $OutDir $job.Out
    if (-not (Test-Path $input)) { Write-Error "Missing source: $input" }

    Write-Host "`n=== Encoding $($job.Out) ==="
    # Redirect stderr so PowerShell does not deadlock buffering ffmpeg progress.
    ffmpeg -hide_banner -nostats -loglevel error -y -i $input `
      -c:v libx264 -profile:v high -pix_fmt yuv420p `
      -preset medium -crf 23 -maxrate 3500k -bufsize 7000k `
      -c:a aac -b:a 128k -movflags +faststart $tmpOut 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Move-Item $tmpOut $output -Force

    $thumb = Join-Path $ThumbDir ($job.Out -replace "\.mp4$", ".webp")
    ffmpeg -hide_banner -nostats -loglevel error -ss 1.5 -i $output -frames:v 1 `
      -vf "scale=540:960:force_original_aspect_ratio=increase,crop=540:960" `
      -c:v libwebp -quality 82 -y $thumb 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    $size = (Get-Item $output).Length
    Write-Host "Done: $($job.Out) ($([math]::Round($size / 1MB, 1)) MB) + thumb"
  }

  Write-Host "`nAll encodes + thumbnails complete."
}
finally {
  if (Test-Path $TmpDir) { Remove-Item $TmpDir -Recurse -Force -ErrorAction SilentlyContinue }
}
