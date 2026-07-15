/**
 * Proxies video downloads with Content-Disposition header to force download.
 * This is needed because cross-origin videos ignore the download attribute.
 */

const VIDEO_CDN = "https://videos.finalbattle.video";

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url);
  const videoPath = url.searchParams.get("path");

  if (!videoPath) {
    return new Response("Missing path parameter", { status: 400 });
  }

  // Only allow paths that look like video files
  if (!videoPath.match(/^\/videos\/.*\.mp4$/)) {
    return new Response("Invalid video path", { status: 400 });
  }

  const filename = url.searchParams.get("filename") || videoPath.split("/").pop() || "video.mp4";

  // In production, fetch from CDN. In dev, the video path is relative to origin.
  const isProduction = url.hostname !== "localhost" && !url.hostname.includes("127.0.0.1");
  const videoUrl = isProduction ? `${VIDEO_CDN}${videoPath}` : `${url.origin}${videoPath}`;

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return new Response("Video not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Content-Type", "video/mp4");
    
    // Pass through content length if available
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Download proxy error:", err);
    return new Response("Failed to fetch video", { status: 500 });
  }
};
