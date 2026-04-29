/**
 * POLL.JS
 * 
 * Polls the server every half second for the current slide number,
 * changes preview image, notes and thumbnail highlight on slide change.
 */


/**
 * Fetches current slide from the server and updates all dependent widgets.
 * -1 means PowerPoint is not in slideshow mode, so we skip updates.
 */
async function pollSlide() {
  try {
    const slide = await fetch('/current').then(r => r.text());
    const curr = parseInt(slide);

    // Update text counter
    const counter = document.getElementById('counter-span');
    if (counter) counter.textContent = `${slide} / ${slideCount}`;

    if (slide !== lastSlide && slide !== '-1') {
      lastSlide = slide;
      
      const BLACK_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const timestamp = Date.now();

      // 1. Current Preview
      const img = document.getElementById('preview-img');
      if (img) img.src = `/preview?ts=${timestamp}`;

      // 2. Next Slide Preview Failsafe
      const nextImg = document.getElementById('next-preview');
      if (nextImg) {
          if (curr >= slideCount) {
              nextImg.src = BLACK_PIXEL;
          } else {
              nextImg.src = `/thumb/${curr + 1}?ts=${timestamp}`;
          }
      }

      // 3. Previous Slide Preview Failsafe
      const prevImg = document.getElementById('prev-preview');
      if (prevImg) {
          if (curr <= 1) {
              prevImg.src = BLACK_PIXEL;
          } else {
              prevImg.src = `/thumb/${curr - 1}?ts=${timestamp}`;
          }
      }

      // 4. Update Notes
      const notes = await fetch('/notes').then(r => r.text());
      const nb = document.getElementById('notes-body');
      if (nb) nb.textContent = notes || '(no notes)';

      onSlideChangeVideo();
      clearLocalCanvas();
      highlightThumb(slide);
    }
  } catch (err){
    console.debug('Poll failed:', err.message);
  }
}

setInterval(pollSlide, 500);