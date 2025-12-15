let botRunning = false;
let botInterval = null;

// Chart
const botCtx = document.getElementById('botChart').getContext('2d');
const chartData = { labels: [], datasets: [{ label: 'Price', data: [], borderColor: '#00bfa5', fill: false }] };
const botChart = new Chart(botCtx, { type: 'line', data: chartData, options: { responsive: true, animation: false } });

// Log function
function logBot(message) {
  const log = document.getElementById('botLog');
  log.innerHTML += `<div>${new Date().toLocaleTimeString()} | ${message}</div>`;
  log.scrollTop = log.scrollHeight;
}

// Start Bot
document.getElementById('startBot').addEventListener('click', () => {
  if(botRunning){ logBot("Bot already running."); return; }

  const symbol = document.getElementById('symbol').value;
  const tradeType = document.getElementById('tradeType').value;
  const volatility = document.getElementById('volatility').value;
  let duration = parseInt(document.getElementById('duration').value);
  const stake = parseFloat(document.getElementById('stake').value);
  const stopLoss = parseFloat(document.getElementById('stopLoss').value);
  const takeProfit = parseFloat(document.getElementById('takeProfit').value);

  // Override duration for short-term contracts
  if(volatility.startsWith('1s')) duration = 1;
  else if(volatility.startsWith('5s')) duration = 5;
  else if(volatility.startsWith('10s')) duration = 10;

  botRunning = true;
  logBot(`Bot started: ${tradeType} | ${volatility} | ${symbol} | Stake: ${stake} | Duration: ${duration}s`);

  botInterval = setInterval(() => {
    // Simulated trade result
    const result = Math.random() > 0.5 ? "WIN" : "LOSS";
    const profit = result === "WIN" ? stake * 0.8 : -stake;
    logBot(`Trade: ${symbol} | ${tradeType} | ${volatility} | ${result} | Profit: ${profit.toFixed(2)}`);

    // Update chart with random price
    const price = Math.random() * 100;
    chartData.labels.push(new Date().toLocaleTimeString());
    chartData.datasets[0].data.push(price);
    if(chartData.labels.length > 30){ chartData.labels.shift(); chartData.datasets[0].data.shift(); }
    botChart.update();

  }, duration * 1000);
});

// Stop Bot
document.getElementById('stopBot').addEventListener('click', () => {
  if(botInterval){ clearInterval(botInterval); botInterval = null; }
  botRunning = false;
  logBot("Bot stopped.");
});