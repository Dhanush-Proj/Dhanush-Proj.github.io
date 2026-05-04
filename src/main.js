const nameText = "Dhanush P Reji";
let i = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Typing animation for Hero
  const nameEl = document.getElementById("name");
  function typeName() {
    if (i < nameText.length) {
      nameEl.textContent += nameText.charAt(i);
      i++;
      setTimeout(typeName, 100);
    }
  }
  typeName();

  // Time-based background
  function updateBackground() {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    document.documentElement.style.setProperty('--bg-color', isDay ? 'var(--day-bg)' : 'var(--night-bg)');
    document.body.style.backgroundColor = isDay ? '#7aa2f7' : '#1a1b26';
  }
  updateBackground();
  setInterval(updateBackground, 60000);

  // Status Bar Live Clock
  const clockEl = document.getElementById("live-clock");
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.getHours().toString().padStart(2, '0') + ":" + 
                          now.getMinutes().toString().padStart(2, '0');
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Project Image Modal Logic[cite: 2]
  const modal = document.getElementById("imgModal");
  const modalImg = document.getElementById("modalImg");

  document.querySelectorAll(".project-image").forEach(img => {
    img.addEventListener("click", (e) => {
      modalImg.src = e.target.src;
      modal.style.display = "flex";
    });
  });
});

function closeImage() {
  document.getElementById("imgModal").style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  // ... your existing name typing and clock logic[cite: 2] ...

  // Scroll Reveal Logic
  const revealCallback = (entries, observer) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a slight delay for each card to create a staggered effect
        setTimeout(() => {
          entry.target.classList.add("active");
        }, index * 100); 
        observer.unobserve(entry.target);
      }
    });
  };

  const revealObserver = new IntersectionObserver(revealCallback, {
    threshold: 0.15
  });

  // Apply to all cards and sections
  document.querySelectorAll(".parchment-card, .content-section").forEach(el => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  // Add a "Wiggle" effect on first hover to suggest interactivity
  document.querySelectorAll('.project-box').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.animation = 'none'; // Reset any floating animations
    }, { once: true });
  });
});


const currentYearEl = document.getElementById("currentYear");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();

}