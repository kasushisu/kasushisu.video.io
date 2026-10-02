
const STORE_KEY="businessVideoLibraryItems_v1";
function getItems(){
  try{
    const raw=localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const cloned=JSON.parse(JSON.stringify(window.STARTER_ITEMS||[]));
  try{localStorage.setItem(STORE_KEY,JSON.stringify(cloned));}catch(e){}
  return cloned;
}
function setItems(items){localStorage.setItem(STORE_KEY,JSON.stringify(items));}
function resetItems(){localStorage.removeItem(STORE_KEY);return getItems();}
function methodClass(m){return m==="AE"?"ae":m==="撮影"?"shoot":"both";}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}

function sceneFrame(inner,label=""){
 return `<div class="scene">${label?`<div class="previewLabel">${esc(label)}</div>`:""}${inner}</div>`;
}
function office(personStyle=""){
 return `<div class="officeBg"></div><div class="desk"></div><div class="laptop"></div><div class="avatar suit" style="${personStyle}"></div>`;
}
function previewBuiltin(item,big=false){
 const lab=big?"":item.method;
 let inner="";
 const p=item.preview;
 if(p==="title"){
   inner=office()+`<div class="textCard" style="left:8%;top:23%;width:42%"><div class="h" style="${item.animate?'animation:titleUp 2.8s infinite':''}"></div><div style="font-size:20px;font-weight:900;${item.animate?'animation:titleUp 2.8s infinite .12s':''}">会社紹介</div><div style="font-size:10px;color:#667085;margin-top:4px">CORPORATE MOVIE</div></div>`;
 }else if(p==="mask"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:12%;right:12%;top:42%;height:52px;overflow:hidden"><div class="textCard" style="left:0;right:0;top:0;text-align:center;${item.animate?'animation:titleUp 2.6s infinite':''}"><b style="font-size:20px">サービスの特徴</b></div></div>`;
 }else if(p==="keyword"){
   inner=`<div class="officeBg"></div><div class="textCard" style="left:12%;right:12%;top:34%;text-align:center"><span style="font-size:15px">問い合わせ対応を</span><br><b style="font-size:28px;color:#ff4f87">30時間削減</b></div>`;
 }else if(p==="icons"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:8%;right:8%;top:34%;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${["⚡<br>迅速","◎<br>正確","↗<br>効率化"].map((x,i)=>`<div class="metric" style="${item.animate?`animation:pop 2.6s infinite ${i*.18}s`:''}">${x}</div>`).join("")}</div>`;
 }else if(p==="count"){
   inner=`<div class="officeBg"></div><div class="textCard" style="left:19%;right:19%;top:28%;text-align:center"><div style="font-size:11px;color:#667085">導入社数</div><b style="font-size:44px;color:#3b82f6">${item.animate?'<span class="countAnim">1,000</span>':'1,000'}</b><span style="font-size:13px">社</span></div>`;
 }else if(p==="kpi"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:7%;right:7%;top:35%;display:grid;grid-template-columns:repeat(3,1fr);gap:9px"><div class="metric"><b>98%</b><small>満足度</small></div><div class="metric"><b>30h</b><small>削減</small></div><div class="metric"><b>24h</b><small>対応</small></div></div>`;
 }else if(p==="bars"){
   inner=`<div class="officeBg"></div><div class="bars">${[1,2,3].map((_,i)=>`<i style="${item.animate?`transform-origin:bottom;animation:growY 2.8s infinite ${i*.15}s`:''}"></i>`).join("")}</div><div style="position:absolute;left:25%;right:25%;bottom:18px;display:flex;justify-content:space-around;font-size:9px;color:#667085"><span>A</span><span>B</span><span>C</span></div>`;
 }else if(p==="flow"){
   inner=`<div class="officeBg"></div><div class="flowRow"><div class="flowNode">1<br>相談</div><div class="flowArrow">→</div><div class="flowNode">2<br>導入</div><div class="flowArrow">→</div><div class="flowNode">3<br>運用</div></div>`;
 }else if(p==="beforeafter"){
   inner=`<div class="splitScene"><div class="left"><div class="previewLabel">BEFORE</div><div style="position:absolute;inset:0;display:grid;place-items:center"><div class="textCard"><b>手作業</b><div class="l"></div><div class="l s"></div></div></div></div><div class="right"><div class="previewLabel">AFTER</div><div style="position:absolute;inset:0;display:grid;place-items:center"><div class="textCard" style="border-color:#ffd1e1"><b style="color:#ff4f87">自動化</b><div class="l"></div><div class="l s"></div></div></div></div></div>`;
 }else if(p==="split"){
   inner=`<div class="officeBg"></div><div class="textCard" style="left:7%;top:27%;width:42%"><div class="h"></div><div class="l"></div><div class="l"></div><div class="l s"></div></div><div class="browser" style="right:7%;top:24%;width:40%;height:115px"><div class="heroLine"></div><div class="row"></div><div class="row short"></div></div>`;
 }else if(p==="lowerthird"){
   inner=office()+`<div class="textCard" style="left:8%;bottom:15%;width:46%;padding:9px 11px;${item.animate?'animation:titleUp 2.8s infinite':''}"><b style="font-size:12px">山田 太郎</b><div style="font-size:9px;color:#667085">Project Manager</div></div>`;
 }else if(p==="uipanel"){
   inner=`<div class="officeBg"></div><div class="browser" style="left:7%;top:25%;width:55%;height:128px"><div class="heroLine"></div><div class="row"></div><div class="row short"></div></div><div class="textCard" style="right:6%;top:28%;width:30%"><div class="h"></div><div class="l"></div><div class="l"></div><div class="l s"></div></div>`;
 }else if(p==="staticcam"){
   inner=office()+`<div style="position:absolute;inset:12px;border:1px dashed rgba(17,24,39,.25);border-radius:10px"></div>`;
 }else if(p==="pan"){
   inner=office(item.animate?'animation:panMove 3.4s infinite ease-in-out':'');
 }else if(p==="pushin"){
   inner=`<div class="officeBg"></div><div style="position:absolute;inset:0;${item.animate?'animation:pushIn 3.2s infinite ease-in-out':''}">${office()}</div>`;
 }else if(p==="focus"){
   inner=`<div class="officeBg"></div><div class="avatar suit" style="left:34%;${item.animate?'animation:focusFront 3.2s infinite':''}"></div><div class="laptop" style="right:17%;bottom:52px;${item.animate?'animation:focusBack 3.2s infinite':''}"></div>`;
 }else if(p==="broll"){
   inner=`<div class="splitScene"><div class="left">${office()}<div class="previewLabel">INTERVIEW</div></div><div class="right"><div class="previewLabel">B-ROLL</div><div class="browser" style="left:13%;top:25%;width:74%;height:105px"><div class="heroLine"></div><div class="row"></div><div class="row short"></div></div></div></div>`;
 }else if(p==="jlcut"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:8%;right:8%;top:34%"><div style="height:38px;border-radius:8px;background:linear-gradient(90deg,#cbdcff 0 48%,#ffd9e5 48%);margin-bottom:10px;position:relative"><span style="position:absolute;left:12px;top:11px;font-size:9px">映像 A</span><span style="position:absolute;right:12px;top:11px;font-size:9px">映像 B</span></div><div style="height:28px;border-radius:8px;background:linear-gradient(90deg,#111827 0 62%,#687386 62%);color:#fff;font-size:9px;padding:8px 10px">音声トラック：次の音を先行 / 前の音を残す</div></div>`;
 }else if(p==="shotseq"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:7%;right:7%;top:32%;display:grid;grid-template-columns:repeat(3,1fr);gap:9px"><div class="metric" style="height:96px;padding-top:18px"><div class="avatar suit" style="position:relative;left:auto;bottom:auto;transform:scale(.55);margin:auto"></div><small>WIDE</small></div><div class="metric" style="height:96px;padding-top:12px"><div class="avatar suit" style="position:relative;left:auto;bottom:auto;transform:scale(.72);margin:auto"></div><small>MEDIUM</small></div><div class="metric" style="height:96px;padding-top:3px"><div class="avatar suit" style="position:relative;left:auto;bottom:auto;transform:scale(.95);margin:auto"></div><small>CLOSE</small></div></div>`;
 }else if(p==="speedramp"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:10%;right:10%;top:46%"><div style="height:12px;border-radius:999px;background:linear-gradient(90deg,#111827 0 25%,#ff4f87 25% 70%,#111827 70%);${item.animate?'transform-origin:left;animation:speedPulse 2.4s infinite ease-in-out':''}"></div><div style="display:flex;justify-content:space-between;font-size:9px;color:#667085;margin-top:9px"><span>SLOW</span><span>FAST</span><span>SLOW</span></div></div>`;
 }else if(p==="parallax"){
   inner=`<div class="officeBg"></div><div style="position:absolute;left:9%;right:9%;top:24%;bottom:20%"><div style="position:absolute;left:0;right:0;bottom:0;height:42%;background:#a9c3fb;border-radius:12px;${item.animate?'animation:floatLayers 3s infinite ease-in-out':''}"></div><div class="textCard" style="left:9%;top:8%;width:48%;height:56%;${item.animate?'animation:floatLayers 3s infinite ease-in-out reverse':''}"></div><div style="position:absolute;right:5%;top:3%;width:34%;height:48%;border-radius:14px;background:#ffd4e3;${item.animate?'animation:floatLayers 3s infinite ease-in-out .2s':''}"></div></div>`;
 }else if(p==="browser"){
   inner=`<div class="officeBg"></div><div class="browser" style="left:12%;right:12%;top:23%;height:142px"><div class="heroLine"></div><div class="row"></div><div class="row short"></div></div>`;
 }else if(p==="cursor"){
   inner=`<div class="officeBg"></div><div class="browser" style="left:12%;right:12%;top:23%;height:142px"><div class="heroLine"></div><div class="row"></div><div class="row short"></div><div style="position:absolute;right:15px;bottom:14px;background:#111827;color:#fff;border-radius:6px;padding:7px 9px;font-size:9px">資料を見る</div><div style="position:absolute;left:20px;top:34px;font-size:23px;${item.animate?'animation:cursorMove 2.8s infinite ease-in-out':''}">↖</div></div>`;
 }else if(p==="fade"){
   inner=`<div class="transitionA"></div><div class="transitionB" style="${item.animate?'animation:dissolve 3s infinite':''};background:rgba(15,23,42,.82)"></div>`;
 }else if(p==="dissolve"){
   inner=`<div class="transitionA"></div><div class="transitionB" style="${item.animate?'animation:dissolve 3s infinite':''}"></div>`;
 }else if(p==="wipe"){
   inner=`<div class="transitionA"></div><div class="transitionB" style="${item.animate?'animation:wipe 3s infinite ease-in-out':''}"></div>`;
 }else if(p==="pushtrans"){
   inner=`<div class="transitionA"></div><div class="transitionB" style="${item.animate?'animation:slidePush 3s infinite ease-in-out':''}"></div>`;
 }else{
   inner=`<div class="mediaPlaceholder">プレビュー未設定<br>管理画面から画像・動画を登録できます</div>`;
 }
 return sceneFrame(inner,lab);
}

function renderMedia(item,big=false){
 if(item.mediaData && item.mediaType){
   const tag=big?"":`<div class="previewLabel">${esc(item.method)}</div>`;
   if(item.mediaType.startsWith("video/")){
     return `<div class="scene">${tag}<video class="mediaPreview" src="${item.mediaData}" muted loop playsinline ${item.autoPlay!==false?'autoplay':''} controls="${big?'controls':''}"></video></div>`;
   }
   return `<div class="scene">${tag}<img class="mediaPreview" src="${item.mediaData}" alt="${esc(item.name)}"></div>`;
 }
 if(item.mediaUrl){
   const tag=big?"":`<div class="previewLabel">${esc(item.method)}</div>`;
   if(/\.(mp4|webm|ogg)(\?|$)/i.test(item.mediaUrl)){
     return `<div class="scene">${tag}<video class="mediaPreview" src="${esc(item.mediaUrl)}" muted loop playsinline autoplay></video></div>`;
   }
   return `<div class="scene">${tag}<img class="mediaPreview" src="${esc(item.mediaUrl)}" alt="${esc(item.name)}"></div>`;
 }
 return previewBuiltin(item,big);
}
