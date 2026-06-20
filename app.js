(function() {
  // Global Controller for the Perspective Carousel
  let carouselController = null;

  // Global Mouse tracking for particles
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ===================== HLS VIDEO BACKGROUND =====================
  const VIDEO_URL = 'https://res.cloudinary.com/dsn0ks2hl/video/upload/upscaled-video_3_dcpffg.m3u8';
  const videoEl = document.getElementById('video-fallback');
  let duration = 0;
  let overlayHidden = false;

  function updateLoadingProgress(pct) {
    const progressEl = document.getElementById('loading-progress');
    if (progressEl) {
      progressEl.textContent = Math.round(Math.min(100, Math.max(0, pct)));
    }
    if (pct >= 95 && !overlayHidden) {
      hideOverlay();
    }
  }

  function hideOverlay() {
    if (overlayHidden) return;
    overlayHidden = true;
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.opacity = 0;
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 600);
    }
  }

  // Backup load timeout
  setTimeout(hideOverlay, 7000);

  // Setup HLS Config
  const hlsConfig = {
    maxBufferLength: 120,
    maxMaxBufferLength: 600,
    maxBufferSize: 200 * 1024 * 1024,
    startPosition: 0,
    capLevelToPlayerSize: false,
    startLevel: -1,
    autoStartLoad: true
  };

  if (Hls.isSupported()) {
    const hls = new Hls(hlsConfig);
    hls.loadSource(VIDEO_URL);
    hls.attachMedia(videoEl);

    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      const maxLevel = hls.levels.length - 1;
      hls.currentLevel = maxLevel;
      hls.startLevel = maxLevel;
    });

    hls.on(Hls.Events.FRAG_BUFFERED, function() {
      if (videoEl.duration) {
        duration = videoEl.duration;
        let bufferedEnd = 0;
        for (let i = 0; i < videoEl.buffered.length; i++) {
          bufferedEnd = Math.max(bufferedEnd, videoEl.buffered.end(i));
        }
        const progress = (bufferedEnd / duration) * 100;
        updateLoadingProgress(progress);
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari Native HLS Support
    videoEl.src = VIDEO_URL;
    videoEl.addEventListener('loadedmetadata', () => {
      duration = videoEl.duration;
    });
    videoEl.addEventListener('progress', () => {
      if (videoEl.duration) {
        duration = videoEl.duration;
        let bufferedEnd = 0;
        for (let i = 0; i < videoEl.buffered.length; i++) {
          bufferedEnd = Math.max(bufferedEnd, videoEl.buffered.end(i));
        }
        const progress = (bufferedEnd / duration) * 100;
        updateLoadingProgress(progress);
      }
    });
  } else {
    // Fallback to Cloudinary MP4
    videoEl.src = 'https://res.cloudinary.com/dsn0ks2hl/video/upload/upscaled-video_3_dcpffg.mp4';
    videoEl.addEventListener('loadedmetadata', () => {
      duration = videoEl.duration;
    });
    videoEl.addEventListener('progress', () => {
      if (videoEl.duration) {
        duration = videoEl.duration;
        let bufferedEnd = 0;
        for (let i = 0; i < videoEl.buffered.length; i++) {
          bufferedEnd = Math.max(bufferedEnd, videoEl.buffered.end(i));
        }
        const progress = (bufferedEnd / duration) * 100;
        updateLoadingProgress(progress);
      }
    });
  }

  videoEl.addEventListener('canplaythrough', () => {
    updateLoadingProgress(100);
    hideOverlay();
  });

  // ===================== GSAP SCROLLTRIGGER =====================
  gsap.registerPlugin(ScrollTrigger);

  // Scroll-to-seek video logic (scrubs video from top of page to bottom)
  let currentTarget = 0;
  let seekPending = false;

  function doSeek(time) {
    currentTarget = time;
    if (!videoEl.seeking) {
      videoEl.currentTime = time;
    } else {
      seekPending = true;
    }
  }

  videoEl.addEventListener('seeked', () => {
    if (seekPending) {
      seekPending = false;
      doSeek(currentTarget);
    }
  });

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      if (videoEl.duration && isFinite(videoEl.duration)) {
        duration = videoEl.duration;
        // Calculate targetTime based on document height as requested
        const targetTime = self.progress * duration;
        
        // Scale and clamp the seek target so that the video completes its 3-second seek animation
        // during the first 30% of the page scroll (the Hero section), remaining at 3.0s for the text zone.
        const maxSeek = Math.min(3.0, duration - 0.1);
        const progressScale = Math.min(1, self.progress / 0.3);
        const clampedTime = progressScale * maxSeek;
        
        doSeek(Math.max(0, clampedTime));
      }
    }
  });



  // Split reveal text into individual characters for each paragraph in the scroll blur & reveal section
  const effectParagraphs = document.querySelectorAll('.text-reveal-effect');
  effectParagraphs.forEach((para) => {
    const text = para.textContent.trim();
    para.textContent = '';
    const words = text.split(' ');
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      for (let char of word) {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.className = 'char-span';
        wordSpan.appendChild(charSpan);
      }
      para.appendChild(wordSpan);
      if (wordIdx < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.textContent = ' ';
        spaceSpan.style.marginRight = '0.25em';
        para.appendChild(spaceSpan);
      }
    });
  });

  const effectTextContainer = document.getElementById('effect-text-container');
  const cardStackSticky = document.getElementById('card-stack-sticky');

  // ScrollTrigger to blur the background video and reveal paragraph characters in staggered fashion
  const blurOverlay = document.getElementById('blur-overlay');

  ScrollTrigger.create({
    trigger: '#text-effect-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      // 1. Animate video blur — ramps up fast with power-2 easing, max 40px
      const maxBlur = 40;
      const easedProgress = Math.pow(self.progress, 0.4); // fast ramp: 0.4 exponent = blurs quickly early on
      const blurValue = easedProgress * maxBlur;
      if (videoEl) {
        videoEl.style.filter = `blur(${blurValue}px)`;
      }

      // 2. Dark overlay — fades in to 0.82 opacity so video is fully obscured
      //    Fades out again at the end (progress > 0.88)
      if (blurOverlay) {
        let overlayAlpha = 0;
        if (self.progress <= 0.88) {
          overlayAlpha = Math.min(0.82, easedProgress * 0.95);
        } else {
          // fade overlay out as text section ends
          overlayAlpha = 0.82 * ((1 - self.progress) / 0.12);
        }
        blurOverlay.style.background = `rgba(2, 4, 10, ${overlayAlpha})`;
      }

      // 3. Character-by-character staggered reveal for each paragraph in order
      const totalParas = effectParagraphs.length;
      effectParagraphs.forEach((para, paraIdx) => {
        // Distribute paragraph reveal times evenly across progress 0.1 to 0.95
        const startInterval = 0.1 + (paraIdx / totalParas) * 0.8;
        const endInterval = 0.1 + ((paraIdx + 1) / totalParas) * 0.8;

        const chars = para.querySelectorAll('.char-span');
        const count = chars.length;

        chars.forEach((charSpan, index) => {
          // Stagger reveal of characters inside this paragraph's interval
          const startProgress = startInterval + (index / count) * (endInterval - startInterval) * 0.7;
          const endProgress = startProgress + (endInterval - startInterval) * 0.25;

          if (self.progress > endProgress) {
            charSpan.classList.add('revealed');
            charSpan.style.opacity = '1';
            charSpan.style.transform = 'translateY(0)';
            charSpan.style.filter = 'blur(0px)';
          } else if (self.progress < startProgress) {
            charSpan.classList.remove('revealed');
            charSpan.style.opacity = '0.15';
            charSpan.style.transform = 'translateY(12px)';
            charSpan.style.filter = 'blur(8px)';
          } else {
            const t = (self.progress - startProgress) / (endProgress - startProgress);
            charSpan.classList.add('revealed');
            charSpan.style.opacity = 0.15 + t * 0.85;
            charSpan.style.transform = `translateY(${12 * (1 - t)}px)`;
            charSpan.style.filter = `blur(${8 * (1 - t)}px)`;
          }
        });
      });

      // 4. Smoothly fade the text container in at the start and out at the end
      if (effectTextContainer) {
        let opacity = 1;
        if (self.progress < 0.1) {
          opacity = self.progress / 0.1;
        } else if (self.progress > 0.85) {
          opacity = (1 - self.progress) / 0.15;
        }
        effectTextContainer.style.opacity = opacity;
      }
    },
    onLeave: () => {
      // Reset blur and overlay when leaving the section downward
      if (videoEl) videoEl.style.filter = 'blur(0px)';
      if (blurOverlay) blurOverlay.style.background = 'rgba(2, 4, 10, 0)';
    },
    onLeaveBack: () => {
      // Reset blur and overlay when scrolling back past the top
      if (videoEl) videoEl.style.filter = 'blur(0px)';
      if (blurOverlay) blurOverlay.style.background = 'rgba(2, 4, 10, 0)';
    }
  });

  ScrollTrigger.create({
    trigger: '#text-effect-section',
    start: 'top top',
    end: 'bottom top',
    toggleClass: { targets: '#effect-text-container', className: 'active' }
  });

  // ---- Smooth card stack entrance: triggered at end of transition section ----
  let cardAnimPlayed = false;

  function playCardEntrance() {
    if (cardAnimPlayed) return;
    cardAnimPlayed = true;

    // 1. Fade + rise the whole sticky wrapper
    gsap.to(cardStackSticky, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.1,
      ease: 'expo.out',
      overwrite: 'auto',
      onStart: () => {
        cardStackSticky.style.pointerEvents = 'auto';
      }
    });

    // 2. Stagger each slide in from below with a slight delay cascade
    const slides = document.querySelectorAll('.carousel-slide');
    gsap.fromTo(slides,
      { opacity: 0, y: 80, scale: 0.88 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: 'expo.out',
        stagger: 0.07,
        delay: 0.15,
        overwrite: 'auto'
      }
    );

    // 3. Fade in controls
    const controls = document.getElementById('carousel-controls');
    if (controls) {
      gsap.fromTo(controls,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.7, overwrite: 'auto' }
      );
    }
  }

  ScrollTrigger.create({
    trigger: '#card-stack-section',
    start: 'top 80%',
    onEnter: () => {
      playCardEntrance();
      // Start autoplay when section is entered
      if (carouselController) {
        carouselController.startAutoplay();
      }
    },
    onLeave: () => {
      // Pause autoplay when section is scrolled out of view at the bottom
      if (carouselController) {
        carouselController.stopAutoplay();
      }
    },
    onEnterBack: () => {
      // Ensure cards are loaded in if we enter from the bottom (e.g. page refresh)
      playCardEntrance();
      // Resume autoplay when user scrolls back up into the section
      if (carouselController) {
        carouselController.startAutoplay();
      }
    },
    onLeaveBack: () => {
      // Reset if user scrolls back up
      cardAnimPlayed = false;
      if (cardStackSticky) {
        cardStackSticky.style.pointerEvents = 'none';
        gsap.to(cardStackSticky, {
          opacity: 0,
          y: 60,
          scale: 0.94,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: 'auto'
        });
      }
      
      const slides = document.querySelectorAll('.carousel-slide');
      gsap.to(slides, {
        opacity: 0,
        y: 80,
        scale: 0.88,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });

      const controls = document.getElementById('carousel-controls');
      if (controls) {
        gsap.to(controls, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power2.inOut',
          overwrite: 'auto'
        });
      }

      // Pause autoplay when section is scrolled out of view at the top
      if (carouselController) {
        carouselController.stopAutoplay();
      }
    }
  });

  ScrollTrigger.create({
    trigger: '#card-stack-section',
    start: 'top 80%',
    end: 'bottom top',
    toggleClass: { targets: '#card-stack-sticky', className: 'active' }
  });


  // ===================== PARTICLES =====================
  const pCanvas = document.getElementById('particles-canvas');
  const pCtx = pCanvas.getContext('2d');
  let particles = [];

  function resizeParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((pCanvas.width * pCanvas.height) / 20000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.18 + 0.08),
        size: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.45 + 0.1,
        seed: Math.random() * 100
      });
    }
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const dxMouse = (mouseX - window.innerWidth / 2) * 0.02;
    const dyMouse = (mouseY - window.innerHeight / 2) * 0.02;

    for (const p of particles) {
      p.x += p.vx + Math.sin(Date.now() * 0.001 + p.seed) * 0.04 + (dxMouse * p.size * 0.08);
      p.y += p.vy + (dyMouse * p.size * 0.08);

      if (p.x < 0) p.x = pCanvas.width;
      if (p.x > pCanvas.width) p.x = 0;
      if (p.y < 0) p.y = pCanvas.height;
      if (p.y > pCanvas.height) p.y = 0;

      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      pCtx.fillStyle = `rgba(0,240,255,${p.opacity})`;
      pCtx.fill();
    }
    requestAnimationFrame(animateParticles);
  }

  resizeParticles();
  window.addEventListener('resize', resizeParticles);
  animateParticles();

  // ===================== HERO FADE =====================
  function updateHeroOpacity() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.45));
    hero.style.opacity = fade;
    hero.style.transform = `translateY(${window.scrollY * 0.15}px)`;
  }

  // ===================== SCROLL PROGRESS BAR =====================
  function updateScrollBar() {
    const bar = document.getElementById('scroll-indicator-bar');
    if (!bar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', () => {
    updateHeroOpacity();
    updateScrollBar();
  }, { passive: true });


  // ===================== COPIER FUNCTIONALITY =====================
  function setupCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetSelector = btn.getAttribute('data-copy-target');
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        let textToCopy = targetElement.textContent || targetElement.innerText;
        if (textToCopy.startsWith('>')) {
          textToCopy = textToCopy.substring(1).trim();
        }

        try {
          await navigator.clipboard.writeText(textToCopy.trim());
          const originalSVG = btn.innerHTML;
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="color:#00f0ff;"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
          setTimeout(() => { btn.innerHTML = originalSVG; }, 2000);
        } catch (err) {
          console.error('Failed to copy code: ', err);
        }
      });
    });
  }
  setupCopyButtons();



  // ===================== 3D FAN CARD STACK =====================
  // ===================== PERSPECTIVE CAROUSEL =====================
  function setupPerspectiveCarousel() {
    const carousel = document.getElementById('perspective-carousel');
    const track = document.getElementById('carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');

    if (!carousel || !track || slides.length === 0) return null;

    let currentIndex = 0;
    const maxIndex = slides.length - 1;
    
    const rotationStep = 60;
    const inactiveScale = 0.85;

    // Initialize track positioning
    gsap.set(track, { yPercent: -50 });

    // 1. Generate dot navigation buttons dynamically
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `dot-btn ${idx === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Show slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          selectSlide(idx);
          resetAutoplay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dotBtns = dotsContainer ? dotsContainer.querySelectorAll('.dot-btn') : [];

    // 2. Select Slide transition function using GSAP
    let autoplayForward = true;

    function selectSlide(nextIndex) {
      currentIndex = Math.max(0, Math.min(nextIndex, maxIndex));

      // Update autoplay direction if boundaries are reached
      if (currentIndex === maxIndex) {
        autoplayForward = false;
      } else if (currentIndex === 0) {
        autoplayForward = true;
      }

      updateCarousel();
    }

    function updateCarousel() {
      const currentSlideWidth = window.innerWidth < 768 ? 130 : 200;
      const safeSlideWidth = Math.max(96, currentSlideWidth);
      const safeInactiveScale = Math.max(0.5, Math.min(inactiveScale, 1.0));

      // Translate track X: animate to -(currentIndex * safeSlideWidth + safeSlideWidth / 2)
      const targetX = -(currentIndex * safeSlideWidth + safeSlideWidth / 2);

      gsap.to(track, {
        x: targetX,
        yPercent: -50,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Animate each slide content (rotateY, scale) and label (filter, opacity)
      slides.forEach((slide, index) => {
        // Set dynamic slide width
        slide.style.width = safeSlideWidth + 'px';

        const content = slide.querySelector('.carousel-slide-content');
        const label = slide.querySelector('.carousel-slide-label');
        const isActive = currentIndex === index;

        // Content animations
        const targetRotateY = (currentIndex - index) * rotationStep;
        const targetScale = isActive ? 1 : safeInactiveScale;

        if (content) {
          gsap.to(content, {
            rotateY: targetRotateY,
            scale: targetScale,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }

        // Label animations
        if (label) {
          gsap.to(label, {
            filter: isActive ? 'blur(0px)' : 'blur(2px)',
            opacity: isActive ? 1 : 0,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      // Update disabled states on controls based on boundary clamping
      if (prevBtn) prevBtn.disabled = currentIndex === 0;
      if (nextBtn) nextBtn.disabled = currentIndex === maxIndex;

      // Update dot buttons active state
      dotBtns.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Autoplay implementation with alternate (yoyo) direction
    let autoplayTimer = null;
    const autoplayDelay = 3000; // 3 seconds

    function startAutoplay() {
      if (autoplayTimer === null) {
        autoplayTimer = setInterval(() => {
          if (autoplayForward) {
            selectSlide(currentIndex + 1);
          } else {
            selectSlide(currentIndex - 1);
          }
        }, autoplayDelay);
      }
    }

    // Explicit stop function
    function stopAutoplay() {
      if (autoplayTimer !== null) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // 3. Attach click event handlers on slides
    slides.forEach((slide, idx) => {
      const btn = slide.querySelector('.carousel-slide-button');
      if (btn) {
        btn.addEventListener('click', (e) => {
          selectSlide(idx);
          resetAutoplay();
        });
      }
    });

    // 4. Attach click handlers on prev/next control buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        selectSlide(currentIndex - 1);
        resetAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        selectSlide(currentIndex + 1);
        resetAutoplay();
      });
    }

    // 5. Attach Keyboard listeners
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectSlide(currentIndex - 1);
        resetAutoplay();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectSlide(currentIndex + 1);
        resetAutoplay();
      }
    });

    // 6. Touch swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      // Only register as a horizontal swipe if X movement is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          selectSlide(currentIndex + 1); // swipe left → next
        } else {
          selectSlide(currentIndex - 1); // swipe right → prev
        }
        resetAutoplay();
      }
    }, { passive: true });

    // 7. Pause autoplay on hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);


    // Initialize layout (do not start autoplay immediately, ScrollTrigger will control it)
    updateCarousel();
    window.addEventListener('resize', updateCarousel);

    return {
      startAutoplay,
      stopAutoplay
    };
  }

  carouselController = setupPerspectiveCarousel();

  // ===================== MOBILE NAV MENU =====================
  function setupMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('nav .nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      if (isOpen) {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(8, 8, 12, 0.95)';
        navLinks.style.borderRadius = '20px';
        navLinks.style.padding = '1.5rem';
        navLinks.style.marginTop = '0.5rem';
        navLinks.style.border = '1px solid var(--border-glass)';
        navLinks.style.backdropFilter = 'blur(20px)';
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        navLinks.style.display = '';
        navLinks.style.flexDirection = '';
        navLinks.style.position = '';
        navLinks.style.top = '';
        navLinks.style.left = '';
        navLinks.style.right = '';
        navLinks.style.background = '';
        navLinks.style.borderRadius = '';
        navLinks.style.padding = '';
        navLinks.style.marginTop = '';
        navLinks.style.border = '';
        navLinks.style.backdropFilter = '';
      }
    });
  }
  setupMobileNav();

  // ===================== SCROLLFLOAT COMPONENT =====================
  function initScrollFloat() {
    const container = document.getElementById('hero-scroll-float');
    if (!container) return;

    const rawText = "Unleash\nPower";
    container.innerHTML = ''; // Clear initial content

    const lines = rawText.split('\n');
    lines.forEach((line, lineIdx) => {
      const lineSpan = document.createElement('span');
      lineSpan.style.display = 'block';

      const words = line.split(' ');
      words.forEach((word, wordIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        for (let char of word) {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.textContent = char;
          wordSpan.appendChild(charSpan);
        }

        lineSpan.appendChild(wordSpan);

        // Add non-breaking space between words, but not after the last word
        if (wordIdx < words.length - 1) {
          const spaceNode = document.createTextNode('\u00A0'); // &nbsp;
          lineSpan.appendChild(spaceNode);
        }
      });

      container.appendChild(lineSpan);
    });

    // GSAP ScrollTrigger Animation
    const chars = container.querySelectorAll('.char');
    if (chars.length > 0) {
      gsap.fromTo(chars,
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          transformOrigin: '50% 0%'
        },
        {
          opacity: 0,
          yPercent: 250,
          scaleY: 1.2,
          scaleX: 0.9,
          stagger: 0.05,
          ease: 'power2.inOut',
          duration: 1,
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: '+=1000',
            scrub: 1.5
          }
        }
      );
    }
  }
  initScrollFloat();

})();
