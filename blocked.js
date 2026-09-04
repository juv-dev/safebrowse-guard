
const qs = new URLSearchParams(location.search);
let reasons = [];
try { reasons = JSON.parse(qs.get("reasons") || "[]"); } catch {}
const ul = document.getElementById("reasons");
for (const r of reasons) {
  const li = document.createElement("li");
  li.textContent = r;
  ul.appendChild(li);
}
document.getElementById("url").textContent = qs.get("url") || "";
document.getElementById("back").addEventListener("click", () => history.back());
