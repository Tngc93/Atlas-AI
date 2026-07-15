"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

export function LandingMotion() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let fadingOut = false;

    const fadeTo = (target: number, duration = FADE_MS) => {
      cancelAnimationFrame(animationFrame);
      const startOpacity = Number.parseFloat(video.style.opacity || "0");
      const startedAt = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        video.style.opacity = String(startOpacity + (target - startOpacity) * eased);
        if (progress < 1) animationFrame = requestAnimationFrame(step);
      };
      animationFrame = requestAnimationFrame(step);
    };

    const restart = async () => {
      video.currentTime = 0;
      fadingOut = false;
      if (!reducedMotion.matches) {
        await video.play().catch(() => undefined);
        fadeTo(1);
      }
    };

    const handleLoaded = () => {
      if (reducedMotion.matches) {
        video.pause();
        video.currentTime = 0;
        video.style.opacity = "1";
      } else {
        void video.play().catch(() => undefined);
        fadeTo(1);
      }
    };

    const handleTimeUpdate = () => {
      if (fadingOut || !Number.isFinite(video.duration)) return;
      if (video.duration - video.currentTime <= FADE_OUT_LEAD) {
        fadingOut = true;
        fadeTo(0, FADE_MS);
      }
    };

    const syncMotionPreference = () => {
      cancelAnimationFrame(animationFrame);
      if (reducedMotion.matches) {
        video.pause();
        video.currentTime = 0;
        video.style.opacity = "1";
      } else {
        void restart();
      }
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", restart);
    reducedMotion.addEventListener("change", syncMotionPreference);

    const targets = document.querySelectorAll<HTMLElement>("[data-landing-reveal]");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), { rootMargin: "0px 0px -12%", threshold: 0.12 });

    if (reducedMotion.matches) targets.forEach((target) => target.classList.add("is-visible"));
    else targets.forEach((target) => observer.observe(target));

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) handleLoaded();

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", restart);
      reducedMotion.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="landing-video-backdrop"
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster="/media/atlas-jellyfish-poster.jpg"
      aria-hidden
      tabIndex={-1}
      data-background-video
    >
      <source media="(max-width: 680px)" src="/media/atlas-jellyfish-720.mp4" type="video/mp4" />
      <source src="/media/atlas-jellyfish-1080.mp4" type="video/mp4" />
    </video>
  );
}
