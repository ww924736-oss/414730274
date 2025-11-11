/* By Okazz */
let forms = [];//
// let es = new p5.Ease();
let es = {
  quadraticInOut(t){
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  quadraticIn(t){
    return t * t;
  },
  backInOut(t){
    const s = 1.70158 * 1.525;
    if (t < 0.5) {
      const p = 2 * t;
      return 0.5 * (p * p * ((s + 1) * p - s));
    } else {
      const p = 2 * t - 2;
      return 0.5 * (p * p * ((s + 1) * p + s) + 2);
    }
  }
};
let colors = ['#7fc8f8', '#ffe45e', '#ff6392', '#17bebb']; // 改為 Okazz 的配色

// 背景動態相關變數 (來自 Okazz 範例)
let ctx;
let motions = [];
let motionClasses = [];
let sceneTimer = 0;
let resetTime = 60 * 8.5;
let fadeOutTime = 30;

// 左側滑入半透明方塊
let leftPanel;

// overlay DOM 相關
let overlayEl = null;

class LeftPanel {
  constructor(h){
    this.w = 200;            // 固定寬度 200
    this.h = h;
    this.x = width - this.w;       // 改為右側，初始顯示
    this.targetX = width - this.w; // 目標位置在右側
    this.speed = 0.18;      // 插值速度（數值越大越快）
    this.alpha = 160;       // 半透明

       // 連結設定：第一個為作品一，第二個為筆記，第三個為測驗卷
    this.links = [
      { label: "第一單元作品", url: "https://ww924736-oss.github.io/20251014./" },
      { label: "第一單元筆記", url: "https://hackmd.io/@gxxE19UKS8iSRPcLsyjtmQ/H1KxFuJ2gl" },
      { label: "測驗卷", url: "https://ww924736-oss.github.io/20251110/" },
      { label: "自我介紹", url: "about" },
      { label: "回到首頁", url: "home" }  // 新增回到首頁選項
      ];
    this.linkRects = []; // 每幀繪製時更新，供點擊檢測使用
    this.textSize = 22;  // 文字大小（可調）
    this.topOffset = 70; // 第一個連結距離上方 70px
    this.lineSpacing = 18; // 兩連結之間間距
  }

  open(){
    this.targetX = width - this.w;
  }

  close(){
    this.targetX = width; // 滑出到右側外面
  }

  // 判斷滑鼠是否在面板範圍內（以目前 x 位置計算）
  contains(mx, my){
    return mx >= this.x && mx <= this.x + this.w && my >= 0 && my <= this.h;
  }

  // 取得指定位置上的連結索引（若無則回傳 -1）
  getLinkAt(mx, my){
    for (let i = 0; i < this.linkRects.length; i++){
      const r = this.linkRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return i;
    }
    return -1;
  }

  // 面板被點擊時呼叫（若點到連結則開啟 overlay）
  onClickAt(mx, my){
    const idx = this.getLinkAt(mx, my);
    if (idx >= 0){
        if(this.links[idx].url === "home") {
            closeOverlay(); // 關閉目前開啟的 overlay
        } else {
            openOverlay(this.links[idx].label, this.links[idx].url);
        }
    }
  }

  update(){
    this.x = lerp(this.x, this.targetX, this.speed);
  }

  resize(h){
    this.h = h;
  }

  show(){
    push();
    noStroke();
    rectMode(CORNER);     
    fill('#edafb8'); // 改為您指定的顏色
    rect(this.x, 0, this.w, this.h);

    textAlign(CENTER, TOP);
    textSize(this.textSize);

    this.linkRects = [];
    for (let i = 0; i < this.links.length; i++){
        const ty = this.topOffset + i * (this.textSize + this.lineSpacing);
        const tx = this.x + this.w * 0.5;
        
        // 計算矩形區域
        const rectX = this.x;
        const rectY = ty;
        const rectW = this.w;
        const rectH = this.textSize + 8;
        this.linkRects.push({ x: rectX, y: rectY, w: rectW, h: rectH });

        // 檢查滑鼠是否在當前連結上
        const isHovered = mouseX >= rectX && mouseX <= rectX + rectW && 
                         mouseY >= rectY && mouseY <= rectY + rectH;

        // 根據懸停狀態設定文字顏色
        if (isHovered) {
            fill(255, 0, 0); // 懸停時改為紅色
        } else {
            fill(20, 220); // 一般狀態為深色半透明
        }

        // 只有當面板部分可見時才畫文字
        if (this.x + this.w > 0) {
            text(this.links[i].label, tx, ty);
        }
    }

    pop();
  }

  run(){
    this.update();
    this.show();
  }
}

// 建立並置中格子
function createForms(){
    forms = [];
    let seg = 10;
    let gridSize = min(width, height) * 0.9; // 使用視窗短邊的 90%
    let w = gridSize / seg;
    let startX = (width - gridSize) / 2 + w/2;
    let startY = (height - gridSize) / 2 + w/2;
    for (let i = 0; i < seg; i++) {
        for (let j = 0; j < seg; j++) {
            let x = startX + i * w;
            let y = startY + j * w;
            let rnd = int(random(5)+1);
            let off = 0;
            if(rnd == 1){
                forms.push(new Form01(x, y, w - off));
            }
            else if(rnd == 2){
                forms.push(new Form02(x, y, w - off));
            }
            else if(rnd == 3){
                forms.push(new Form03(x, y, w - off));
            }
            else if(rnd == 4){
                forms.push(new Form04(x, y, w - off));
            }
            else if(rnd == 5){
                forms.push(new Form05(x, y, w - off));
            }
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    strokeWeight(4);
    ctx = drawingContext;
    createForms();

    leftPanel = new LeftPanel(height); // 建立左側面板
    leftPanel.open(); // 一開始就打開面板

    // 初始化背景動態
    motionClasses = [Motion01, Motion02, Motion03, Motion04, Motion05];
    INIT();
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    createForms();
    if (leftPanel) leftPanel.resize(height);
    // 若 overlay 存在，重新調整大小
    if (overlayEl) adjustOverlaySize();

    // 重新初始化背景以符合新畫布尺寸
    INIT();
}

function draw() {
    // 背景：使用 Okazz 提供的動畫背景
    background('#ffffff');
    for (let m of motions) {
        m.run();
    }

    let alph = 0;
    if ((resetTime - fadeOutTime) < sceneTimer && sceneTimer <= resetTime) {
        alph = map(sceneTimer, (resetTime - fadeOutTime), resetTime, 0, 255);
        background(255, alph);
    }

    if (frameCount % resetTime == 0) {
        INIT();
    }

    sceneTimer++;

    // 上層繪製原有的 forms 與面板
    for(let f of forms){
        f.run();
    }

    // 面板永久開啟於右側（不再隱藏）
    let hoveringPanel = leftPanel.contains(mouseX, mouseY);
    leftPanel.open();

    // 繪製面板（置於最上層）
    leftPanel.run();

    // 判斷是否在 link 上（linkRects 在 show() 中已更新）
    let hoveringLink = leftPanel.getLinkAt(mouseX, mouseY) >= 0;

    // 改變滑鼠游標提示（當在面板或連結上時顯示 pointer）
    if (hoveringLink) cursor(HAND);
    else if (hoveringPanel) cursor(HAND);
    else cursor(ARROW);
}

// 處理滑鼠點擊：若在面板的連結上則開啟連結（overlay）
function mousePressed(){
  if (leftPanel) {
    leftPanel.onClickAt(mouseX, mouseY);
  }
}

// 建立 overlay (遮罩 + iframe)
// title 參數目前未顯示在畫面上，但保留以備擴充
function openOverlay(title, url){
  // 內建自我介紹處理（直接在此頁面顯示中間小視窗）
  if (url === 'about') {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.style.position = 'fixed';
    overlayEl.style.left = '0';
    overlayEl.style.top = '0';
    overlayEl.style.width = '100%';
    overlayEl.style.height = '100%';
    // 使用放在專案資料夾的背景圖（about-bg.jpg）
    overlayEl.style.backgroundImage = 'url("about-bg.jpg")';
    overlayEl.style.backgroundPosition = 'center';
    overlayEl.style.backgroundSize = 'cover';
    overlayEl.style.backgroundRepeat = 'no-repeat';
    // 加上半透明遮罩（可調整透明度）
    overlayEl.style.backgroundColor = 'rgba(0,0,0,0.25)';
    overlayEl.style.display = 'flex';
    overlayEl.style.alignItems = 'center';
    overlayEl.style.justifyContent = 'center';
    overlayEl.style.zIndex = '9999';
    overlayEl.addEventListener('click', function(e){ if (e.target === overlayEl) closeOverlay(); });

    const box = document.createElement('div');
    box.style.background = 'rgba(255,255,255,0.95)';
    box.style.padding = '24px 28px';
    box.style.borderRadius = '10px';
    box.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
    box.style.textAlign = 'center';
    box.style.fontFamily = 'sans-serif';
    box.style.color = '#222';
    box.style.maxWidth = '300px';  // 縮小寬度（原為 420px）
    box.style.width = '65%';       // 縮小寬度（原為 85%）
    box.style.maxHeight = '80%';   // 縮小高度
    box.style.overflowY = 'auto';
    box.style.marginTop = '80px';  // 下移視窗
    box.addEventListener('click', function(e){ e.stopPropagation(); });

    // 可選：若想在視窗內顯示個人照片，放一張 about-photo.jpg 到專案資料夾
    const photo = document.createElement('img');
    photo.src = 'about-photo.jpg'; // 若沒有此檔案可註解掉或改路徑
    photo.alt = 'photo';
    photo.style.width = '120px';
    photo.style.height = '120px';
    photo.style.objectFit = 'cover';
    photo.style.borderRadius = '8px';
    photo.style.marginBottom = '12px';
    // 若照片不存在會顯示破圖，若不需要可移除下兩行
    box.appendChild(photo);

    const h = document.createElement('h2');
    h.textContent = '自我介紹';
    h.style.margin = '0 0 8px 0';
    h.style.fontSize = '20px';

    const p = document.createElement('p');
    p.style.margin = '6px 0';
    p.style.fontSize = '18px';
    p.innerHTML = '姓名: 翁芸涵<br>學號: ４１４７３０２７４';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '關閉';
    closeBtn.style.marginTop = '14px';
    closeBtn.style.padding = '8px 12px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '4px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', function(e){ e.stopPropagation(); closeOverlay(); });

    box.appendChild(h);
    box.appendChild(p);
    box.appendChild(closeBtn);
    overlayEl.appendChild(box);
    document.body.appendChild(overlayEl);
    return;
  }

  // 若是外部連結（http 開頭），直接在新分頁開啟
  if (url.startsWith('http')) {
    window.open(url, '_blank');
    return;
  }

  // 若是首頁連結
  if (url === 'home') {
    window.location.href = './index.html';
    return;
  }

  // 若已存在則不再建立
  if (overlayEl) return;

  // 建立遮罩層
  overlayEl = document.createElement("div");
  overlayEl.style.position = "fixed";
  overlayEl.style.left = "0";
  overlayEl.style.top = "0";
  overlayEl.style.width = "100%";
  overlayEl.style.height = "100%";
  overlayEl.style.background = "rgba(0,0,0,0.6)";
  overlayEl.style.display = "flex";
  overlayEl.style.alignItems = "center";
  overlayEl.style.justifyContent = "center";
  overlayEl.style.zIndex = "9999";

  // 按下遮罩空白處關閉 overlay
  overlayEl.addEventListener("click", function(e){
    if (e.target === overlayEl) closeOverlay();
  });

  // 建立容器（避免點擊傳遞到遮罩）
  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = Math.floor(window.innerWidth * 0.8) + "px";
  container.style.height = Math.floor(window.innerHeight * 0.8) + "px";
  container.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
  container.style.background = "#fff";
  container.style.borderRadius = "4px";
  container.style.overflow = "hidden";
  container.addEventListener("click", function(e){ e.stopPropagation(); });

  // 建立 iframe
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  container.appendChild(iframe);

  // 建立關閉按鈕
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.title = "關閉";
  closeBtn.style.position = "absolute";
  closeBtn.style.right = "8px";
  closeBtn.style.top = "8px";
  closeBtn.style.zIndex = "2";
  closeBtn.style.background = "rgba(0,0,0,0.6)";
  closeBtn.style.color = "#fff";
  closeBtn.style.border = "none";
  closeBtn.style.width = "32px";
  closeBtn.style.height = "32px";
  closeBtn.style.borderRadius = "4px";
  closeBtn.style.cursor = "pointer";
  closeBtn.addEventListener("click", function(e){
    e.stopPropagation();
    closeOverlay();
  });
  container.appendChild(closeBtn);

  overlayEl.appendChild(container);
  document.body.appendChild(overlayEl);
}

// 關閉 overlay
function closeOverlay(){
  if (!overlayEl) return;
  document.body.removeChild(overlayEl);
  overlayEl = null;
}

// 調整 overlay 大小（resize 時呼叫）
function adjustOverlaySize(){
  if (!overlayEl) return;
  const container = overlayEl.firstChild;
  if (!container) return;
  container.style.width = Math.floor(window.innerWidth * 0.8) + "px";
  container.style.height = Math.floor(window.innerHeight * 0.8) + "px";
}

// 背景動畫 - Okazz 的程式碼
function INIT() {
    sceneTimer = 0;
    motions = [];
    // motionClasses 已在 setup 或 windowResized 中設定
    let drawingRegion = min(width, height) * 0.75;
    let cellCount = 25;
    let cellSize = drawingRegion / cellCount;
    let clr = '#000000';
    for (let i = 0; i < cellCount; i++) {
        for (let j = 0; j < cellCount; j++) {
            let x = cellSize * j + (cellSize / 2) + (width - drawingRegion) / 2;
            let y = cellSize * i + (cellSize / 2) + (height - drawingRegion) / 2;
            let MotionClass = random(motionClasses);
            let t = -int(dist(x, y, width / 2, height / 2) * 0.7);
            motions.push(new MotionClass(x, y, cellSize, t, clr));
        }
    }
}

function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

class Agent {
    constructor(x, y, w, t, clr) {
        this.x = x;
        this.y = y;
        this.w = w;

        this.t1 = int(random(30, 100));
        this.t2 = this.t1 + int(random(30, 100));
        this.t = t;
        this.clr2 = color(clr);
        this.clr1 = color(random(colors));
        this.currentColor = this.clr1;
    }

    show() {
    }

    move() {
        if (0 < this.t && this.t < this.t1) {
            let n = norm(this.t, 0, this.t1 - 1);
            this.updateMotion1(easeInOutQuint(n));
        } else if (this.t1 < this.t && this.t < this.t2) {
            let n = norm(this.t, this.t1, this.t2 - 1);
            this.updateMotion2(easeInOutQuint(n));
        }
        this.t++;
    }

    run() {
        this.show();
        this.move();
    }

    updateMotion1(n) {

    }
    updateMotion2(n) {

    }

}

class Motion01 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 3;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size);
    }

    updateMotion1(n) {
        this.shift = lerp(this.w * 3, 0, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
}

class Motion02 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.size = 0;
        this.corner = this.w / 2;
    }

    show() {
        noStroke();
        fill(this.currentColor);
        square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size, this.corner);
    }

    updateMotion1(n) {
        this.shift = lerp(0, this.w * 2, n);
        this.size = lerp(0, this.w / 2, n);
    }

    updateMotion2(n) {
        this.size = lerp(this.w / 2, this.w, n);
        this.shift = lerp(this.w * 2, 0, n);
        this.corner = lerp(this.w / 2, 0, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
    }
}

class Motion03 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = 0;
        this.size = 0
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noStroke();
        fill(this.currentColor);
        square(0, 0, this.size);
        pop();
    }

    updateMotion1(n) {
        this.ang = lerp(0, TAU, n);
        this.size = lerp(0, this.w, n);
        this.currentColor = lerpColor(this.clr1, this.clr2, n);

    }
}

class Motion04 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w * 2;
        this.ang = int(random(4)) * (TAU / 4);
        this.rot = PI;
        this.side = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        translate(-this.w / 2, -this.w / 2);
        rotate(this.rot);
        fill(this.currentColor);
        rect(this.w / 2, (this.w / 2) - (this.w - this.side) / 2, this.w, this.side);
        pop();
    }

    updateMotion1(n) {
        this.side = lerp(0, this.w, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.rot = lerp(PI, 0, n);
    }
}

class Motion05 extends Agent {
    constructor(x, y, w, t, clr) {
        super(x, y, w, t, clr);
        this.shift = this.w / 2;
        this.size = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        for (let i = 0; i < 4; i++) {
            fill(this.currentColor);
            square((this.w / 4) + this.shift, (this.w / 4) + this.shift, this.size);
            rotate(TAU / 4);
        }
        pop();
    }

    updateMotion1(n) {
        this.size = lerp(0, this.w / 4, n);
    }

    updateMotion2(n) {
        this.currentColor = lerpColor(this.clr1, this.clr2, n);
        this.shift = lerp(this.w / 2, 0, n);
        this.size = lerp(this.w / 4, this.w / 2, n);

    }
}

//●
class Form01{
    constructor(x, y, w){
        this.x = x;
        this.y = y;
        this.w = w;
        this.ang = int(random(4)) * TAU/4;
        this.off = 0;
        this.t = -int(random(1500));
        this.t1 = 30;
        this.d = this.w * random(0.1, 0.5);
        this.col = random(colors);
    }

    show(){
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noFill();
        stroke(this.col);
        circle(this.off, 0, this.d);
        pop();
    }

    move(){
        if(0 < this.t && this.t < this.t1){
            let t = map(this.t, 0, this.t1-1, 0, TAU*6);
            this.off = sin(t)*this.w*0.01;
        }
        this.t ++;
    }

    run(){
        this.show();
        this.move();
        if(this.t1 < this.t){
            this.t = -int(random(1500));
        }
    }
}

//~
class Form02 extends Form01{
    constructor(x, y, w){
        super(x, y, w);
        this.a0 = random(10);
        this.a = this.a0;
        this.t1 = 60;
        this.amp = this.w * random(0.1, 0.4);
        this.mo = random(0.05, 0.1);
    }

    show(){
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noFill();
        stroke(this.col);
        beginShape();
        for(let y=-this.w/2; y<this.w/2; y++){
            vertex(sin((y*this.mo)+this.a) * this.amp, y);
        }
        endShape();
        pop();
    }

    move(){
        if(0 < this.t && this.t < this.t1){
            let nrm = norm(this.t, 0, this.t1 - 1);
            this.a = lerp(0, TAU, es.quadraticInOut(nrm))+this.a0;
        }
        this.t ++;
    }
}

//□
class Form03 extends Form01{
    constructor(x, y, w){
        super(x, y, w);
        this.t1 = 40;
        this.aa = 0;
        this.pn = random()<0.5 ? -1 : 1;
        this.ww = this.w* random(0.1, 0.8)
    }

    show(){
        push();
        translate(this.x, this.y);
        rotate(this.ang+this.aa);
        noFill();
        stroke(this.col);
        square(0, 0, this.ww, this.ww*0.05);
        pop();
    }

    move(){
        if(0 < this.t && this.t < this.t1){
            let nrm = norm(this.t, 0, this.t1 - 1);
            this.aa = lerp(0, PI*0.5, es.backInOut(nrm))*this.pn;
        }
        
        if(this.t1 < this.t){
            this.pn = random() < 0.5 ? -1 : 1;
        }
        this.t ++;
    }
}

//×
class Form04 extends Form01{
    constructor(x, y, w){
        super(x, y, w);
        this.ll0 = this.w*random(0.1, 0.45);
        this.ll = this.ll0;
    }

    show(){
        push();
        translate(this.x, this.y);
        rotate(this.ang);
        noFill();
        stroke(this.col);
        line(this.ll/2, this.ll/2, -this.ll/2, -this.ll/2);
        line(-this.ll0/2, this.ll0/2, this.ll0/2, -this.ll0/2);
        pop();
    }

    move(){
        if(0 < this.t && this.t < this.t1){
            let nrm = norm(this.t, 0, this.t1 - 1);
            this.ll = lerp(this.ll0, 0, es.quadraticIn(sin((1-nrm)*PI)));
        }

        this.t ++;
    }
}

//…
class Form05 extends Form01{
    constructor(x, y, w){
        super(x, y, w);
        this.num = int(random(5, 10));
        this.d *= 2;
        this.d0 = this.d;
        this.aa = 0;
        this.t1 = 50;

    }

    show(){
        push();
        translate(this.x, this.y);
        rotate(this.ang+this.aa);
        stroke(this.col);
        for(let i=0; i<this.num; i++){
            let a = map(i, 0, this.num, 0, TAU);
            point(this.d * 0.5 * cos(a), this.d * 0.5 * sin(a));
        }
        pop();
    }

    move(){
        if(0 < this.t && this.t < this.t1){
            let nrm = norm(this.t, 0, this.t1 - 1);
            this.d = lerp(this.d0, 0, es.quadraticIn(sin((1-nrm)*PI)));
            this.aa = lerp(0, TAU, nrm);
        }

        this.t ++;
    }
}
