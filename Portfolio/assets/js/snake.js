// Snake game: rAF loop, grid logic, localStorage high score
(function(){
  const HS_KEY = 'snake_highscore_v1';
  const board = document.getElementById('board');
  const ctx = board.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highEl = document.getElementById('high');
  const newBtn = document.getElementById('newGame');
  const pauseBtn = document.getElementById('pause');
  const speedSel = document.getElementById('speed');
  const gridSel = document.getElementById('grid');

  let cell = 18; // px per cell
  let grid = 20; // cells per side
  let stepMs = 100; // ms per move
  let running = false;
  let lastTime = 0; let acc = 0;
  let snake = []; // array of {x,y}
  let dir = {x:1,y:0}; // start moving right
  let nextDir = {x:1,y:0};
  let apple = {x:10,y:10};
  let score = 0; let high = 0;

  function resizeCanvas(){
    board.width = grid * cell;
    board.height = grid * cell;
  }

  function themeColors(){
    // Read CSS variables to keep visuals on theme
    const s = getComputedStyle(document.documentElement);
    return {
      bg: s.getPropertyValue('--surface').trim() || '#11161d',
      grid: s.getPropertyValue('--border').trim() || '#1f2733',
      snake: s.getPropertyValue('--text').trim() || '#e7edf4',
      head: s.getPropertyValue('--accent').trim() || '#06b6d4',
      apple: '#ef4444'
    };
  }

  function start(){
    score = 0; updateScore();
    dir = {x:1,y:0}; nextDir = {x:1,y:0};
    snake = [{x:3,y:10},{x:2,y:10},{x:1,y:10}];
    placeApple();
    running = true; pauseBtn.setAttribute('aria-pressed','false'); pauseBtn.textContent='Pauza';
    lastTime = 0; acc = 0;
    requestAnimationFrame(loop);
  }

  function pauseToggle(){
    running = !running;
    pauseBtn.setAttribute('aria-pressed', String(!running));
    pauseBtn.textContent = running ? 'Pauza' : 'Pokračovať';
    if(running){ lastTime = 0; acc = 0; requestAnimationFrame(loop); }
  }

  function loop(ts){
    if(!running) return;
    if(!lastTime) lastTime = ts;
    const dt = ts - lastTime; lastTime = ts; acc += dt;
    while(acc >= stepMs){
      step(); acc -= stepMs;
    }
    draw();
    requestAnimationFrame(loop);
  }

  function step(){
    dir = nextDir; // apply buffered direction
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // collisions
    if(head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid || collides(head)){
      gameOver();
      return;
    }
    snake.unshift(head);
    if(head.x === apple.x && head.y === apple.y){
      score += 1; updateScore(); placeApple();
    } else {
      snake.pop();
    }
  }

  function collides(p){
    for(let i=0;i<snake.length;i++){
      if(snake[i].x===p.x && snake[i].y===p.y) return true;
    }
    return false;
  }

  function placeApple(){
    do{ apple.x = (Math.random()*grid)|0; apple.y = (Math.random()*grid)|0; }
    while(snake.some(s=>s.x===apple.x && s.y===apple.y));
  }

  function draw(){
    const c = themeColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0,0,board.width,board.height);
    // grid
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    for(let i=1;i<grid;i++){
      const p = i*cell + .5; // crisp lines
      ctx.beginPath(); ctx.moveTo(p,0); ctx.lineTo(p,board.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,p); ctx.lineTo(board.width,p); ctx.stroke();
    }
    // apple
    ctx.fillStyle = c.apple;
    roundRect(apple.x*cell+3, apple.y*cell+3, cell-6, cell-6, 4, true);
    // snake
    for(let i=snake.length-1;i>=0;i--){
      const s = snake[i];
      ctx.fillStyle = i===0 ? c.head : c.snake;
      roundRect(s.x*cell+2, s.y*cell+2, cell-4, cell-4, 5, true);
    }
  }

  function roundRect(x,y,w,h,r,fill){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    if(fill) ctx.fill(); else ctx.stroke();
  }

  function gameOver(){
    running = false;
    // update high score
    if(score > high){ high = score; localStorage.setItem(HS_KEY, String(high)); updateScore(); }
    // simple overlay text
    draw();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0,0,board.width,board.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Koniec hry – Nová hra?', board.width/2, board.height/2);
  }

  function updateScore(){
    scoreEl.textContent = String(score);
    highEl.textContent = String(high);
  }

  function loadHigh(){
    const raw = localStorage.getItem(HS_KEY);
    high = raw ? Number(raw)||0 : 0;
    updateScore();
  }

  function onKey(e){
    const k = e.key;
    if(k==='ArrowUp' && dir.y!==1){ nextDir = {x:0,y:-1}; }
    else if(k==='ArrowDown' && dir.y!==-1){ nextDir = {x:0,y:1}; }
    else if(k==='ArrowLeft' && dir.x!==1){ nextDir = {x:-1,y:0}; }
    else if(k==='ArrowRight' && dir.x!==-1){ nextDir = {x:1,y:0}; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadHigh();
    grid = Number(gridSel.value); stepMs = Number(speedSel.value);
    resizeCanvas(); draw();
    window.addEventListener('resize', () => { resizeCanvas(); draw(); });
    document.addEventListener('keydown', onKey);
    board.addEventListener('keydown', onKey);
    newBtn.addEventListener('click', start);
    pauseBtn.addEventListener('click', pauseToggle);
    speedSel.addEventListener('change', () => { stepMs = Number(speedSel.value); });
    gridSel.addEventListener('change', () => { grid = Number(gridSel.value); resizeCanvas(); start(); });
  });
})();

