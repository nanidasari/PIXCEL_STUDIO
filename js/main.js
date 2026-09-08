/* Pixcel Studio — site script
   Loads editable content from /content/*.json (managed by the CMS at /admin)
   and renders it into the page. No build step required.
*/

async function loadJSON(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}

function setText(scope, data){
  scope.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    if(data[key] !== undefined) el.textContent = data[key];
  });
}

function renderServices(services){
  const grid = document.getElementById("services-grid");
  grid.innerHTML = services.map(s => `
    <article class="service-card">
      <div class="code">${s.code}</div>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
      <ul>
        ${s.deliverables.map(d => `<li>${d}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function renderWork(works){
  const grid = document.getElementById("work-grid");
  const filterBar = document.getElementById("work-filters");

  const categories = ["All", ...new Set(works.map(w => w.category))];

  filterBar.innerHTML = categories.map((c, i) =>
    `<button data-cat="${c}" class="${i === 0 ? "active" : ""}">${c}</button>`
  ).join("");

  function draw(list){
    grid.innerHTML = list.map(w => `
      <article class="work-card">
        <div class="work-swatch" role="img" aria-label="${w.title} colour palette">
          ${w.palette.map(c => `<span style="background:${c}"></span>`).join("")}
        </div>
        <div class="work-info">
          <div class="cat">${w.category}</div>
          <h3>${w.title}</h3>
          <p>${w.description}</p>
          <div class="year">${w.year}</div>
        </div>
      </article>
    `).join("");
  }

  draw(works);

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;
    filterBar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    draw(cat === "All" ? works : works.filter(w => w.category === cat));
  });
}

function renderTestimonials(list){
  const grid = document.getElementById("testi-grid");
  grid.innerHTML = list.map(t => `
    <article class="testi-card">
      <blockquote>"${t.quote}"</blockquote>
      <div class="who">
        <span class="name">${t.name}</span> — <span class="role">${t.role}</span>
      </div>
    </article>
  `).join("");
}

function buildPixelGrid(){
  const el = document.getElementById("pixel-grid");
  if(!el) return;
  const cols = 8, rows = 8;
  const palette = ["#ff2e63", "#d4ff3f", "#14130f", "#f7f4ec", "#ede8dd"];
  el.style.setProperty("--cols", cols);
  const frag = document.createDocumentFragment();
  for(let i = 0; i < cols * rows; i++){
    const cell = document.createElement("i");
    const filled = Math.random() < 0.55;
    cell.style.background = filled
      ? palette[Math.floor(Math.random() * palette.length)]
      : "transparent";
    cell.style.animationDelay = (Math.random() * 0.6) + "s";
    frag.appendChild(cell);
  }
  el.appendChild(frag);
}

function initMenu(){
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

function encodeForm(data){
  return Object.keys(data)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(data[k]))
    .join("&");
}

function initForm(){
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(data),
    })
      .then(() => {
        form.reset();
        note.textContent = "Thanks — your message was sent. We'll reply within two working days.";
      })
      .catch(() => {
        note.textContent = "Couldn't send from here. This works once deployed on Netlify — see README.";
      });
  });
}

async function init(){
  document.getElementById("year-note").textContent = "© " + new Date().getFullYear();
  initMenu();
  initForm();
  buildPixelGrid();

  try{
    const [site, services, works, testimonials] = await Promise.all([
      loadJSON("content/site.json"),
      loadJSON("content/services.json"),
      loadJSON("content/works.json"),
      loadJSON("content/testimonials.json"),
    ]);
    setText(document, site);
    renderServices(services.items || []);
    renderWork(works.items || []);
    renderTestimonials(testimonials.items || []);
  }catch(err){
    console.error("Content failed to load — are you serving this over http(s)? See README.", err);
  }
}

init();
