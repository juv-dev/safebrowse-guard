
async function load() {
  const s = await chrome.storage.local.get({ enabled: true, strictUnknown: true });
  document.getElementById("enabled").checked = s.enabled;
  document.getElementById("strictUnknown").checked = s.strictUnknown;
}
async function save() {
  await chrome.storage.local.set({
    enabled: document.getElementById("enabled").checked,
    strictUnknown: document.getElementById("strictUnknown").checked
  });
  const st = document.getElementById("status");
  st.textContent = "Guardado";
  setTimeout(() => st.textContent = "", 1200);
}
document.getElementById("save").addEventListener("click", save);
load();
