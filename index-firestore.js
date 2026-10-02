import { subscribeLibraryItems, trackEvent } from "./firebase.js";

let items = JSON.parse(JSON.stringify(window.STARTER_ITEMS || []));
let activeCat = "すべて";
let activeMethod = "すべて";
const q = document.getElementById("q");
const grid = document.getElementById("grid");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const syncStatus = document.getElementById("syncStatus");

function buildFilters(vals, target, type) {
  vals.forEach((v) => {
    const b = document.createElement("button");
    b.className = "filter" + (type === "method" ? " method" : "") + (v === "すべて" ? " active" : "");
    b.textContent = v;
    b.onclick = () => {
      if (type === "cat") activeCat = v; else activeMethod = v;
      [...target.querySelectorAll(".filter")].forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    };
    target.appendChild(b);
  });
}

buildFilters(window.CATEGORIES, document.getElementById("catFilters"), "cat");
buildFilters(window.METHODS, document.getElementById("methodFilters"), "method");

function render() {
  const w = q.value.trim().toLowerCase();
  const f = items.filter((x) =>
    (activeCat === "すべて" || x.category === activeCat) &&
    (activeMethod === "すべて" || x.method === activeMethod) &&
    (!w || (x.id + " " + x.name + " " + x.category + " " + x.desc + " " + x.tags + " " + x.use).toLowerCase().includes(w))
  );
  count.textContent = f.length;
  grid.innerHTML = f.map((x) => `<article class="card" data-id="${esc(x.id)}"><div class="preview">${renderMedia(x)}</div><div class="cardBody"><div class="meta"><span class="code">${esc(x.id)}</span><div class="tags"><span class="tag">${esc(x.category)}</span><span class="tag ${methodClass(x.method)}">${esc(x.method)}</span></div></div><h3>${esc(x.name)}</h3><p>${esc(x.desc)}</p></div></article>`).join("");
  empty.style.display = f.length ? "none" : "block";
  document.querySelectorAll(".card").forEach((el) => el.onclick = () => openDetail(el.dataset.id));
}
q.oninput = render;

const modal = document.getElementById("modal");
function openDetail(id) {
  const x = items.find((i) => i.id === id);
  if (!x) return;
  document.getElementById("bigPrev").innerHTML = `<div class="preview">${renderMedia(x, true)}</div>`;
  document.getElementById("dCode").textContent = x.id + " / " + x.category;
  document.getElementById("dName").textContent = x.name;
  document.getElementById("dDesc").textContent = x.desc;
  document.getElementById("dPills").innerHTML = `<span class="pill">${esc(x.level || "")}</span><span class="pill">${esc(x.method || "")}</span><span class="pill">${esc(x.category || "")}</span>`;
  document.getElementById("dUse").textContent = x.use || "";
  document.getElementById("dTech").textContent = x.tech || "";
  document.getElementById("dNote").textContent = x.note || "";
  document.getElementById("dTags").textContent = x.tags || "";
  document.getElementById("dYT").href = x.youtube || ("https://www.youtube.com/results?search_query=" + encodeURIComponent(x.name + " tutorial"));
  trackEvent("library_item_open", { item_id: x.id, category: x.category || "" });
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }
document.getElementById("close").onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };
window.onkeydown = (e) => { if (e.key === "Escape") closeModal(); };

render();
subscribeLibraryItems((firestoreItems) => {
  if (firestoreItems.length) items = firestoreItems;
  else items = JSON.parse(JSON.stringify(window.STARTER_ITEMS || []));
  syncStatus.textContent = firestoreItems.length ? "● データベース同期済み" : "● データベースは空（初期見本を表示）";
  syncStatus.classList.add("online");
  render();
}, (error) => {
  console.error(error);
  syncStatus.textContent = "● データベース接続エラー（初期見本を表示）";
  syncStatus.classList.add("error");
  items = JSON.parse(JSON.stringify(window.STARTER_ITEMS || []));
  render();
});
