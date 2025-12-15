// Side Menu
function toggleSideMenu() {
  document.getElementById('sideMenu').classList.toggle('active');
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// Section display
function showSection(section) {
  document.getElementById('dashboardSection').style.display = section === 'dashboard' ? 'block' : 'none';
  document.getElementById('botBuilderSection').style.display = section === 'botBuilder' ? 'block' : 'none';
}

// Bot Builder
let bots = [];
let editIndex = null;
let botCharts = [];

function openBotModal(bot = null, index = null) {
  document.getElementById('botModal').style.display = 'flex';
  editIndex = index;
  if (bot) {
    document.getElementById('modalBotTitle').innerText = "Edit Bot";
    document.getElementById('botName').value = bot.name;
    document.getElementById('botStake').value = bot.stake;
    document.getElementById('botDuration').value = bot.duration;
    document.getElementById('botStopLoss').value = bot.stopLoss;
    document.getElementById('botVolatility').value = bot.volatility;
  } else {
    document.getElementById('modalBotTitle').innerText = "Create Bot";
    document.getElementById('botName').value = "";
    document.getElementById('botStake').value = "";
    document.getElementById('botDuration').value = "";
    document.getElementById('botStopLoss').value = "";
    document.getElementById('botVolatility').value = "";
  }
}

function closeBotModal() {
  document.getElementById('botModal').style.display = 'none';
}

function saveBot() {
  const bot = {
    name: document.getElementById('botName').value,
    stake: parseFloat(document.getElementById('botStake').value),
    duration: parseInt(document.getElementById('botDuration').value),
    stopLoss: parseFloat(document.getElementById('botStopLoss').value),
    volatility: parseFloat(document.getElementById('botVolatility').value),
    status: "Stopped",
    profitData: [],
    chart: null
  };
  if (editIndex !== null) {
    bots[editIndex] = bot;
  } else {
    bots.push(bot);
  }
  renderBots();
  closeBotModal();
}

function renderBots() {
  const container = document.getElementById('botContainer');
  container.innerHTML = '';
  botCharts = [];

  bots.forEach((bot, index) => {
    const card = document.createElement('div');
    card.className = 'bot-card';
    card.innerHTML = `
      <h3>${bot.name}</h3>
      <p><strong>Stake:</strong> $${bot.stake}</p>
      <p><strong>Duration:</strong> ${bot.duration}s</p>
      <p><strong>Stop-Loss:</strong> $${bot.stopLoss}</p>
      <p><strong>Volatility:</strong> ${bot.volatility}%</p>
      <p><strong>Status:</strong> <span class="status">${bot.status}</span></p>
      <canvas id="botChart${index}" class="bot-chart" height="100"></canvas>
      <div class="bot-actions">
        <button onclick="startBot(${index})">Start</button>
        <button onclick="stopBot(${index})">Stop</button>
        <button onclick="openBotModal(bots[${index}],${index})">Edit</button>
        <button onclick="deleteBot(${index})">Delete</button>
      </div>`;
    container.appendChild(card);

    const ctx = document.getElementById(`botChart${index}`).getContext('2d');
    bot.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Profit/Loss',
          data: [],
          borderColor: function(context) {
            const value = context.dataset.data[context.dataIndex];
            return value >= 0 ? 'limegreen' : 'red';
          },
          pointRadius: 0,
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        animation: false,
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `P/L: $${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: { display: false },
          y: { beginAtZero: true }
        }
      }
    });
    botCharts.push(bot.chart);
  });
}

function startBot(index) {
  const bot = bots[index];
  if (bot.status === 'Running') return;
  bot.status = "Running";
  renderBots();

  bot.interval = setInterval(() => {
    if (bot.profitData.length >= bot.duration) stopBot(index);
    const last = bot.profitData.length > 0 ? bot.profitData[bot.profitData.length - 1] : 0;
    const change = (Math.random() - 0.5) * bot.volatility;
    const newProfit = last + change;
    bot.profitData.push(newProfit);

    bot.chart.data.labels.push(bot.profitData.length);
    bot.chart.data.datasets[0].data.push(newProfit);
    bot.chart.update();
  }, 1000);
}

function stopBot(index) {
  const bot = bots[index];
  bot.status = "Stopped";
  renderBots();
  if (bot.interval) clearInterval(bot.interval);
}

function deleteBot(index) {
  if (confirm('Delete this bot?')) {
    stopBot(index);
    bots.splice(index, 1);
    renderBots();
  }
}
