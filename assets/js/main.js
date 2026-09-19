(function(){
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  navToggle.addEventListener("click", function(){
    var open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------------
     Scrollspy — highlight active nav link
  --------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));

  function updateActiveNav(){
    var scrollPos = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function(sec){
      if (sec.offsetTop <= scrollPos) current = sec;
    });
    navAnchors.forEach(function(a){
      a.classList.toggle("active", a.getAttribute("data-section") === current.id);
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive:true });
  updateActiveNav();

  /* ---------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion){
    revealEls.forEach(function(el){ el.classList.add("in-view"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------------------------------------------------------
     Stat counters
  --------------------------------------------------------- */
  var statEls = document.querySelectorAll(".stat");
  var statObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.dataset.static){ statObserver.unobserve(el); return; }
      var counterEl = el.querySelector(".counter");
      var target = parseFloat(el.dataset.value);
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      if (reducedMotion){
        counterEl.textContent = target.toFixed(decimals);
        statObserver.unobserve(el);
        return;
      }
      var duration = 1200;
      var start = null;
      function step(ts){
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        counterEl.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      statObserver.unobserve(el);
    });
  }, { threshold:0.4 });
  statEls.forEach(function(el){ statObserver.observe(el); });

  /* ---------------------------------------------------------
     Hero node graph — User -> Agent -> RAG -> LLM -> DB -> Response
  --------------------------------------------------------- */
  (function buildNodeGraph(){
    var svg = document.getElementById("nodeGraph");
    if (!svg) return;
    var linesG = document.getElementById("graphLines");
    var nodesG = document.getElementById("graphNodes");
    var labelsG = document.getElementById("graphLabels");
    var NS = "http://www.w3.org/2000/svg";

    var flow = [
      { id:"user", label:"User", x:80,  y:100 },
      { id:"agent", label:"AI Agent", x:280, y:60 },
      { id:"rag", label:"RAG", x:460, y:150 },
      { id:"llm", label:"LLM", x:420, y:330 },
      { id:"db", label:"Database", x:210, y:420 },
      { id:"resp", label:"Response", x:70, y:300 }
    ];
    var techLabels = [
      { t:"Python", x:60, y:210 },
      { t:"LangGraph", x:340, y:220 },
      { t:"FastAPI", x:150, y:480 },
      { t:"PostgreSQL", x:330, y:470 },
      { t:"Ollama", x:470, y:270 },
      { t:"LLM", x:490, y:80 }
    ];

    // connecting path (cycle through the flow)
    for (var i=0;i<flow.length;i++){
      var a = flow[i], b = flow[(i+1) % flow.length];
      var line = document.createElementNS(NS,"line");
      line.setAttribute("x1",a.x); line.setAttribute("y1",a.y);
      line.setAttribute("x2",b.x); line.setAttribute("y2",b.y);
      line.setAttribute("class","graph-line");
      line.setAttribute("stroke", i % 2 === 0 ? "#4cc9f0" : "#8b5cf6");
      linesG.appendChild(line);
    }

    flow.forEach(function(n, idx){
      var g = document.createElementNS(NS,"g");
      var circle = document.createElementNS(NS,"circle");
      circle.setAttribute("cx", n.x); circle.setAttribute("cy", n.y);
      circle.setAttribute("r", idx === 0 ? 30 : 26);
      circle.setAttribute("class","node-circle node-glow");
      circle.setAttribute("stroke", idx % 2 === 0 ? "#4cc9f0" : "#8b5cf6");
      g.appendChild(circle);
      nodesG.appendChild(g);

      var text = document.createElementNS(NS,"text");
      text.setAttribute("x", n.x); text.setAttribute("y", n.y + 4);
      text.setAttribute("text-anchor","middle");
      text.setAttribute("font-size","9.5");
      text.textContent = n.label;
      labelsG.appendChild(text);

      if (!reducedMotion){
        var anim = document.createElementNS(NS,"animateTransform");
        anim.setAttribute("attributeName","transform");
        anim.setAttribute("type","translate");
        anim.setAttribute("values","0,0; 0,-6; 0,0");
        anim.setAttribute("dur", (5 + idx*0.6) + "s");
        anim.setAttribute("repeatCount","indefinite");
        g.appendChild(anim);
      }
    });

    techLabels.forEach(function(l){
      var text = document.createElementNS(NS,"text");
      text.setAttribute("x", l.x); text.setAttribute("y", l.y);
      text.setAttribute("font-size","10.5");
      text.setAttribute("opacity","0.55");
      text.textContent = l.t;
      labelsG.appendChild(text);
    });

    // traveling particles along the loop, purely decorative
    if (!reducedMotion){
      for (var p=0;p<3;p++){
        var particle = document.createElementNS(NS,"circle");
        particle.setAttribute("r","3.2");
        particle.setAttribute("class","graph-particle");
        var animMotion = document.createElementNS(NS,"animateMotion");
        var pathD = "M" + flow.map(function(n){ return n.x+","+n.y; }).join(" L") + " Z";
        animMotion.setAttribute("path", pathD);
        animMotion.setAttribute("dur", (7 + p*2) + "s");
        animMotion.setAttribute("repeatCount","indefinite");
        animMotion.setAttribute("begin", (p*2) + "s");
        particle.appendChild(animMotion);
        nodesG.appendChild(particle);
      }
    }
  })();

  /* ---------------------------------------------------------
     Projects data + render + modal
  --------------------------------------------------------- */
  var projects = [
    {
      id: "mentra",
      featured: true,
      tag: "Featured project",
      name: "Mentra",
      subtitle: "Adaptive AI Mentoring System",
      tech: ["React","FastAPI","PostgreSQL","SQLAlchemy","Ollama"],
      desc: "An adaptive AI mentoring platform that transforms a user's goal, knowledge level, routine, and target date into a personalized learning roadmap.",
      problem: "Generic study plans don't adapt to a learner's actual pace, knowledge gaps, or missed days.",
      solution: "Mentra turns a stated goal and routine into a personalized roadmap, then adapts it in real time using RAG-based recommendations and local LLM reasoning through Ollama.",
      flow: ["User Goal","Knowledge Level","Routine + Available Time","AI Planning","RAG + LLM","Personalized Roadmap","Daily Check-ins","Adaptive Replanning"],
      features: [
        "Personalized roadmap generation","Milestones","Weekly goals","Daily tasks",
        "Adaptive workload planning","Recovery logic","Daily check-ins","Completed/missed task handling",
        "RAG-based recommendations","Weak-area detection","Local LLM integration via Ollama","Revision planning",
        "Reminders","Daily analytics","Weekly analytics","Monthly analytics"
      ],
      links: { github: null, demo: null }
    },
    {
      id: "websecautoguard",
      featured: false,
      tag: "Cybersecurity",
      name: "WebSec_AutoGuard",
      subtitle: "Python Web Vulnerability Scanner",
      tech: ["Python","Flask","Requests","BeautifulSoup","FPDF"],
      desc: "A Python-based web vulnerability scanner designed to identify common web security weaknesses through automated scanning.",
      problem: "Manually auditing a site for common web security misconfigurations is slow and easy to do incompletely.",
      solution: "An automated scanner that crawls a target site, tests for common vulnerabilities in parallel, and produces a reviewable dashboard plus exportable reports.",
      flow: ["Target Website","Link Discovery","Parallel Scanner","Security Tests","Vulnerability Detection","Dashboard","PDF / JSON Report"],
      features: [
        "XSS detection","Insecure HTTP detection","Missing CSP detection","Missing X-Frame-Options detection",
        "Missing X-Content-Type-Options detection","Static/missing CSRF token checks","Unbounded input field checks",
        "Multithreaded scanning (up to 10 threads)","51+ discovered internal links","CLI interface",
        "Flask web dashboard","PDF reports","JSON reports","Scan logs"
      ],
      links: { github: null, demo: null }
    },
    {
      id: "studypilot",
      featured: false,
      tag: "Generative AI",
      name: "StudyPilot",
      subtitle: "AI-Powered Study Assistant",
      tech: ["Python","Streamlit","Gemini API","Tesseract OCR","PyPDF2"],
      desc: "An AI study assistant that transforms notes, PDFs, and images into interactive learning material.",
      problem: "Turning raw notes, scanned pages, and PDFs into usable study material (quizzes, summaries, flashcards) takes real manual effort.",
      solution: "StudyPilot extracts text from PDFs and images via OCR, cleans it up with an LLM, and generates answers, quizzes, summaries, and flashcards through the Gemini 2.5 Flash API.",
      flow: ["PDF / Image / Notes","Text Extraction","OCR / PDF Processing","LLM Processing","Answers / Quiz / Summary / Flashcards"],
      features: [
        "Answer generation","Quiz generation","Summaries","Flashcards","Doubt-solving chat","Chat memory",
        "Difficulty-based quizzes","Bullet summaries","Table summaries","Paragraph summaries",
        "PDF text extraction","Image OCR","OCR text cleanup using LLMs","Gemini 2.5 Flash integration"
      ],
      links: { github: null, demo: null },
      deployment: "Streamlit Cloud"
    },
    {
      id: "burnout-predictor",
      featured: false,
      tag: "Machine Learning",
      name: "Student Burnout Predictor",
      subtitle: "Machine Learning Prediction Web App",
      tech: ["Python","Streamlit","Scikit-learn","Pandas","NumPy"],
      desc: "An ML-powered web application that predicts student burnout levels from academic and lifestyle inputs.",
      problem: "Burnout often goes unnoticed until it's already affecting academic performance and wellbeing.",
      solution: "A Scikit-learn classification model takes academic and lifestyle inputs and predicts a burnout level in real time through an interactive Streamlit interface.",
      flow: ["Academic + Lifestyle Inputs","Data Preprocessing (Pandas / NumPy)","Scikit-learn Classification Model","Predicted Burnout Level","Interactive Streamlit UI"],
      features: [
        "Predicts Low / Medium / High burnout risk","Scikit-learn classification model","Pandas & NumPy data handling",
        "Interactive Streamlit UI","Real-time prediction","Data analysis with Matplotlib & Seaborn"
      ],
      links: { github: null, demo: null },
      deployment: "Streamlit Cloud"
    }
  ];

  var arrowSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function renderProjects(){
    var grid = document.getElementById("projectsGrid");
    grid.innerHTML = projects.map(function(p){
      var linksHtml =
        '<div class="project-links">' +
        '<a href="' + (p.links.github || "#") + '" class="' + (p.links.github ? "" : "disabled") + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">GitHub</a>' +
        (p.links.demo ? '<a href="' + p.links.demo + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Live demo</a>' : '') +
        '</div>';

      return (
        '<article class="project-card' + (p.featured ? " featured" : "") + '" id="project-' + p.id + '" data-project="' + p.id + '" tabindex="0" role="button" aria-label="View details for ' + p.name + '">' +
          '<p class="project-tag">' + p.tag + '</p>' +
          '<h3 class="project-name">' + p.name + '</h3>' +
          '<p class="project-subtitle">' + p.subtitle + '</p>' +
          '<p class="project-desc">' + p.desc + '</p>' +
          '<div class="project-tech">' + p.tech.map(function(t){ return "<span>" + t + "</span>"; }).join("") + '</div>' +
          '<div class="project-footer">' +
            '<span class="project-cta">View details ' + arrowSvg + '</span>' +
            linksHtml +
          '</div>' +
        '</article>'
      );
    }).join("");

    grid.querySelectorAll(".project-card").forEach(function(card){
      card.addEventListener("click", function(){ openModal(card.dataset.project); });
      card.addEventListener("keydown", function(e){
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); openModal(card.dataset.project); }
      });
    });
  }
  renderProjects();

  /* ---------------------------------------------------------
     Modal
  --------------------------------------------------------- */
  var overlay = document.getElementById("modalOverlay");
  var modalContent = document.getElementById("modalContent");
  var modalClose = document.getElementById("modalClose");
  var lastFocused = null;

  function openModal(id){
    var p = projects.filter(function(x){ return x.id === id; })[0];
    if (!p) return;
    lastFocused = document.activeElement;

    modalContent.innerHTML =
      '<p class="project-tag">' + p.tag + '</p>' +
      '<h3 id="modalTitle">' + p.name + '</h3>' +
      '<p class="project-subtitle">' + p.subtitle + '</p>' +

      '<p class="modal-section-title">Problem</p><p>' + p.problem + '</p>' +
      '<p class="modal-section-title">Solution</p><p>' + p.solution + '</p>' +

      '<p class="modal-section-title">Architecture</p>' +
      '<div class="flow-diagram">' +
        p.flow.map(function(step, idx){
          return '<div class="flow-step">' + step + '</div>' + (idx < p.flow.length - 1 ? '<div class="flow-arrow">&darr;</div>' : '');
        }).join("") +
      '</div>' +

      '<p class="modal-section-title">Technologies</p>' +
      '<div class="project-tech">' + p.tech.map(function(t){ return "<span>" + t + "</span>"; }).join("") + '</div>' +

      '<p class="modal-section-title">Key features</p>' +
      '<ul class="feature-list">' + p.features.map(function(f){ return "<li>" + f + "</li>"; }).join("") + '</ul>' +

      (p.deployment ? '<p class="modal-section-title">Deployment</p><p>' + p.deployment + '</p>' : '') +

      '<p class="modal-section-title">Links</p>' +
      '<div class="project-links">' +
        '<a href="' + (p.links.github || "#") + '" class="' + (p.links.github ? "" : "disabled") + '" target="_blank" rel="noopener noreferrer">GitHub' + (p.links.github ? '' : ' (add link)') + '</a>' +
        (p.links.demo ? '<a href="' + p.links.demo + '" target="_blank" rel="noopener noreferrer">Live demo</a>' : '<a href="#" class="disabled">Live demo (n/a)</a>') +
      '</div>';

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal(){
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", function(e){ if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });

  // deep-link support: #project-mentra / #project-websecautoguard from experience timeline
  document.querySelectorAll('a[href^="#project-"]').forEach(function(a){
    a.addEventListener("click", function(e){
      e.preventDefault();
      var id = a.getAttribute("href").replace("#project-", "");
      document.getElementById("projects").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      setTimeout(function(){ openModal(id); }, reducedMotion ? 0 : 500);
    });
  });

  /* ---------------------------------------------------------
     Copy email button
  --------------------------------------------------------- */
  var copyBtn = document.querySelector(".copy-btn");
  if (copyBtn){
    copyBtn.addEventListener("click", function(){
      var value = copyBtn.dataset.copy;
      if (navigator.clipboard){
        navigator.clipboard.writeText(value).then(function(){
          copyBtn.classList.add("copied");
          setTimeout(function(){ copyBtn.classList.remove("copied"); }, 2000);
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Contact form — mailto fallback (no backend configured)
  --------------------------------------------------------- */
  var form = document.getElementById("contactForm");
  if (form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var subject = encodeURIComponent("Portfolio contact from " + name);
      var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:niranvelu2005@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

})();
