(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  function trackEvent(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  }

  /* -------------------------------------------------------------- */
  /* contact CTA conversion tracking                                  */
  /* -------------------------------------------------------------- */

  document.querySelectorAll(".contact-cta").forEach((el) => {
    el.addEventListener("click", () => {
      trackEvent("contact_conversion", { method: el.dataset.contactMethod || "unknown" });
    });
  });

  /* -------------------------------------------------------------- */
  /* theme toggle (light / dark)                                      */
  /* -------------------------------------------------------------- */

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));

    themeToggle.addEventListener("click", () => {
      const nowLight = document.documentElement.getAttribute("data-theme") !== "light";
      document.documentElement.setAttribute("data-theme", nowLight ? "light" : "dark");
      themeToggle.setAttribute("aria-pressed", String(nowLight));
      try {
        localStorage.setItem("theme", nowLight ? "light" : "dark");
      } catch (e) {}
    });
  }

  /* -------------------------------------------------------------- */
  /* scroll progress bar + nav shadow + scroll-spy                   */
  /* -------------------------------------------------------------- */

  const progressBar = document.getElementById("progressBar");
  const nav = document.getElementById("nav");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[data-nav]"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
    nav.classList.toggle("scrolled", scrollTop > 40);

    let current = sections[0];
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120) current = section;
    }
    navLinks.forEach((link) => {
      link.classList.toggle("active", current && link.getAttribute("href") === "#" + current.id);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------------- */
  /* cursor glow                                                     */
  /* -------------------------------------------------------------- */

  if (!isTouch) {
    const glow = document.getElementById("cursorGlow");
    window.addEventListener(
      "mousemove",
      (e) => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------------- */
  /* reveal on scroll                                                 */
  /* -------------------------------------------------------------- */

  const revealItems = document.querySelectorAll(".reveal-item");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach((el, i) => {
      el.style.transitionDelay = (i % 6) * 0.06 + "s";
      io.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add("in-view"));
  }

  /* -------------------------------------------------------------- */
  /* about-meta stat count-up                                        */
  /* -------------------------------------------------------------- */

  const aboutMetaStats = document.querySelectorAll("#aboutMetaStats b");

  function formatAboutMetaStat(n, suffix) {
    if (suffix === "M") return (n / 1000000).toFixed(1) + "M";
    if (suffix === "K") return Math.round(n / 1000) + "K";
    return Math.round(n).toString();
  }

  function animateAboutMetaStat(el) {
    const target = Number(el.dataset.target) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatAboutMetaStat(target * eased, suffix);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (aboutMetaStats.length) {
    if (reducedMotion) {
      aboutMetaStats.forEach((el) => {
        el.textContent = formatAboutMetaStat(Number(el.dataset.target) || 0, el.dataset.suffix || "");
      });
    } else if ("IntersectionObserver" in window) {
      const statsIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateAboutMetaStat(entry.target);
              statsIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      aboutMetaStats.forEach((el) => statsIo.observe(el));
    } else {
      aboutMetaStats.forEach((el) => animateAboutMetaStat(el));
    }
  }

  /* -------------------------------------------------------------- */
  /* typing effect — hero role                                       */
  /* -------------------------------------------------------------- */

  const roles = [
    "Infrastructure Engineer",
    "AI Agent Builder",
    "Automation Tinkerer",
    "Full-Stack Developer",
  ];
  const typedEl = document.getElementById("typedRole");

  if (typedEl) {
    if (reducedMotion) {
      typedEl.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function tick() {
        const word = roles[roleIndex];
        if (!deleting) {
          charIndex++;
          typedEl.textContent = word.slice(0, charIndex);
          if (charIndex === word.length) {
            deleting = true;
            setTimeout(tick, 1400);
            return;
          }
        } else {
          charIndex--;
          typedEl.textContent = word.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
          }
        }
        setTimeout(tick, deleting ? 35 : 65);
      }
      tick();
    }
  }

  /* -------------------------------------------------------------- */
  /* terminal boot sequence — "Now" panel                            */
  /* -------------------------------------------------------------- */

  const terminalBody = document.getElementById("terminalBody");
  const terminalLines = [
    { type: "prompt", text: "$ whoami" },
    { type: "out", text: "shingo — infrastructure & agent engineer" },
    { type: "prompt", text: "$ uptime --focus" },
    { type: "out", text: "6y shipping web infra · 2y all-in on AI agent tooling" },
    { type: "prompt", text: "$ stack --primary" },
    { type: "out", text: "Cloudflare Workers · Laravel · WordPress · Claude Code · Codex" },
    { type: "prompt", text: "$ status" },
    { type: "out", text: "building 0xshingo.cc right now, with an AI agent, end to end." },
  ];

  function renderTerminalInstant() {
    terminalBody.innerHTML = terminalLines
      .map((l) => `<div class="${l.type}">${l.type === "prompt" ? l.text : l.text}</div>`)
      .join("");
  }

  function typeTerminal() {
    let li = 0;
    let ci = 0;

    function nextChar() {
      if (li >= terminalLines.length) return;
      const line = terminalLines[li];
      let row = terminalBody.children[li];
      if (!row) {
        row = document.createElement("div");
        row.className = line.type;
        terminalBody.appendChild(row);
      }
      ci++;
      row.textContent = line.text.slice(0, ci);
      if (ci < line.text.length) {
        setTimeout(nextChar, line.type === "prompt" ? 32 : 12);
      } else {
        li++;
        ci = 0;
        setTimeout(nextChar, line.type === "prompt" ? 120 : 320);
      }
    }
    nextChar();
  }

  if (terminalBody) {
    if (reducedMotion) {
      renderTerminalInstant();
    } else if ("IntersectionObserver" in window) {
      const termIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              typeTerminal();
              termIO.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      termIO.observe(terminalBody);
    } else {
      renderTerminalInstant();
    }
  }

  /* -------------------------------------------------------------- */
  /* magnetic buttons                                                 */
  /* -------------------------------------------------------------- */

  if (!isTouch && !reducedMotion) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      const strength = 18;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* -------------------------------------------------------------- */
  /* hero photo tilt                                                  */
  /* -------------------------------------------------------------- */

  const tilt = document.getElementById("heroTilt");
  if (tilt && !isTouch && !reducedMotion) {
    tilt.addEventListener("mousemove", (e) => {
      const rect = tilt.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    tilt.addEventListener("mouseleave", () => {
      tilt.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  /* -------------------------------------------------------------- */
  /* 3D tilt — project & skill cards                                  */
  /* -------------------------------------------------------------- */

  if (!isTouch && !reducedMotion) {
    document.querySelectorAll(".project-card, .skill-card").forEach((card) => {
      const maxDeg = 6;
      const lift = card.classList.contains("project-card") ? -6 : -4;

      card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
      });

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * maxDeg;
        const ry = (px - 0.5) * maxDeg;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${lift}px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = "";
        card.style.transform = card.dataset.chaosTransform || "";
      });
    });
  }

  /* -------------------------------------------------------------- */
  /* easter egg — konami code → satsui mode                           */
  /* -------------------------------------------------------------- */

  (() => {
    const eggHint = document.querySelector(".egg-hint");
    if (!eggHint) return;

    const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    let progress = 0;
    let active = false;
    let started = false;
    let completed = false;
    let abandonSent = false;

    const insightsSection = document.getElementById("insights");
    let hintViewed = false;
    let insightsRevealed = false;

    function startFunnelParticles() {
      if (reducedMotion) return;
      const funnel = document.getElementById("insightsFunnel");
      const canvas = document.getElementById("funnelCanvas");
      if (!funnel || !canvas) return;
      const ctx = canvas.getContext("2d");

      const STOPS = [1, 0.28, 0.07, 0.02, 0.12];
      let w, h, dots, running = false, rafId = null;

      function funnelHalfWidthAt(t) {
        const stages = STOPS.length - 1;
        const pos = Math.min(t, 1) * stages;
        const i = Math.min(Math.floor(pos), stages - 1);
        const frac = pos - i;
        const wA = Math.max(STOPS[i], 0.2);
        const wB = Math.max(STOPS[i + 1], 0.2);
        return ((wA + (wB - wA) * frac) / 2) * 0.9;
      }

      function spawn() {
        return {
          t: Math.random(),
          side: (Math.random() - 0.5) * 2,
          speed: 0.09 + Math.random() * 0.06,
          cyan: Math.random() < 0.5,
        };
      }

      function resize() {
        const rect = funnel.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
      }

      function step() {
        if (!running) return;
        ctx.clearRect(0, 0, w, h);
        dots.forEach((d) => {
          d.t += d.speed * 0.012;
          if (d.t > 1) Object.assign(d, spawn(), { t: 0 });

          const y = d.t * h;
          const x = w / 2 + d.side * funnelHalfWidthAt(d.t) * w;
          const alpha = Math.sin(Math.PI * Math.min(d.t, 1)) * 0.9;
          const color = d.cyan ? "34, 211, 238" : "167, 139, 250";

          ctx.beginPath();
          ctx.fillStyle = `rgba(${color}, ${alpha.toFixed(2)})`;
          ctx.shadowColor = `rgba(${color}, ${alpha.toFixed(2)})`;
          ctx.shadowBlur = 8;
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
        rafId = requestAnimationFrame(step);
      }

      function start() {
        if (running) return;
        if (!dots) dots = Array.from({ length: 26 }, spawn);
        resize();
        running = true;
        rafId = requestAnimationFrame(step);
      }

      function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (w && h) ctx.clearRect(0, 0, w, h);
      }

      window.addEventListener("resize", () => {
        if (running) resize();
      });

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => entries.forEach((entry) => (entry.isIntersecting ? start() : stop())),
          { threshold: 0.1 }
        );
        io.observe(funnel);
      } else {
        start();
      }
    }

    function formatCount(n, isPercent) {
      if (isPercent) return n.toFixed(1) + "%";
      if (n >= 1000) return (n / 1000).toFixed(1) + "K";
      return Math.round(n).toString();
    }

    function initScrollFunnel() {
      const scroller = document.getElementById("funnelScroller");
      const steps = Array.from(document.querySelectorAll("#insightsFunnel .funnel-step"));
      const abandonedEl = document.getElementById("statCodeAbandoned");
      const conversionEl = document.getElementById("statConversion");
      if (!scroller || !steps.length) return;

      const TARGETS = [1200, 340, 86, 24, 15];
      const specs = steps.map((el, i) => ({
        el,
        countEl: el.querySelector(".funnel-count"),
        bar: el.querySelector(".funnel-bar"),
        target: TARGETS[i] || 0,
        barPct: Math.max(Number(el.dataset.pct) || 0, 20),
      }));

      function progressFor(index, activeIndex, localProgress) {
        if (index < activeIndex) return 1;
        if (index > activeIndex) return 0;
        return localProgress;
      }

      if (reducedMotion) {
        specs.forEach((s) => {
          if (s.countEl) s.countEl.textContent = formatCount(s.target, false);
          if (s.bar) s.bar.style.width = s.barPct + "%";
          s.el.classList.add("is-done");
        });
        if (abandonedEl) abandonedEl.textContent = "62";
        if (conversionEl) conversionEl.textContent = "1.3%";
        return;
      }

      let ticking = false;

      function update() {
        ticking = false;
        const rect = scroller.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrolled = -rect.top;
        const scrollable = Math.max(rect.height - vh, 1);
        const overall = Math.min(Math.max(scrolled / scrollable, 0), 1);
        const raw = overall * specs.length;
        const activeIndex = Math.min(Math.floor(raw), specs.length - 1);
        const localProgress = overall >= 1 ? 1 : raw - activeIndex;

        specs.forEach((s, i) => {
          const progress = progressFor(i, activeIndex, localProgress);
          if (s.countEl) s.countEl.textContent = formatCount(s.target * progress, false);
          if (s.bar) s.bar.style.width = s.barPct * progress + "%";
          s.el.classList.toggle("is-active", i === activeIndex && overall < 1);
          s.el.classList.toggle("is-done", progress >= 1);
          s.el.classList.toggle("is-pending", progress <= 0 && i !== activeIndex);
        });

        if (abandonedEl) {
          const p = progressFor(3, activeIndex, localProgress);
          abandonedEl.textContent = Math.round(62 * p).toString();
        }
        if (conversionEl) {
          const p = progressFor(specs.length - 1, activeIndex, localProgress);
          conversionEl.textContent = (1.3 * p).toFixed(1) + "%";
        }
      }

      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }

    function revealInsights() {
      if (!insightsSection) return;
      insightsSection.hidden = false;
      trackEvent("insights_unlocked");

      initScrollFunnel();
      startFunnelParticles();
    }

    if ("IntersectionObserver" in window) {
      const hintObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!hintViewed) {
              hintViewed = true;
              trackEvent("egg_hint_view");
            }
            if (completed && !insightsRevealed) {
              insightsRevealed = true;
              if (active) revertChaos();
              revealInsights();
            }
          });
        },
        { threshold: 0.5 }
      );
      hintObserver.observe(eggHint);
    }

    function sendAbandonIfNeeded() {
      if (started && !completed && !abandonSent) {
        abandonSent = true;
        trackEvent("egg_code_abandoned", { progress });
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendAbandonIfNeeded();
    });
    window.addEventListener("pagehide", sendAbandonIfNeeded);

    const progressEls = Array.from(document.querySelectorAll(".egg-progress"));
    const eggButtons = Array.from(document.querySelectorAll(".egg-btn"));

    function updateProgressDisplay() {
      progressEls.forEach((el, i) => el.classList.toggle("done", i < progress));
    }

    function flashButton(key) {
      const btn = eggButtons.find((b) => b.dataset.key.toLowerCase() === key);
      if (!btn) return;
      btn.classList.add("flash");
      setTimeout(() => btn.classList.remove("flash"), 350);
    }

    function chaosTargets() {
      return document.querySelectorAll(".project-card, .skill-card, .panel");
    }

    function headingTargets() {
      return document.querySelectorAll(".hero-title, .section-title");
    }

    function splitToChars(el) {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      el.innerHTML = el.textContent
        .split("")
        .map((ch) => `<span class="egg-char">${ch === " " ? "&nbsp;" : ch}</span>`)
        .join("");
    }

    function applyChaos() {
      document.body.classList.add("satsui-mode");

      document.querySelectorAll(".photo-satsui[data-src]").forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });

      chaosTargets().forEach((el) => {
        const rot = (Math.random() - 0.5) * 30;
        const tx = (Math.random() - 0.5) * 60;
        const ty = (Math.random() - 0.5) * 40;
        const t = `rotate(${rot.toFixed(2)}deg) translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
        el.dataset.chaosTransform = t;
        el.style.transform = t;
      });

      headingTargets().forEach((el) => {
        splitToChars(el);
        el.querySelectorAll(".egg-char").forEach((span) => {
          const rot = (Math.random() - 0.5) * 50;
          const tx = (Math.random() - 0.5) * 14;
          const ty = (Math.random() - 0.5) * 20;
          span.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
        });
      });

      active = true;
    }

    function revertChaos() {
      document.body.classList.remove("satsui-mode");

      chaosTargets().forEach((el) => {
        delete el.dataset.chaosTransform;
        el.style.transform = "";
      });

      headingTargets().forEach((el) => {
        el.querySelectorAll(".egg-char").forEach((span) => {
          span.style.transform = "";
        });
      });

      active = false;
    }

    function registerInput(key) {
      if (key === KONAMI[progress]) {
        if (progress === 0) {
          started = true;
          trackEvent("egg_code_start");
        }
        flashButton(key);
        progress++;
        updateProgressDisplay();
        if (progress === KONAMI.length) {
          progress = 0;
          completed = true;
          trackEvent("egg_code_success");
          window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
          active ? revertChaos() : applyChaos();
          updateProgressDisplay();
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
        updateProgressDisplay();
        if (progress === 1) {
          if (!started) {
            started = true;
            trackEvent("egg_code_start");
          }
          flashButton(key);
        }
      }
    }

    window.addEventListener("keydown", (e) => {
      registerInput(e.key.toLowerCase());
    });

    document.querySelectorAll(".egg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        registerInput(btn.dataset.key.toLowerCase());
      });
    });
  })();

  /* -------------------------------------------------------------- */
  /* particle network canvas                                          */
  /* -------------------------------------------------------------- */

  const canvas = document.getElementById("particles");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, particles, mouse = { x: -9999, y: -9999 };
    const density = 0.00009;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(120, Math.floor(w * h * density));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          p.x += (dx / dist) * 0.6;
          p.y += (dy / dist) * 0.6;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(94, 234, 212, ${0.14 * (1 - d / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = "rgba(167, 139, 250, 0.7)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    if (!isTouch) {
      window.addEventListener(
        "mousemove",
        (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        },
        { passive: true }
      );
    }

    resize();
    requestAnimationFrame(step);
  }
})();
