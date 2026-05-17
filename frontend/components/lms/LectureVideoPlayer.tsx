"use client";

import { useEffect, useRef } from "react";
import VimeoPlayer from "@vimeo/player";
import { dc } from "@/lib/dc";

type Provider = "youtube" | "vimeo" | "generic";

interface ParsedVideo {
  provider: Provider;
  embedUrl: string;
  externalId: string | null;
}

function parseVideoUrl(raw: string): ParsedVideo | null {
  try {
    const u = new URL(raw);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id: string | null = null;
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.slice(1);
      } else {
        id = u.searchParams.get("v");
        if (!id && u.pathname.startsWith("/embed/")) {
          id = u.pathname.replace("/embed/", "");
        }
      }
      if (!id) return null;
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`,
        externalId: id,
      };
    }
    if (u.hostname.includes("vimeo.com")) {
      const m = u.pathname.match(/\/(\d+)/);
      if (!m) return null;
      return {
        provider: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${m[1]}?title=0&byline=0`,
        externalId: m[1],
      };
    }
    return { provider: "generic", embedUrl: raw, externalId: null };
  } catch {
    return null;
  }
}

// ── YouTube IFrame API loader ───────────────────────────────────────────────

declare global {
  interface Window {
    YT?: {
      Player: new (id: HTMLIFrameElement, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  getCurrentTime(): number;
  getPlaybackRate(): number;
  destroy(): void;
}

let ytApiLoading: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiLoading) return ytApiLoading;

  ytApiLoading = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiLoading;
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  videoUrl: string;
  videoId: string;
  title: string;
}

export function LectureVideoPlayer({ videoUrl, videoId, title }: Props) {
  const parsed = parseVideoUrl(videoUrl);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // YouTube tracking
  useEffect(() => {
    if (!parsed || parsed.provider !== "youtube") return;
    let player: YTPlayer | null = null;
    let lastPosition = 0;
    let lastRate = 1;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !iframeRef.current || !window.YT) return;
      const States = window.YT.PlayerState;
      player = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: () => {
            lastRate = player?.getPlaybackRate() ?? 1;
          },
          onStateChange: (e: { data: number }) => {
            if (!player) return;
            const pos = Math.round(player.getCurrentTime());
            if (e.data === States.PLAYING) {
              // Detect seek: position jumped > 2s from last known position
              if (Math.abs(pos - lastPosition) > 2 && lastPosition > 0) {
                dc.video.seek(videoId, lastPosition, pos);
              }
              dc.video.play(videoId, pos);
            } else if (e.data === States.PAUSED) {
              dc.video.pause(videoId, pos);
            } else if (e.data === States.ENDED) {
              dc.video.complete(videoId);
            }
            lastPosition = pos;
          },
          onPlaybackRateChange: (e: { data: number }) => {
            if (e.data !== lastRate) {
              dc.video.playbackRateChange(videoId, e.data);
              lastRate = e.data;
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { player?.destroy(); } catch { /* ignore */ }
    };
  }, [parsed, videoId]);

  // Vimeo tracking
  useEffect(() => {
    if (!parsed || parsed.provider !== "vimeo" || !iframeRef.current) return;
    const vp = new VimeoPlayer(iframeRef.current);
    let lastPosition = 0;
    let lastRate = 1;

    vp.on("play", (data: { seconds: number }) => {
      const pos = Math.round(data.seconds);
      dc.video.play(videoId, pos);
      lastPosition = pos;
    });
    vp.on("pause", (data: { seconds: number }) => {
      const pos = Math.round(data.seconds);
      dc.video.pause(videoId, pos);
      lastPosition = pos;
    });
    vp.on("seeked", (data: { seconds: number }) => {
      const after = Math.round(data.seconds);
      dc.video.seek(videoId, lastPosition, after);
      lastPosition = after;
    });
    vp.on("ended", () => dc.video.complete(videoId));
    vp.on("playbackratechange", (data: { playbackRate: number }) => {
      if (data.playbackRate !== lastRate) {
        dc.video.playbackRateChange(videoId, data.playbackRate);
        lastRate = data.playbackRate;
      }
    });

    return () => {
      try { vp.unload(); vp.destroy(); } catch { /* ignore */ }
    };
  }, [parsed, videoId]);

  // Generic iframe fallback — emit play on mount only (no API to observe).
  useEffect(() => {
    if (!parsed || parsed.provider !== "generic") return;
    dc.video.play(videoId, 0);
  }, [parsed, videoId]);

  if (!parsed) {
    return (
      <div className="aspect-video flex items-center justify-center border border-border-default rounded-lg bg-bg-primary">
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand text-[13px] underline"
        >
          Open video in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={parsed.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
