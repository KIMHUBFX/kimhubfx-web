// Tick Log
const tickLog = document.getElementById('tickLog');
function logTick(msg){
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  tickLog.prepend(p);
  if(tickLog.childNodes.length > 50){ tickLog.removeChild(tickLog.lastChild); }
}

// Helper Functions for indicators
function SMA(data, period){
  if(data.length < period) return null;
  const sum = data.slice(-period).reduce((a,b)=>a+b,0);
  return sum/period;
}

function EMA(data, period, prevEMA=null){
  const k = 2/(period+1);
  const close = data[data.length-1];
  if(prevEMA===null) return SMA(data, period) || close;
  return close*k + prevEMA*(1-k);
}

function BollingerBands(data, period=20, multiplier=2){
  if(data.length < period) return null;
  const slice = data.slice(-period);
  const mean = slice.reduce((a,b)=>a+b,0)/period;
  const std = Math.sqrt(slice.reduce((a,b)=>a + Math.pow(b-mean,2),0)/period);
  return {upper: mean + multiplier*std, lower: mean - multiplier*std, middle: mean};
}

// Chart Setup
const ctx = document.getElementById('tickChart').getContext('2d');
const tickData = {
  labels: [],
  datasets: [
    {label:'Price', data:[], borderColor:'#00bfa5', fill:false},
    {label:'SMA', data:[], borderColor:'#ff9800', fill:false},
    {label:'EMA', data:[], borderColor:'#2196f3', fill:false},
    {label:'BB Upper', data:[], borderColor:'#f44336', fill:false},
    {label:'BB Lower', data:[], borderColor:'#4caf50', fill:false}
  ]
};
const tickChart = new Chart(ctx,{
  type:'line',
  data: tickData,
  options: {animation:false, responsive:true, scales:{x:{title:{display:true,text:'Time'}},y:{title:{display:true,text:'Price'}}}}
});

// WebSocket
let ws;
let prevEMA = null;
function connectTicks(symbol){
  if(ws) ws.close();
  tickData.labels = [];
  tickData.datasets.forEach(ds => ds.data = []);
  prevEMA = null;
  tickChart.update();
  
  ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');
  ws.onopen = () => { ws.send(JSON.stringify({ticks:symbol,subscribe:1})); logTick(`Connected to ${symbol}`); };
  ws.onmessage = e => {
    const data = JSON.parse(e.data);
    if(data.tick){
      const time = new Date(data.tick.epoch*1000).toLocaleTimeString();
      const price = data.tick.quote;
      tickData.labels.push(time);
      tickData.datasets[0].data.push(price);

      // Indicators
      const sma = SMA(tickData.datasets[0].data, 20);
      tickData.datasets[1].data.push(sma);
      prevEMA = EMA(tickData.datasets[0].data, 20, prevEMA);
      tickData.datasets[2].data.push(prevEMA);
      const bb = BollingerBands(tickData.datasets[0].data, 20, 2);
      tickData.datasets[3].data.push(bb ? bb.upper : null);
      tickData.datasets[4].data.push(bb ? bb.lower : null);

      if(tickData.labels.length>50){
        tickData.labels.shift();
        tickData.datasets.forEach(ds => ds.data.shift());
      }

      tickChart.update();
      logTick(`${symbol}: ${price}`);
    }
  };
  ws.onclose = () => logTick(`Disconnected from ${symbol}`);
}

// Symbol change
document.getElementById('symbol').addEventListener('change', e => {
  connectTicks(e.target.value);
});

// Connect initial symbol
connectTicks(document.getElementById('symbol').value);