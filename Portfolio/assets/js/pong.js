// Pong game: simple 2-player (W/S vs ArrowUp/Down)
(function(){
  const board = document.getElementById('pongBoard');
  const ctx = board.getContext('2d');
  const newBtn = document.getElementById('pongNew');
  const pauseBtn = document.getElementById('pongPause');
  const modeSel = document.getElementById('pongMode');
  const speedSel = document.getElementById('pongSpeed');
  const scoreLEl = document.getElementById('pongScoreL');
  const scoreREl = document.getElementById('pongScoreR');

  const W = board.width, H = board.height;
  const PAD_W = 10, PAD_H = 70, PAD_SPEED = 5;
  const BALL_R = 7;

  let running = false;
  let singlePlayer = false; // if true, right paddle is AI
  let speedMul = 1.4; // base multiplier (from select)
  let aiMistakeMs = 0; // pause AI for brief period to allow scoring
  let scoreL = 0, scoreR = 0;
  let left = { x: 20, y: (H-PAD_H)/2, vy: 0 };
  let right = { x: W-20-PAD_W, y: (H-PAD_H)/2, vy: 0 };
  let ball = { x: W/2, y: H/2, vx: 4, vy: 3 };

  function themeColors(){
    const s = getComputedStyle(document.documentElement);
    return {
      bg: s.getPropertyValue('--surface').trim() || '#11161d',
      grid: s.getPropertyValue('--border').trim() || '#1f2733',
      fg: s.getPropertyValue('--text').trim() || '#e7edf4',
      accent: s.getPropertyValue('--accent').trim() || '#06b6d4'
    };
  }

  function resetBall(dir){
    ball.x = W/2; ball.y = H/2;
    const base = 4 * speedMul;
    const vy = (Math.random()>.5?1:-1)* (2 + Math.random()*2) * (speedMul/1.4);
    ball.vx = (dir||1) * base; ball.vy = vy;
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function step(){
    left.y = clamp(left.y + left.vy, 0, H-PAD_H);
    if(singlePlayer){
      // Simple AI follows ball with capped speed
      if(aiMistakeMs > 0){
        aiMistakeMs -= 16; // approx per frame
      }else{
        const offset = (Math.random()-0.5) * 20; // slight inaccuracy
        const target = ball.y - PAD_H/2 + offset;
        const dy = target - right.y;
        const sp = Math.min(PAD_SPEED*0.9, Math.max(-PAD_SPEED*0.9, dy*0.12));
        right.y = clamp(right.y + sp, 0, H-PAD_H);
        // occasionally make a bigger mistake (stop reacting for ~0.6s)
        if(Math.random() < 0.004){ aiMistakeMs = 600; }
      }
    } else {
      right.y = clamp(right.y + right.vy, 0, H-PAD_H);
    }

    ball.x += ball.vx; ball.y += ball.vy;

    // top/bottom
    if(ball.y - BALL_R < 0){ ball.y = BALL_R; ball.vy *= -1; }
    if(ball.y + BALL_R > H){ ball.y = H - BALL_R; ball.vy *= -1; }

    // left paddle
    if(ball.x - BALL_R < left.x + PAD_W && ball.x - BALL_R > left.x && ball.y > left.y && ball.y < left.y + PAD_H){
      ball.x = left.x + PAD_W + BALL_R;
      ball.vx = Math.abs(ball.vx);
      // add spin based on hit position
      const hit = (ball.y - (left.y + PAD_H/2)) / (PAD_H/2);
      ball.vy = hit * 4;
    }
    // right paddle
    if(ball.x + BALL_R > right.x && ball.x + BALL_R < right.x + PAD_W && ball.y > right.y && ball.y < right.y + PAD_H){
      ball.x = right.x - BALL_R;
      ball.vx = -Math.abs(ball.vx);
      const hit = (ball.y - (right.y + PAD_H/2)) / (PAD_H/2);
      ball.vy = hit * 4;
    }

    // score
    if(ball.x < 0){ scoreR++; updateScore(); resetBall(1); }
    if(ball.x > W){ scoreL++; updateScore(); resetBall(-1); }
  }

  function draw(){
    const c = themeColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0,0,W,H);
    // mid line
    ctx.strokeStyle = c.grid; ctx.lineWidth = 2;
    ctx.setLineDash([6,8]);
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.setLineDash([]);
    // paddles
    ctx.fillStyle = c.fg;
    ctx.fillRect(left.x, left.y, PAD_W, PAD_H);
    ctx.fillRect(right.x, right.y, PAD_W, PAD_H);
    // ball
    ctx.fillStyle = c.accent;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI*2); ctx.fill();
  }

  function loop(){
    if(!running) return;
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function start(){
    running = true;
    pauseBtn.setAttribute('aria-pressed','false');
    pauseBtn.textContent = 'Pauza';
    resetBall(Math.random()>.5?1:-1);
    requestAnimationFrame(loop);
  }
  function pauseToggle(){
    running = !running;
    pauseBtn.setAttribute('aria-pressed', String(!running));
    pauseBtn.textContent = running ? 'Pauza' : 'Pokračovať';
    if(running) requestAnimationFrame(loop);
  }
  function updateScore(){
    scoreLEl.textContent = String(scoreL);
    scoreREl.textContent = String(scoreR);
  }

  function onKey(e){
    const k = e.key;
    if(k==='ArrowUp' || k==='ArrowDown' || k===' ') e.preventDefault();
    if(k==='w' || k==='W'){ left.vy = -PAD_SPEED; }
    else if(k==='s' || k==='S'){ left.vy = PAD_SPEED; }
    else if(!singlePlayer && k==='ArrowUp'){ right.vy = -PAD_SPEED; }
    else if(!singlePlayer && k==='ArrowDown'){ right.vy = PAD_SPEED; }
  }
  function onKeyUp(e){
    const k = e.key;
    if(k==='w' || k==='W' || k==='s' || k==='S'){ left.vy = 0; }
    if(!singlePlayer && (k==='ArrowUp' || k==='ArrowDown')){ right.vy = 0; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    draw();
    newBtn.addEventListener('click', () => { scoreL=0; scoreR=0; updateScore(); start(); });
    pauseBtn.addEventListener('click', pauseToggle);
    modeSel.addEventListener('change', () => { singlePlayer = modeSel.value === '1'; });
    speedSel.addEventListener('change', () => { speedMul = Number(speedSel.value)||1; });
    singlePlayer = modeSel.value === '1';
    speedMul = Number(speedSel.value)||1.4;
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
  });
})();
