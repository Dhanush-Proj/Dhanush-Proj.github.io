const nameText = "Dhanush P Reji";
let i = 0;

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("name");
  function typeName() {
    if (i < nameText.length) {
      nameEl.textContent += nameText.charAt(i);
      i++;
      setTimeout(typeName, 100);
    }
  }
  typeName();

  // Blast animation for background icons
  document.querySelectorAll('.bg-icon').forEach(icon => {
    const x = Math.random() * window.innerWidth - window.innerWidth / 2;
    const y = Math.random() * window.innerHeight - window.innerHeight / 2;
    icon.style.left = '50%';
    icon.style.top = '50%';
    icon.style.setProperty('--x', `${x}px`);
    icon.style.setProperty('--y', `${y}px`);
    requestAnimationFrame(() => icon.classList.add('blast'));
  });

// Image click preview
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


    // Tiny JS enhancement: active nav link on scroll
    const sections = document.querySelectorAll("section, header");
    const navLinks = document.querySelectorAll("nav a");

    window.addEventListener("scroll", () => {
      let current = "home";
      sections.forEach(sec => {
        const top = window.scrollY;
        if (sec.offsetTop - 120 <= top) current = sec.id;
      });

      navLinks.forEach(a => {
        a.style.color = a.getAttribute("href") === `#${current}`
          ? "var(--yellow)"
          : "var(--fg)";
      });
    });