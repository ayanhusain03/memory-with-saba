/* =============================================
   SABA'S BIRTHDAY WEBSITE — script.js
   All animations, interactions, GSAP, music
   ============================================= */

"use strict";

// ── Wait for GSAP & DOM ──
document.addEventListener("DOMContentLoaded", () => {
  /* ─────────────────────────────────────────
     GSAP SETUP
  ───────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ─────────────────────────────────────────
     SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  const progressBar = document.getElementById("scrollProgress");
  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    },
    { passive: true },
  );

  /* ─────────────────────────────────────────
     FLOATING HEART PARTICLES
  ───────────────────────────────────────── */
  function createHearts() {
    if (prefersReducedMotion) return;
    const container = document.getElementById("heartsContainer");
    const symbols = ["♥", "♡", "❤", "💕"];
    const count = window.innerWidth < 480 ? 6 : 10;

    for (let i = 0; i < count; i++) {
      const h = document.createElement("span");
      h.className = "heart-particle";
      h.textContent = symbols[i % symbols.length];
      h.style.left = Math.random() * 100 + "vw";
      h.style.fontSize = Math.random() * 10 + 10 + "px";
      h.style.opacity = "0";
      const dur = Math.random() * 14 + 12 + "s";
      const delay = Math.random() * -20 + "s";
      h.style.animationDuration = dur;
      h.style.animationDelay = delay;
      h.style.color =
        Math.random() > 0.5 ? "rgba(255,77,109,0.35)" : "rgba(255,214,10,0.25)";
      container.appendChild(h);
    }
  }
  createHearts();

  /* ─────────────────────────────────────────
     MUSIC SYSTEM (audio element with fallback)
  ───────────────────────────────────────── */
  const musicBtn = document.getElementById("musicBtn");
  const audioEl = document.getElementById("bgMusic");
  let musicPlaying = false;
  let userInteracted = false;

  // fallback generator state
  let audioCtx = null;
  let gainNode = null;

  function createAmbientMusic() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);

    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.3 + i * 0.05, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.035 / (i + 1), audioCtx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
    });
  }

  function rampAmbient(toValue, time = 1.5) {
    if (!gainNode) return;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(toValue, audioCtx.currentTime + time);
  }

  async function playMusic() {
    if (audioEl.paused) {
      try {
        await audioEl.play();
      } catch (err) {
        console.warn(
          "audio element play failed, using generated fallback",
          err,
        );
        createAmbientMusic();
        if (audioCtx.state === "suspended") await audioCtx.resume();
        rampAmbient(0.18, 2);
      }
    }
    musicPlaying = true;
    musicBtn.classList.add("playing");
    musicBtn.querySelector(".music-label").textContent = "Mute";
  }

  function pauseMusic() {
    if (!audioEl.paused) {
      audioEl.pause();
    }
    if (gainNode) {
      rampAmbient(0, 1.2);
      setTimeout(() => {
        if (audioCtx && !musicPlaying) audioCtx.suspend();
      }, 1400);
    }
    musicPlaying = false;
    musicBtn.classList.remove("playing");
    musicBtn.querySelector(".music-label").textContent = "Music";
  }

  audioEl.addEventListener("error", () => {
    console.error("Failed to load bgMusic; check file path or network.");
  });

  musicBtn.addEventListener("click", () => {
    userInteracted = true;
    musicPlaying ? pauseMusic() : playMusic();
  });

  /* ─────────────────────────────────────────
     HERO ANIMATIONS (GSAP Timeline)
  ───────────────────────────────────────── */
  const heroTl = gsap.timeline({ delay: 0.3 });

  if (!prefersReducedMotion) {
    heroTl
      .to("#heroPre", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        onStart: () => gsap.set("#heroPre", { y: -20 }),
      })
      .to(
        ".hero__line",
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power2.out",
          onStart: () => gsap.set(".hero__line", { y: 30 }),
        },
        "-=0.3",
      )
      .to(
        "#heroSub",
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          onStart: () => gsap.set("#heroSub", { y: 20 }),
        },
        "-=0.4",
      )
      .to(
        "#heroCta",
        {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          onStart: () => gsap.set("#heroCta", { scale: 0.8 }),
        },
        "-=0.3",
      )
      .to(
        "#heroScroll",
        {
          opacity: 0.5,
          duration: 0.8,
          ease: "power1.in",
        },
        "-=0.2",
      );
  } else {
    gsap.set(
      ["#heroPre", ".hero__line", "#heroSub", "#heroCta", "#heroScroll"],
      { opacity: 1 },
    );
  }

  /* ── CTA Button — Click to scroll + music ── */
  const ctaBtn = document.getElementById("heroCta");
  ctaBtn.addEventListener("click", () => {
    // Ripple
    const ripple = ctaBtn.querySelector(".ripple-ring");
    ripple.classList.remove("active");
    void ripple.offsetWidth; // reflow trigger
    ripple.classList.add("active");

    // Start music on first click
    if (!userInteracted) {
      userInteracted = true;
      playMusic();
    }

    // Smooth scroll to letter section
    document.getElementById("letter").scrollIntoView({ behavior: "smooth" });
  });

  /* ─────────────────────────────────────────
     LOVE LETTER — TYPING EFFECT
  ───────────────────────────────────────── */
  const letterText = document.getElementById("letterText");
  const letterCursor = document.getElementById("letterCursor");

  const letterContent = `My dearest Saba,\n\nI have been searching for the right words, the kind that do justice to everything you are. But language — for once — feels too small.\n\nYou are the soft silence after a long day. The warmth that finds me when everything else is cold. The reason ordinary moments feel like something worth remembering.\n\nI don't know how you do it — how you carry so much grace and still make room for everyone around you. But I see it. I see you.\n\nHappy birthday, my love. Today and every day, I am grateful that your story exists — and even more grateful that it crossed mine.\n\nWith everything I have,\n— Yours 💖`;

  let typingStarted = false;

  function typeText(el, text, speed = 28) {
    const lines = text.split("\n");
    let lineIndex = 0;
    let charIndex = 0;
    el.innerHTML = "";

    function tick() {
      if (lineIndex >= lines.length) {
        letterCursor.style.display = "none";
        return;
      }
      const line = lines[lineIndex];
      if (charIndex < line.length) {
        el.innerHTML += line[charIndex];
        charIndex++;
        setTimeout(tick, speed + Math.random() * 20);
      } else {
        el.innerHTML += "\n";
        el.style.whiteSpace = "pre-wrap";
        lineIndex++;
        charIndex = 0;
        setTimeout(
          tick,
          lineIndex < lines.length && lines[lineIndex] === ""
            ? speed * 3
            : speed,
        );
      }
    }
    tick();
  }

  // ScrollTrigger for letter section
  ScrollTrigger.create({
    trigger: "#letter",
    start: "top 70%",
    onEnter: () => {
      gsap.to(".letter__card", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        onStart: () => gsap.set(".letter__card", { y: 50 }),
      });
      if (!typingStarted) {
        typingStarted = true;
        setTimeout(() => typeText(letterText, letterContent, 25), 600);
      }
    },
    once: true,
  });

  /* ─────────────────────────────────────────
     SECTION LABELS & HEADINGS FADE-IN
  ───────────────────────────────────────── */
  gsap.utils.toArray(".section-label").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      onStart: () => gsap.set(el, { y: 20 }),
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });

  gsap.utils.toArray(".section-heading").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      onStart: () => gsap.set(el, { y: 30 }),
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });
  });

  /* ─────────────────────────────────────────
     TIMELINE ITEMS — ScrollTrigger
  ───────────────────────────────────────── */
  gsap.utils.toArray(".timeline__item").forEach((item, i) => {
    const isLeft = item.classList.contains("timeline__item--left");
    const xFrom = window.innerWidth >= 700 ? (isLeft ? -60 : 60) : 0;
    const yFrom = window.innerWidth >= 700 ? 0 : 40;

    gsap.set(item, { x: xFrom, y: yFrom, opacity: 0 });

    gsap.to(item, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: item,
        start: "top 82%",
        once: true,
      },
    });
  });

  /* ─────────────────────────────────────────
     POLAROID GALLERY — Stagger reveal
  ───────────────────────────────────────── */
  gsap.utils.toArray(".polaroid").forEach((card, i) => {
    gsap.set(card, { y: 50, opacity: 0 });
    gsap.to(card, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power2.out",
      delay: parseFloat(card.style.getPropertyValue("--delay") || "0"),
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
        once: true,
      },
    });
  });

  /* ─────────────────────────────────────────
     REASONS SECTION
  ───────────────────────────────────────── */
  const reasons = [
    "Because your laugh is the most beautiful sound I've ever known.",
    "Because you're brave in ways you don't even realize.",
    "Because you make kindness look effortless.",
    "Because you see people — truly see them — and that's rare.",
    "Because even your silences feel like home.",
    "Because you carry warmth wherever you go.",
    "Because you are endlessly, quietly extraordinary.",
    "Because you make me want to be better — just by being you.",
    "Because your mind is one of the most beautiful places I've ever been.",
    "Because loving you feels like the most natural thing in the world.",
    "Because you are gentle with others when the world isn't gentle with you.",
    "Because you dream big and feel everything deeply.",
    "Because you are exactly who you are, and that is more than enough.",
    "Because every little thing about you matters to me.",
    "Because you are the reason I believe in beautiful things.",
  ];

  const reasonText = document.getElementById("reasonText").querySelector("p");
  const reasonBtn = document.getElementById("reasonBtn");
  const sparklesEl = document.getElementById("sparkles");
  let lastReasonIndex = -1;

  // Scroll reveal for reasons section
  ScrollTrigger.create({
    trigger: "#reasons",
    start: "top 70%",
    onEnter: () => {
      gsap.to(".reasons__card", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        onStart: () => gsap.set(".reasons__card", { y: 40 }),
      });
      gsap.to(".reasons__btn", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
        onStart: () => gsap.set(".reasons__btn", { y: 20 }),
      });
    },
    once: true,
  });

  function triggerSparkles() {
    sparklesEl.innerHTML = "";
    const emojis = ["✨", "⭐", "💫", "🌟", "✦"];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const sp = document.createElement("span");
      sp.className = "sparkle";
      sp.textContent = emojis[i % emojis.length];
      sp.style.top = Math.random() * 80 + 10 + "%";
      sp.style.left = Math.random() * 80 + 10 + "%";
      sp.style.animationDelay = Math.random() * 0.3 + "s";
      sparklesEl.appendChild(sp);
    }
    setTimeout(() => (sparklesEl.innerHTML = ""), 1000);
  }

  reasonBtn.addEventListener("click", () => {
    let idx;
    do {
      idx = Math.floor(Math.random() * reasons.length);
    } while (idx === lastReasonIndex);
    lastReasonIndex = idx;

    // Animate out then in
    gsap.to(reasonText, {
      opacity: 0,
      y: -12,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => {
        reasonText.textContent = reasons[idx];
        gsap.fromTo(
          reasonText,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        );
        triggerSparkles();
      },
    });
  });

  /* ─────────────────────────────────────────
     FINALE SECTION — Cinematic line reveal
  ───────────────────────────────────────── */
  let finaleAnimated = false;

  function launchConfetti() {
    if (!window.confetti) return;
    const canvas = document.getElementById("confettiCanvas");
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    // Elegant gold + pink confetti
    const opts = {
      particleCount: 60,
      spread: 70,
      startVelocity: 30,
      gravity: 0.6,
      decay: 0.93,
      colors: ["#ffd60a", "#ff8fa3", "#ffccd5", "#fff0a0", "#ffe066"],
      shapes: ["circle"],
      scalar: 0.85,
      ticks: 200,
    };

    myConfetti({ ...opts, origin: { x: 0.3, y: 0.6 } });
    setTimeout(() => myConfetti({ ...opts, origin: { x: 0.7, y: 0.6 } }), 350);
    setTimeout(
      () =>
        myConfetti({ ...opts, particleCount: 40, origin: { x: 0.5, y: 0.5 } }),
      700,
    );
  }

  ScrollTrigger.create({
    trigger: "#finale",
    start: "top 60%",
    onEnter: () => {
      if (finaleAnimated) return;
      finaleAnimated = true;

      const lines = document.querySelectorAll(".finale__line");
      const tl = gsap.timeline();

      lines.forEach((line, i) => {
        tl.to(
          line,
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            onStart: () => gsap.set(line, { y: 20 }),
          },
          i * 0.35,
        );
      });

      tl.to(
        ".finale__divider",
        { opacity: 1, duration: 0.8, ease: "power1.in" },
        "-=0.2",
      )
        .to(
          "#finaleClosing",
          { opacity: 1, duration: 1.2, ease: "power2.out" },
          "+=0.2",
        )
        .to(
          ".finale__signature",
          { opacity: 1, duration: 0.8, ease: "power1.in" },
          "-=0.4",
        )
        .call(() => {
          setTimeout(launchConfetti, 400);
        });
    },
    once: true,
  });

  /* ─────────────────────────────────────────
     TIMELINE GLOW LINE (desktop only)
  ───────────────────────────────────────── */
  if (window.innerWidth >= 700) {
    gsap.to(".timeline__line", {
      scaleY: 1,
      transformOrigin: "top center",
      ease: "none",
      scrollTrigger: {
        trigger: ".timeline__items",
        start: "top 70%",
        end: "bottom 30%",
        scrub: 1,
      },
    });
    gsap.set(".timeline__line", { scaleY: 0 });
  }

  /* ─────────────────────────────────────────
     REFRESH ScrollTrigger on resize
  ───────────────────────────────────────── */
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
    },
    { passive: true },
  );
});
