import {
  observeAuth,
  signInGoogle,
  signOutGoogle,
  claimOrVerifyAdmin,
  subscribeLibraryItems,
  saveLibraryItem,
  deleteLibraryItem,
  seedLibraryItems,
  trackEvent
} from "./firebase.js";

let items = [];
let selectedId = null;
let unsubscribeItems = null;
let currentUser = null;
let adminAllowed = false;

const builtins = ["title","mask","keyword","icons","count","kpi","bars","flow","beforeafter","split","lowerthird","uipanel","staticcam","pan","pushin","focus","broll","jlcut","shotseq","speedramp","parallax","browser","cursor","fade","dissolve","wipe","pushtrans"];
const $ = (id) => document.getElementById(id);

window.CATEGORIES.filter((x) => x !== "すべて").forEach((x) => $("fCategory").insertAdjacentHTML("beforeend", `<option>${esc(x)}</option>`));
window.METHODS.filter((x) => x !== "すべて").forEach((x) => $("fMethod").insertAdjacentHTML("beforeend", `<option>${esc(x)}</option>`));
builtins.forEach((x) => $("fPreview").insertAdjacentHTML("beforeend", `<option>${esc(x)}</option>`));

function setGate(mode, message = "") {
  const gate = $("authGate");
  const shell = $("adminShell");
  if (mode === "open") {
    gate.classList.add("hidden");
    shell.classList.add("ready");
    shell.setAttribute("aria-hidden", "false");
  } else {
    gate.classList.remove("hidden");
    shell.classList.remove("ready");
    shell.setAttribute("aria-hidden", "true");
    $("authMessage").textContent = message || "編集するにはGoogleアカウントでログインしてください。";
  }
}

function setAuthError(message, user = null) {
  setGate("closed", message);
  $("loginBtn").classList.add("hidden");
  $("logoutGateBtn").classList.remove("hidden");
  $("authDetail").innerHTML = user ? `ログイン中：<b>${esc(user.email || user.uid)}</b><br>UID：<code>${esc(user.uid)}</code>` : "";
}

async function activateAdmin(user) {
  currentUser = user;
  $("authMessage").textContent = "管理者権限を確認しています...";
  $("authDetail").textContent = user.email || user.uid;
  try {
    const result = await claimOrVerifyAdmin(user);
    if (!result.allowed) {
      adminAllowed = false;
      setAuthError("このGoogleアカウントには管理者権限がありません。", user);
      return;
    }
    adminAllowed = true;
    $("accountName").textContent = user.displayName || "管理者";
    $("accountEmail").textContent = user.email || user.uid;
    setGate("open");
    startItemsSubscription();
  } catch (error) {
    console.error(error);
    setAuthError("管理者確認に失敗しました。アクセスルールの設定を確認してください。", user);
  }
}

observeAuth((user) => {
  if (user) activateAdmin(user);
  else {
    currentUser = null;
    adminAllowed = false;
    if (unsubscribeItems) unsubscribeItems();
    unsubscribeItems = null;
    $("loginBtn").classList.remove("hidden");
    $("logoutGateBtn").classList.add("hidden");
    $("authDetail").textContent = "";
    setGate("closed");
  }
});

$("loginBtn").onclick = async () => {
  $("loginBtn").disabled = true;
  $("authMessage").textContent = "Googleログインを開いています...";
  try { await signInGoogle(); }
  catch (error) {
    console.error(error);
    $("authMessage").textContent = error.code === "auth/popup-blocked" ? "ポップアップがブロックされました。ブラウザで許可して再度お試しください。" : "Googleログインに失敗しました。Firebase Authenticationの設定を確認してください。";
  } finally { $("loginBtn").disabled = false; }
};
$("logoutBtn").onclick = () => signOutGoogle();
$("logoutGateBtn").onclick = () => signOutGoogle();

function startItemsSubscription() {
  if (unsubscribeItems) unsubscribeItems();
  unsubscribeItems = subscribeLibraryItems((fresh) => {
    items = fresh;
    $("emptyデータベースBanner").classList.toggle("hidden", items.length !== 0);
    if (!selectedId || !items.some((x) => x.id === selectedId)) selectedId = items[0]?.id || null;
    renderList();
    if (selectedId) loadSelected();
    else clearForm();
  }, (error) => {
    console.error(error);
    $("status").textContent = "データベースの読み込みに失敗しました";
  });
}

function renderList() {
  const w = $("sideSearch").value.trim().toLowerCase();
  $("itemList").innerHTML = items.filter((x) => !w || (x.id + " " + x.name + " " + x.category).toLowerCase().includes(w)).map((x) => `<button class="itemBtn ${x.id === selectedId ? "active" : ""}" data-id="${esc(x.id)}"><b>${esc(x.id)}｜${esc(x.name)}</b><span>${esc(x.category)} / ${esc(x.method)}</span></button>`).join("");
  document.querySelectorAll(".itemBtn").forEach((b) => b.onclick = () => { selectedId = b.dataset.id; loadSelected(); renderList(); });
}


function clearForm() {
  ["fId","fName","fDesc","fUse","fTech","fNote","fTags","fYoutube","fMediaUrl"].forEach((id) => $(id).value = "");
  $("fCategory").value = "モーション";
  $("fMethod").value = "AE";
  $("fLevel").value = "初級";
  $("fPreview").value = "title";
  $("fAnimate").checked = false;
  renderPreview();
}

function loadSelected() {
  const x = items.find((i) => i.id === selectedId);
  if (!x) return;
  const map = {
    Id: "id", Name: "name", Desc: "desc", Use: "use", Tech: "tech",
    Note: "note", Tags: "tags", Youtube: "youtube", MediaUrl: "mediaUrl"
  };
  Object.entries(map).forEach(([suffix, key]) => $("f" + suffix).value = x[key] || "");
  $("fCategory").value = x.category || "モーション";
  $("fMethod").value = x.method || "AE";
  $("fLevel").value = x.level || "初級";
  $("fPreview").value = x.preview || "title";
  $("fAnimate").checked = !!x.animate;
  renderPreview();
}

function currentDraft() {
  const existing = items.find((i) => i.id === selectedId) || {};
  return {
    ...existing,
    id: $("fId").value.trim(),
    name: $("fName").value.trim(),
    category: $("fCategory").value,
    method: $("fMethod").value,
    level: $("fLevel").value,
    desc: $("fDesc").value.trim(),
    use: $("fUse").value.trim(),
    tech: $("fTech").value.trim(),
    note: $("fNote").value.trim(),
    tags: $("fTags").value.trim(),
    youtube: $("fYoutube").value.trim(),
    preview: $("fPreview").value,
    animate: $("fAnimate").checked,
    mediaUrl: $("fMediaUrl").value.trim(),
    mediaType: ""
  };
}

function renderPreview() {
  $("previewAdmin").innerHTML = renderMedia(currentDraft(), true);
}
["fPreview","fAnimate","fMediaUrl","fName","fMethod"].forEach((id) => $(id).addEventListener("input", renderPreview));

function showSavedFeedback(message = "保存しました") {
  const btn = $("saveBtn");
  btn.textContent = "✓ 編集完了！";
  btn.classList.add("saved");
  btn.disabled = true;
  $("status").textContent = message;
  $("saveToast").classList.add("show");
  setTimeout(() => {
    btn.textContent = "保存する";
    btn.classList.remove("saved");
    btn.disabled = false;
  }, 1700);
  setTimeout(() => {
    $("status").textContent = "";
    $("saveToast").classList.remove("show");
  }, 2600);
}

$("saveBtn").onclick = async () => {
  if (!adminAllowed) return;
  const x = currentDraft();
  if (!x.id || !x.name) { alert("IDと名称は必須です"); return; }
  const old = items.find((i) => i.id === selectedId) || {};
  $("saveBtn").disabled = true;
  $("saveBtn").textContent = "保存中...";
  $("status").textContent = "保存する中...";
  try {
    await saveLibraryItem(x);
    if (selectedId && selectedId !== x.id && old.id) {
      await deleteLibraryItem(old);
    }
    selectedId = x.id;
    showSavedFeedback("保存しました");
  } catch (error) {
    console.error(error);
    $("saveBtn").disabled = false;
    $("saveBtn").textContent = "保存する";
    $("status").textContent = "保存に失敗しました";
    alert("保存に失敗しました。保存権限とログイン状態を確認してください。\n\n" + (error.message || error));
  }
};

$("newBtn").onclick = () => { selectedId = ""; clearForm(); renderList(); };
$("deleteBtn").onclick = async () => {
  if (!selectedId || !adminAllowed) return;
  const old = items.find((i) => i.id === selectedId);
  if (!old || !confirm(`「${old.name}」を削除しますか？`)) return;
  try {
    await deleteLibraryItem(old);
    selectedId = null;
    showSavedFeedback("削除しました");
  } catch (error) {
    console.error(error);
    alert("削除に失敗しました。権限設定を確認してください。");
  }
};

$("sideSearch").oninput = renderList;

$("seedBtn").onclick = async () => {
  if (!adminAllowed) return;
  if (!confirm("初期データをデータベースへ登録しますか？ 同じIDは初期内容で上書きされます。")) return;
  $("status").textContent = "初期データを登録中...";
  try { await seedLibraryItems(window.STARTER_ITEMS || []); showSavedFeedback("初期データを登録しました"); }
  catch (error) { console.error(error); alert("初期データ登録に失敗しました。アクセスルールを確認してください。"); }
};

$("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "business-video-library-firestore.json";
  a.click();
  URL.revokeObjectURL(a.href);
};
$("importFile").onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw new Error("JSON must be an array");
      if (!confirm(`${arr.length}件をデータベースへ登録しますか？ 同じIDは上書きされます。`)) return;
      await seedLibraryItems(arr);
      showSavedFeedback("JSONをデータベースへ登録しました");
    } catch (error) {
      console.error(error);
      alert("JSONの読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
};
