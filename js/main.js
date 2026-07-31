(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

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
        flashButton(key);
        progress++;
        updateProgressDisplay();
        if (progress === KONAMI.length) {
          progress = 0;
          window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
          active ? revertChaos() : applyChaos();
          updateProgressDisplay();
        }
      } else {
        progress = key === KONAMI[0] ? 1 : 0;
        updateProgressDisplay();
        if (progress === 1) flashButton(key);
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
