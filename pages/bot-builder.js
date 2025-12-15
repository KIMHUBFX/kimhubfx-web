// Start Bot
function startBot(button) {
  const row = button.closest('tr');
  row.querySelector('.status').innerText = 'Running';
  button.disabled = true;
  row.querySelector('button:nth-child(2)').disabled = false; // Enable Stop
}

// Stop Bot
function stopBot(button) {
  const row = button.closest('tr');
  row.querySelector('.status').innerText = 'Stopped';
  button.disabled = true;
  row.querySelector('button:nth-child(1)').disabled = false; // Enable Start
}

// Delete Bot
function deleteBot(button) {
  if (confirm('Are you sure you want to delete this bot?')) {
    const row = button.closest('tr');
    row.remove();
  }
}