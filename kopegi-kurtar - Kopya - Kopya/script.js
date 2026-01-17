const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");

// GÖRSELLER
const girlImg = new Image();
girlImg.src = "images/girl.png";

const dogImg = new Image();
dogImg.src = "images/dog.png";

const heartImg = new Image();
heartImg.src = "images/heart.png";

const lilyImg = new Image();
lilyImg.src = "images/lily.png";

const obstacleImg = new Image();
obstacleImg.src = "images/obstacle.png";

const bgImg = new Image();
bgImg.src = "images/background.png";

let gameRunning = false;

// OYUNCU
const player = {
  x: 100,
  y: 280,
  w: 48,
  h: 48,
  vy: 0,
  speed: 4,
  onGround: false
};

const gravity = 0.6;
const groundY = 340;

// ARGOS
const dog = {
  x: 650,
  y: groundY - 48 + 8,
  w: 48,
  h: 48,
  rescued: false
};

// KALPLER
let hearts = [
  { x: 250, y: groundY - 80, taken: false },
  { x: 400, y: groundY - 120, taken: false },
  { x: 550, y: groundY - 80, taken: false }
];
let heartCount = 0;

// ZAMBAKLAR
let lilies = [
  { x: 200, y: groundY - 40 },
  { x: 350, y: groundY - 60 },
  { x: 500, y: groundY - 40 }
];

// ENGELLER
let obstacles = [
  { x: 300, y: groundY - 32, w: 32, h: 32 },
  { x: 450, y: groundY - 32, w: 32, h: 32 }
];

// TUŞLAR
const keys = { left: false, right: false, jump: false };

// SORU BÖLÜMÜ
const questions = [
  { q: "Disney prenseslerinin geneli güzeldir; ama hangi prenses sabah uyandığında makyajsız haliyle bile hepsinden daha güzel görünür?", a: "ilsu" },
  { q: "Kızlar tuvaletindeki 1 2 3 numaralı kabinlerden kaç numaralı kabin en iyisidir?", a: "2" }
];
let currentQuestion = 0;

// BAŞLAT
function startGame() {
  document.getElementById("title").style.display = "none";
  startBtn.style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}
startBtn.onclick = startGame;

// KONTROLLER
document.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft") keys.left = true;
  if (e.code === "ArrowRight") keys.right = true;
  if (e.code === "Space") keys.jump = true;
});

document.addEventListener("keyup", e => {
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "Space") keys.jump = false;
});

// ÇARPIŞMA
function hit(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

// GÜNCELLEME
function update() {
  // SAĞ SOL
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;

  // ZIPLAMA
  if (keys.jump && player.onGround) {
    player.vy = -12;
    player.onGround = false;
  }

  // YER ÇEKİMİ
  player.vy += gravity;
  player.y += player.vy;

  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h + 8;
    player.vy = 0;
    player.onGround = true;
  }

  // EKRAN SINIRI
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  // KALP TOPLAMA
  hearts.forEach(h => {
    if (!h.taken && hit(player, { ...h, w: 32, h: 32 })) {
      h.taken = true;
      heartCount++;
    }
  });

  // ZAMBAK TOPLAMA
  lilies.forEach((l, i) => {
    if (hit(player, { ...l, w: 32, h: 32 })) {
      lilies.splice(i, 1);
    }
  });

  // ENGEL ÇARPIŞMASI
  obstacles.forEach(obs => {
    if (hit(player, obs)) {
      if (player.x + player.w / 2 < obs.x + obs.w / 2) {
        player.x = obs.x - player.w;
      } else {
        player.x = obs.x + obs.w;
      }
    }
  });

  // KÖPEK VE SORU
  if (!dog.rescued && hit(player, dog)) {
    if (currentQuestion < questions.length) {
      let answer = prompt(questions[currentQuestion].q);
      if (answer && answer.toLowerCase() === questions[currentQuestion].a.toLowerCase()) {
        currentQuestion++;
        if (currentQuestion === questions.length) {
          dog.rescued = true;
          alert("Tebrikler! Köpeği kurtardın 🐶\n\nKÖPEKTEN SANA MESAJ VAR 🐶\nİLSU, EKİN SENİ ÇOOOOOOOK SEVİYOR 💖🌸🎉");
        } else {
          alert("Doğru! Bir sonraki soruya geç.");
        }
      } else {
        alert("Yanlış cevap, tekrar dene!");
      }
    }
  }
}

// ÇİZİM
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ARKA PLAN
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // ZEMİN
  ctx.fillStyle = "rgba(111, 207, 151, 0.5)";
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

  // KALPLER
  hearts.forEach(h => {
    if (!h.taken) ctx.drawImage(heartImg, h.x, h.y, 32, 32);
  });

  // ZAMBAKLAR
  lilies.forEach(l => {
    ctx.drawImage(lilyImg, l.x, l.y, 32, 32);
  });

  // ENGELLER
  obstacles.forEach(obs => {
    ctx.drawImage(obstacleImg, obs.x, obs.y, obs.w, obs.h);
  });

  // ARGOS
  if (!dog.rescued) ctx.drawImage(dogImg, dog.x, dog.y, dog.w, dog.h);

  // KIZ
  ctx.drawImage(girlImg, player.x, player.y, player.w, player.h);

  // SKOR
  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("Kalpler: " + heartCount, 20, 30);
}

// OYUN DÖNGÜSÜ
function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
