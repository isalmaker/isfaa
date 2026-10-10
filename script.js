(() => {
  "use strict";

  const book = document.getElementById("book");
  const pages = Array.from(book.querySelectorAll(".page"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageCount = document.getElementById("pageCount");
  const progress = document.getElementById("progress");
  const hint = document.getElementById("hint");
  const restartInline = document.getElementById("restartInline");

  let current = 0; // 0 = cover; subsequent values are opened pages
  let busy = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flipDuration = reducedMotion ? 20 : 900;

  // At desktop width, pages sit on the right half like a real open book.
  // On mobile, each page uses the full book width to remain readable.
  function arrangePages() {
    const desktop = window.matchMedia("(min-width: 650px)").matches;
    pages.forEach((page, index) => {
      page.style.zIndex = String(pages.length - index);
      if (index === 0) {
        page.style.left = "0";
        page.style.width = desktop ? "50%" : "100%";
      } else {
        page.style.left = desktop ? "50%" : "0";
        page.style.width = desktop ? "50%" : "100%";
      }
    });
    updateControls();
  }

  function updateControls() {
    prevBtn.disabled = current === 0 || busy;
    nextBtn.disabled = current === pages.length - 1 || busy;
    nextBtn.innerHTML = current === 0
      ? '<span>Open book</span> →'
      : current === pages.length - 1
        ? '<span>The end</span> ♡'
        : '<span>Next page</span> →';

    pageCount.textContent = current === 0 ? "Cover" : `Page ${current} of ${pages.length - 1}`;
    progress.style.width = `${(current / (pages.length - 1)) * 100}%`;

    if (current === 0) {
      hint.textContent = "Tap the cover or press “Open book” to begin.";
    } else if (current === pages.length - 1) {
      hint.textContent = "You've reached the last page. Take this little note with you. ♡";
    } else {
      hint.textContent = "Tap the right side to turn forward, or the left side to go back.";
    }
  }

  function turnForward() {
    if (busy || current >= pages.length - 1) return;
    busy = true;
    const page = pages[current];
    page.style.zIndex = String(pages.length + 2);
    page.classList.add("flipped");
    current += 1;

    window.setTimeout(() => {
      page.style.zIndex = String(current);
      busy = false;
      updateControls();
    }, flipDuration);
    updateControls();
  }

  function turnBackward() {
    if (busy || current <= 0) return;
    busy = true;
    current -= 1;
    const page = pages[current];
    page.style.zIndex = String(pages.length + 2);
    page.classList.remove("flipped");

    window.setTimeout(() => {
      pages.forEach((item, index) => {
        item.style.zIndex = item.classList.contains("flipped")
          ? String(index + 1)
          : String(pages.length - index);
      });
      busy = false;
      updateControls();
    }, flipDuration);
    updateControls();
  }

  function restartBook() {
    if (busy) return;
    busy = true;
    pages.forEach((page, index) => {
      page.style.zIndex = String(pages.length - index);
      page.classList.remove("flipped");
    });
    current = 0;
    window.setTimeout(() => {
      busy = false;
      arrangePages();
      updateControls();
    }, flipDuration);
    updateControls();
  }

  nextBtn.addEventListener("click", turnForward);
  prevBtn.addEventListener("click", turnBackward);
  restartInline.addEventListener("click", (event) => {
    event.stopPropagation();
    restartBook();
  });

  // Click/tap the book: right side turns forward, left side turns backward.
  book.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    const rect = book.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (current === 0) {
      turnForward();
      return;
    }
    if (x >= rect.width * 0.52) turnForward();
    else turnBackward();
  });

  // Keyboard support for accessibility and desktop use.
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") turnForward();
    if (event.key === "ArrowLeft" || event.key === "PageUp") turnBackward();
    if (event.key === "Home") restartBook();
  });

  window.addEventListener("resize", arrangePages);
  arrangePages();
  updateControls();
})();
