const API = '';

// Generate unique voter ID
const getVoterId = () => {
  let id = localStorage.getItem('voterId');
  if (!id) {
    id = 'voter_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('voterId', id);
  }
  return id;
};

window.onload = loadPolls;

async function loadPolls() {
  try {
    const res = await fetch(`${API}/polls`);
    const polls = await res.json();
    renderPolls(polls);
  } catch (err) {
    // FIX: Match the ID in your HTML
    const container = document.getElementById('polls-container');
    if (container) {
        container.innerHTML = '<p class="error">⚠️ Cannot connect to server. Start backend first!</p>';
    }
  }
}

function renderPolls(polls) {
  const container = document.getElementById('polls-container');
  if (!container) return;

  if (polls.length === 0) {
    container.innerHTML = '<p class="no-polls">No polls yet. Create one above! 🎉</p>';
    return;
  }

  const voterId = getVoterId();
  container.innerHTML = polls.map(poll => {
    const hasVoted = poll.voters.includes(voterId);
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const optionsHTML = hasVoted
      ? poll.options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return `
            <div class="result-item">
              <div class="result-label">
                <span>${opt.text}</span>
                <span>${opt.votes} votes</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar" style="width:${pct}%">
                  ${pct}%
                </div>
              </div>
            </div>`;
        }).join('')
      : poll.options.map((opt, i) => `
          <button class="vote-btn" onclick="vote('${poll.id}', ${i})">
            🔘 ${opt.text}
          </button>`).join('');

    return `
      <div class="poll-card" id="poll-${poll.id}">
        <div class="poll-question">📊 ${poll.question}</div>
        <div id="options-${poll.id}">${optionsHTML}</div>
        <div class="poll-footer">
          <span class="total-votes">🗳️ Total votes: ${totalVotes}</span>
          ${hasVoted ? '<span class="voted-badge">✅ Voted</span>' : ''}
          <button class="delete-btn" onclick="deletePoll('${poll.id}')">🗑️ Delete</button>
        </div>
      </div>`;
  }).join('');
}

function addOption() {
  const container = document.getElementById('options-container');
  const count = container.querySelectorAll('.option-group').length;
  if (count >= 4) {
    showError('Maximum 4 options allowed!');
    return;
  }
  const div = document.createElement('div');
  div.className = 'option-group';
  div.innerHTML = `
    <input type="text" class="option-input" placeholder="Option ${count + 1}" maxlength="100">
    <button class="remove-btn" onclick="removeOption(this)">✕</button>`;
  container.appendChild(div);
}

function removeOption(btn) {
  const container = document.getElementById('options-container');
  if (container.querySelectorAll('.option-group').length <= 2) {
    showError('Minimum 2 options required!');
    return;
  }
  btn.parentElement.remove();
  showError('');
}

async function createPoll() {
  const questionInput = document.getElementById('question');
  const question = questionInput.value.trim();
  const options = [...document.querySelectorAll('.option-input')]
    .map(i => i.value.trim())
    .filter(v => v !== '');

  if (!question) return showError('Please enter a question!');
  if (options.length < 2) return showError('Please enter at least 2 options!');

  try {
    const res = await fetch(`${API}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options })
    });
    if (res.ok) {
      questionInput.value = '';
      // FIX: Reset container back to 2 default inputs
      const container = document.getElementById('options-container');
      container.innerHTML = `
        <div class="option-group"><input type="text" class="option-input" placeholder="Option 1" maxlength="100"></div>
        <div class="option-group"><input type="text" class="option-input" placeholder="Option 2" maxlength="100"></div>
      `;
      showError('');
      loadPolls();
    }
  } catch (err) {
    showError('Error creating poll. Is server running?');
  }
}

async function vote(pollId, optionIndex) {
  const voterId = getVoterId();
  try {
    const res = await fetch(`${API}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex, voterId })
    });
    if (res.ok) loadPolls();
    else {
      const data = await res.json();
      alert(data.error);
    }
  } catch (err) {
    alert('Error voting. Try again!');
  }
}

async function deletePoll(pollId) {
  if (!confirm('Delete this poll?')) return;
  try {
    await fetch(`${API}/polls/${pollId}`, { method: 'DELETE' });
    loadPolls();
  } catch (err) {
    alert('Error deleting!');
  }
}

function showError(msg) {
  const errEl = document.getElementById('error-msg');
  if(errEl) errEl.textContent = msg;
}