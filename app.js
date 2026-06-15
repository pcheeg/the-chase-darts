const app = document.getElementById('app');
const CHASERS = {
  ted:{name:'Ted Evetts', emoji:'🧸', probs:{1:85,2:70,3.5:60,4.5:35,5:18,6:8,7:3,7.5:2,7.75:1.5,8:1,8.5:.5,9:.2,9.5:.05,10:.01}},
  chizzy:{name:'Dave Chisnall', emoji:'🟡', probs:{1:95,2:90,3.5:75,4.5:55,5:35,6:18,7:8,7.5:5,7.75:4,8:3,8.5:2,9:1,9.5:.5,10:.2}},
  mvg:{name:'Michael van Gerwen', emoji:'🟢', probs:{1:99,2:97,3.5:85,4.5:75,5:55,6:32,7:10,7.5:8,7.75:7,8:6,8.5:4,9:2.5,9.5:1,10:.5}},
  taylor:{name:'Phil Taylor', emoji:'⚡️', probs:{1:99,2:98,3.5:95,4.5:90,5:75,6:55,7:35,7.5:25,7.75:22,8:18,8.5:12,9:8,9.5:5,10:3}}
};
const OFFER = {high:{label:'HIGH',mult:2,pos:2,color:'blue'},normal:{label:'NORMAL',mult:1,pos:3,color:'green'},low:{label:'LOW',mult:.5,pos:4,color:'yellow'}};
const CHECKOUTS = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,164,167,170];
let state = {page:'home', chaser:null, visits:[], entry:'', offer:null, playingFor:0, playerPos:3, chaserPos:0, checkout:null, msg:'', busy:false, history:[]};
const blankStats = () => ({games:0,wins:0,losses:0,highestCash:0,totalCash:0,highestOffer:0,highestWon:0,highestCheckout:0,chasers:Object.fromEntries(Object.keys(CHASERS).map(k=>[k,{played:0,wins:0,losses:0}])),checkouts:Object.fromEntries(Array.from({length:169},(_,i)=>[i+2,{a:0,h:0}]))});
let stats = JSON.parse(localStorage.chaseDartsStats || 'null') || blankStats();
function save(){localStorage.chaseDartsStats=JSON.stringify(stats)}
function resetGame(){state={page:'home',chaser:null,visits:[],entry:'',offer:null,playingFor:0,playerPos:3,chaserPos:0,checkout:null,msg:'',busy:false,history:[]};render()}
function difficulty(n){if(n>=2&&n<=40)return n%2===0?1:2;if(n<=60)return 2;if(n<=80)return 3.5;if(n===82)return 4.5;if(n>=81&&n<=90)return 5;if(n===99)return 6.5;if(n<=100)return 6;if(n<=120)return 7;if(n<=130)return 7.5;return ({131:7.75,132:7.5,133:8,134:7.75,135:7.5,136:8,137:7.75,138:8,139:8.5,161:10,164:9.5,167:10,170:9.5}[n]) ?? (n>=140&&n<=160?(n%2===0?8.5:9):10)}
function chaserHit(n){return Math.random()*100 < CHASERS[state.chaser].probs[difficulty(n)]}
function nextCheckout(){state.checkout=CHECKOUTS[Math.floor(Math.random()*CHECKOUTS.length)]}
function screen(html){app.innerHTML=`<main class="screen">${html}</main>`}
function header(sub='DARTS EDITION'){return `<div class="title">THE CHASE</div><div class="subtitle">${sub}</div>`}
function render(){document.body.classList.toggle('red-fade', state.page==='result'&&state.result==='loss');({home,select,cash,offers,game,result,stats:statsPage}[state.page])()}
function home(){screen(`${header()}<button class="btn" onclick="state.page='select';render()">PLAY</button><button class="btn secondary" onclick="state.page='stats';render()">STATS</button>`)}
function select(){screen(`${header('SELECT YOUR CHASER')}<div class="chaser-list">${Object.entries(CHASERS).map(([k,c])=>`<button class="chaser ${state.chaser===k?'selected':''}" onclick="state.chaser='${k}';render()">${c.emoji} ${c.name}</button>`).join('')}</div><button class="btn" ${!state.chaser?'disabled':''} onclick="state.page='cash';render()">CONTINUE</button><button class="btn secondary" onclick="resetGame()">BACK</button>`)}
function cash(){let total=state.visits.reduce((a,b)=>a+b,0);screen(`${header('CASH BUILDER')}<div class="card"><div class="subtitle">VISIT ${Math.min(state.visits.length+1,10)} / 10</div><div class="big-number">${total}</div><div class="mini">POINTS</div><input class="input-score" value="${state.entry}" readonly placeholder="0"><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="key" onclick="press('${n}')">${n}</button>`).join('')}<button class="key back" onclick="backspace()">←</button><button class="key" onclick="press('0')">0</button><button class="key ok" onclick="confirmScore()">✓</button></div></div><button class="btn secondary" onclick="undoVisit()">UNDO LAST VISIT</button>${state.visits.length===10?`<button class="btn good" onclick="state.page='offers';render()">VIEW OFFERS</button>`:''}`)}
function press(n){if(state.visits.length>=10)return;if(state.entry.length<3)state.entry+=n;render()}function backspace(){state.entry=state.entry.slice(0,-1);render()}function confirmScore(){let v=Number(state.entry);if(!state.entry||v<0||v>180)return alert('Enter a score from 0 to 180');state.visits.push(v);state.entry='';render()}function undoVisit(){state.visits.pop();state.entry='';render()}
function board({ mode = 'offer' } = {}) {
  let tiles = [];
  const total = state.visits.reduce((a, b) => a + b, 0);

  for (let i = 0; i <= 8; i++) {
    let cls = 'tile neutral';
    let content = '';
    let click = '';

    if (i === 8) {
      cls = 'tile home';
      content = 'HOME';
    } else if (mode === 'offer') {
      if (i === 0) {
        cls = 'tile red';
        content = 'CHASER';
      } else {
        const key = Object.keys(OFFER).find(k => OFFER[k].pos === i);
        if (key) {
          const val = Math.round(total * OFFER[key].mult);
          cls = `tile ${OFFER[key].color} ${state.offer === key ? 'selected' : ''}`;
          content = `<span><span class="label">${OFFER[key].label}</span><span class="value">${val}</span></span>`;
          click = `onclick="pickOfferFromPos(${i})"`;
        }
      }
    } else {
      if (i <= state.chaserPos) cls = 'tile red';
      if (i === state.playerPos) cls = `tile ${OFFER[state.offer].color}`;
      if (i === state.chaserPos) content += `<span class="marker">${CHASERS[state.chaser].emoji}</span>`;
      if (i === state.playerPos) content += `<span class="marker">👤</span>`;
    }

    tiles.push(`<div class="${cls}" ${click}>${content}</div>`);
  }

  return `<div class="board-wrap"><div class="board">${tiles.join('')}</div></div>`;
}
function pickOfferFromPos(pos){let k=Object.keys(OFFER).find(x=>OFFER[x].pos===pos);if(k){state.offer=k;render()}}
function offers(){let total=state.visits.reduce((a,b)=>a+b,0);screen(`${header('SELECT YOUR OFFER')}<div class="subtitle">Cash Builder: ${total} points</div>${board({mode:'offer'})}<button class="btn good" ${!state.offer?'disabled':''} onclick="startChase()">START CHASE</button>`)}
function startChase(){state.playingFor=Math.round(state.visits.reduce((a,b)=>a+b,0)*OFFER[state.offer].mult);state.playerPos=OFFER[state.offer].pos;state.chaserPos=0;state.history=[];state.msg='';nextCheckout();state.page='game';render()}
function game(){let c=CHASERS[state.chaser];screen(`<div class="subtitle">${c.emoji} ${c.name.toUpperCase()}</div><div class="playing">PLAYING FOR<div class="amount">${state.playingFor} POINTS</div></div>${board({mode:'game'})}<div class="card checkout"><div class="subtitle">CHECKOUT</div><div class="num">${state.checkout}</div></div><div class="message">${state.msg}</div><div class="grid2"><button class="btn good" ${state.busy?'disabled':''} onclick="playerResult(true)">HIT</button><button class="btn danger" ${state.busy?'disabled':''} onclick="playerResult(false)">MISS</button></div><button class="btn secondary" ${!state.history.length||state.busy?'disabled':''} onclick="undoRound()">UNDO LAST ROUND</button>`)}
function playerResult(hit){if(state.busy)return;let before=JSON.stringify({playerPos:state.playerPos,chaserPos:state.chaserPos,checkout:state.checkout,msg:state.msg,stats});let n=state.checkout;stats.checkouts[n].a++;if(hit){stats.checkouts[n].h++;stats.highestCheckout=Math.max(stats.highestCheckout,n);state.playerPos++}state.msg=hit?`YOU CHECKED OUT ${n}`:'YOU FAILED TO CHECK OUT';state.busy=true;render();setTimeout(()=>{let ch=chaserHit(n);if(ch)state.chaserPos++;state.msg=`${CHASERS[state.chaser].emoji} ${CHASERS[state.chaser].name.toUpperCase()} ${ch?`CHECKED OUT ${n}`:'FAILED TO CHECK OUT'}`;state.history.push(before);save();render();setTimeout(()=>{if(state.chaserPos>=state.playerPos)return finish(false);if(state.playerPos>=8)return finish(true);nextCheckout();state.busy=false;render()},900)},900)}
function undoRound(){let h=state.history.pop();if(!h)return;let o=JSON.parse(h);state.playerPos=o.playerPos;state.chaserPos=o.chaserPos;state.checkout=o.checkout;state.msg=o.msg;stats=o.stats;state.busy=false;save();render()}
function finish(win){stats.games++;stats.totalCash+=state.visits.reduce((a,b)=>a+b,0);stats.highestCash=Math.max(stats.highestCash,state.visits.reduce((a,b)=>a+b,0));stats.highestOffer=Math.max(stats.highestOffer,state.playingFor);stats.chasers[state.chaser].played++;if(win){stats.wins++;stats.chasers[state.chaser].wins++;stats.highestWon=Math.max(stats.highestWon,state.playingFor);state.result='win';save();state.page='result';render();confetti()}else{stats.losses++;stats.chasers[state.chaser].losses++;state.result='loss';save();state.page='result';render()}}
function result(){screen(`<section class="result-screen"><div class="result-title ${state.result==='win'?'won':'lost'}">${state.result==='win'?'HOME':'CAUGHT'}</div><div class="card"><div class="subtitle">You have ${state.result==='win'?'won':'lost'}:</div><div class="big-number">${state.playingFor}</div><div class="mini">POINTS</div></div><button class="btn" onclick="resetGame();state.page='select';render()">PLAY AGAIN</button><button class="btn secondary" onclick="state.page='stats';render()">STATS</button></section>`)}
function pct(a,b){return b?((a/b)*100).toFixed(1)+'%':'0%'}
function statsPage(){let avg=stats.games?Math.round(stats.totalCash/stats.games):0;screen(`${header('STATISTICS')}<div class="card">${[['Games Played',stats.games],['Wins',stats.wins],['Losses',stats.losses],['Win %',pct(stats.wins,stats.games)],['Highest Cash Builder',stats.highestCash],['Average Cash Builder',avg],['Highest Offer Taken',stats.highestOffer],['Highest Points Won',stats.highestWon],['Highest Checkout Hit',stats.highestCheckout]].map(r=>`<div class="stat-row"><b>${r[0]}</b><span>${r[1]}</span></div>`).join('')}</div><div class="card"><h3>VS CHASERS</h3>${Object.entries(CHASERS).map(([k,c])=>{let s=stats.chasers[k];return `<div class="stat-row"><b>${c.emoji} ${c.name}</b><span>${s.wins}/${s.played} · ${pct(s.wins,s.played)}</span></div>`}).join('')}</div><div class="card"><h3>CHECKOUT STATS</h3><table class="table"><tr><th>Finish</th><th>Hit</th><th>Att</th><th>%</th></tr>${Object.entries(stats.checkouts).filter(([,s])=>s.a).map(([n,s])=>`<tr><td>${n}</td><td>${s.h}</td><td>${s.a}</td><td>${pct(s.h,s.a)}</td></tr>`).join('')||'<tr><td colspan="4">No checkouts attempted yet</td></tr>'}</table></div><button class="btn secondary" onclick="resetGame()">HOME</button><button class="btn danger" onclick="if(confirm('Reset all stats?')){stats=blankStats();save();render()}">RESET STATS</button>`)}
function confetti(){const cnv=document.getElementById('confetti'),ctx=cnv.getContext('2d');cnv.width=innerWidth;cnv.height=innerHeight;let ps=Array.from({length:140},()=>({x:Math.random()*cnv.width,y:-20,r:Math.random()*6+3,v:Math.random()*5+3,a:Math.random()*6}));let t=0;(function loop(){ctx.clearRect(0,0,cnv.width,cnv.height);ps.forEach(p=>{p.y+=p.v;p.x+=Math.sin((t+p.a)/10)*2;ctx.fillStyle=['#ffd56a','#10b85a','#1d6cff','#ffffff','#ff4a4a'][p.a|0];ctx.fillRect(p.x,p.y,p.r,p.r)});if(t++<120)requestAnimationFrame(loop);else ctx.clearRect(0,0,cnv.width,cnv.height)})()}
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
render();
