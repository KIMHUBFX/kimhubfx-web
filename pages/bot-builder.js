// Contract Type Toggle
const toggleButtons = document.querySelectorAll('.toggle-btn');
toggleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    const volSelect = document.getElementById('volatility');
    volSelect.innerHTML = type === 'inshott' ?
      `<option value="1s">1s</option><option value="5s">5s</option>` :
      `<option value="10s">10s</option><option value="15s">15s</option><option value="30s">30s</option><option value="1m">1m</option><option value="5m">5m</option>`;
    logMessage(`Contract type changed to ${type}`);
  });
});

// Bot Log
const botLog = document.getElementById('botLog');
function logMessage(msg){
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  botLog.appendChild(p);
  botLog.scrollTop = botLog.scrollHeight;
}

// WebSocket Tick Chart
const ctx = document.getElementById('botChart').getContext('2d');
const tickData = { labels:[], datasets:[{label:'Price', data:[], borderColor:'#00bfa5', fill:false}] };
const botChart = new Chart(ctx,{type:'line', data:tickData, options:{animation:false,responsive:true,scales:{x:{title:{display:true,text:'Time'}},y:{title:{display:true,text:'Price'}}}}});
const ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
ws.onopen = () => {
  const symbol = document.getElementById('symbol').value;
  ws.send(JSON.stringify({ticks:symbol,subscribe:1}));
  logMessage('Connected to tick WebSocket for ' + symbol);
};
ws.onmessage = e => {
  const data = JSON.parse(e.data);
  if(data.tick){
    const time = new Date(data.tick.epoch*1000).toLocaleTimeString();
    const price = data.tick.quote;
    tickData.labels.push(time); tickData.datasets[0].data.push(price);
    if(tickData.labels.length > 50){ tickData.labels.shift(); tickData.datasets[0].data.shift(); }
    botChart.update();
  }
};

// Start/Stop Bot
document.getElementById('startBot').addEventListener('click', () => {
  const symbol = document.getElementById('symbol').value;
  const contract = document.querySelector('.toggle-btn.active').dataset.type;
  const volatility = document.getElementById('volatility').value;
  const duration = document.getElementById('duration').value;
  const stake = document.getElementById('stake').value;
  const stopLoss = document.getElementById('stopLoss').value;
  const takeProfit = document.getElementById('takeProfit').value;

  logMessage(`Bot started: ${symbol}, ${contract}, ${volatility}, duration: ${duration}s, stake: ${stake}`);
  // TODO: integrate real trading API calls
});

document.getElementById('stopBot').addEventListener('click', () => {
  logMessage('Bot stopped');
  // TODO: stop the running bot
});