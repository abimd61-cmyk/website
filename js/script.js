/* Pinky Blush Makeover — site script */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Hero slider ---------- */
  var slider = document.querySelector(".hero-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dotsWrap = slider.querySelector(".hero-dots");
    var prevBtn = slider.querySelector(".hero-prev");
    var nextBtn = slider.querySelector(".hero-next");
    var current = 0;
    var timer = null;
    var AUTOPLAY_MS = 6000;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "hero-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".hero-dot"));

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = (index + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function startAutoplay() { timer = setInterval(next, AUTOPLAY_MS); }
    function stopAutoplay() { if (timer) clearInterval(timer); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); resetAutoplay(); });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", startAutoplay);

    /* touch swipe */
    var touchStartX = 0;
    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      startAutoplay();
    }, { passive: true });

    startAutoplay();
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("is-visible", window.scrollY > 420);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- Gallery lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.querySelector(".lightbox");
  if (galleryItems.length && lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var lbIndex = 0;

    function openLightbox(i) {
      lbIndex = i;
      var img = galleryItems[i].querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = img.alt;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }
    function showRelative(step) {
      openLightbox((lbIndex + step + galleryItems.length) % galleryItems.length);
    }

    galleryItems.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
      });
    });
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtnLb = lightbox.querySelector(".lightbox-prev");
    var nextBtnLb = lightbox.querySelector(".lightbox-next");
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtnLb) prevBtnLb.addEventListener("click", function () { showRelative(-1); });
    if (nextBtnLb) nextBtnLb.addEventListener("click", function () { showRelative(1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showRelative(1);
      if (e.key === "ArrowLeft") showRelative(-1);
    });
  }

  /* ---------- Enquiry form validation ---------- */
  var form = document.querySelector(".enquiry-form");
  if (form) {
    var successBox = document.querySelector(".form-success");

    function setError(field, message) {
      field.classList.toggle("has-error", !!message);
      var msg = field.querySelector(".error-msg");
      if (msg) msg.textContent = message || "";
    }

    function validateField(field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return true;
      var value = input.value.trim();

      if (input.hasAttribute("required") && !value) {
        setError(field, "This field is required.");
        return false;
      }
      if (input.type === "email" && value) {
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setError(field, "Please enter a valid email address.");
          return false;
        }
      }
      if (input.type === "tel" && value) {
        var phonePattern = /^[0-9+\s-]{8,15}$/;
        if (!phonePattern.test(value)) {
          setError(field, "Please enter a valid phone number.");
          return false;
        }
      }
      setError(field, "");
      return true;
    }

    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));
      var valid = fields.reduce(function (ok, field) {
        var fieldOk = validateField(field);
        return ok && fieldOk;
      }, true);

      if (!valid) {
        var firstError = form.querySelector(".has-error input, .has-error select, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      if (successBox) {
        successBox.classList.add("is-visible");
        successBox.setAttribute("tabindex", "-1");
        successBox.focus();
        successBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* ---------- Focus enquiry form when hash target ---------- */
  if (window.location.hash === "#enquiry-form") {
    var target = document.getElementById("enquiry-form");
    if (target) {
      window.addEventListener("load", function () {
        target.scrollIntoView({ behavior: "smooth" });
      });
    }
  }
})();
