const heroCard = document.getElementById("heroCard");
const stormCanvas = document.getElementById("stormCanvas");
const stormLinks = document.querySelectorAll(".storm-link");

// 3D tilt interaction for the hero card.
function setupCardTilt() {
  if (!heroCard) return;

  heroCard.addEventListener("pointermove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rotY = px * 10;
    const rotX = -py * 9;

    heroCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  });

  heroCard.addEventListener("pointerleave", () => {
    heroCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  });
}

function setupLinkCursorGlow() {
  stormLinks.forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      const rect = link.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      link.style.setProperty("--x", `${x}px`);
      link.style.setProperty("--y", `${y}px`);
    });
  });
}

function setupStormBackground() {
  if (!stormCanvas) return;
  const ctx = stormCanvas.getContext("2d");
  if (!ctx) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let particles = [];
  let lightning = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    stormCanvas.width = Math.floor(width * DPR);
    stormCanvas.height = Math.floor(height * DPR);
    stormCanvas.style.width = `${width}px`;
    stormCanvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    particles = Array.from({ length: Math.min(95, Math.floor(width / 13)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.7 + 0.3,
      alpha: Math.random() * 0.55 + 0.15
    }));
  }

  function createBolt(startX, startY, len = 10) {
    const points = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;
    for (let i = 0; i < len; i += 1) {
      x += (Math.random() - 0.5) * 26;
      y += Math.random() * 18 + 8;
      points.push({ x, y });
    }
    lightning.push({
      points,
      life: 1,
      decay: 0.04 + Math.random() * 0.025
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(8, 23, 68, 0.35)";
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(62, 221, 255, ${p.alpha})`;
      ctx.fill();
    });

    lightning = lightning.filter((bolt) => bolt.life > 0);
    lightning.forEach((bolt) => {
      bolt.life -= bolt.decay;
      ctx.strokeStyle = `rgba(125, 240, 255, ${bolt.life})`;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(60, 220, 255, 0.85)";
      ctx.beginPath();
      bolt.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    if (Math.random() > 0.94) {
      createBolt(event.clientX + (Math.random() - 0.5) * 35, Math.max(0, event.clientY - 40), 7);
    }
  });

  stormLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const rect = link.getBoundingClientRect();
      createBolt(rect.left + rect.width * Math.random(), rect.top - 8, 8);
      createBolt(rect.left + rect.width * Math.random(), rect.top - 8, 7);
    });
  });

  resize();
  draw();
}

setupCardTilt();
setupLinkCursorGlow();
setupStormBackground();
