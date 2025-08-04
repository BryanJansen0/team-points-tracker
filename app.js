const SUPABASE_URL = 'https://fdwahdhduczwdllxoxegt.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Show/hide loading indicators
function showLoading(section) {
  const loading = document.getElementById(`${section}-loading`);
  if (loading) loading.classList.remove('hidden');
}
function hideLoading(section) {
  const loading = document.getElementById(`${section}-loading`);
  if (loading) loading.classList.add('hidden');
}

// Update cloud sync status
function updateSyncStatus(status, lastSync) {
  const statusEl = document.getElementById('sync-status');
  const lastSyncEl = document.getElementById('last-sync');
  if (statusEl) statusEl.textContent = status;
  if (lastSyncEl && lastSync) {
    const date = new Date(lastSync);
    lastSyncEl.textContent = 'Last updated: ' + date.toLocaleString();
  }
}

// Fetch team members from Supabase
async function fetchTeamMembers() {
  showLoading('leaderboard');
  updateSyncStatus('\uD83D\uDD03 Syncing team data...');
  const { data, error } = await supabase.from('team_members')
    .select('*')
    .order('points', { ascending: false });
  hideLoading('leaderboard');
  if (error) {
    console.error(error);
    updateSyncStatus('\u274C Sync Error');
    return [];
  }
  updateSyncStatus('\uD83C\uDF24\uFE0F Cloud Sync Active', new Date());
  return data.map(member => ({
    ...member,
    stars: Math.floor((member.points || 0) / 1000)
  }));
}

// Render team members into the leaderboard grid
function displayTeamMembers(members) {
  const grid = document.getElementById('leaderboard-grid');
  if (!grid) return;
  grid.innerHTML = '';
  members.forEach(member => {
    const card = document.createElement('div');
    card.className = 'member-card flex flex-col items-center gap-4';
    const avatar = document.createElement('img');
    avatar.src = member.profile_image_url || '';
    avatar.alt = member.name;
    avatar.className = 'avatar';
    const nameEl = document.createElement('div');
    nameEl.className = 'member-name';
    nameEl.textContent = member.name;
    const pointsEl = document.createElement('div');
    pointsEl.className = 'member-points';
    pointsEl.textContent = `${member.points} points`;
    const starsEl = document.createElement('div');
    starsEl.className = 'member-stars';
    starsEl.textContent = '\u2B50'.repeat(member.stars);
    card.appendChild(avatar);
    card.appendChild(nameEl);
    card.appendChild(pointsEl);
    card.appendChild(starsEl);
    grid.appendChild(card);
  });
}

// Fetch rewards from Supabase
async function fetchRewards() {
  showLoading('rewards');
  updateSyncStatus('\uD83D\uDD03 Syncing rewards...');
  const { data, error } = await supabase.from('rewards')
    .select('*')
    .order('stars_required', { ascending: true });
  hideLoading('rewards');
  if (error) {
    console.error(error);
    updateSyncStatus('\u274C Sync Error');
    return [];
  }
  updateSyncStatus('\uD83C\uDF24\uFE0F Cloud Sync Active', new Date());
  return data;
}

// Render rewards into the rewards grid
function displayRewards(rewards) {
  const grid = document.getElementById('rewards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  rewards.forEach(reward => {
    const card = document.createElement('div');
    card.className = 'reward-card flex flex-col items-center gap-4';
    const icon = document.createElement('div');
    icon.className = 'reward-icon text-4xl';
    icon.textContent = reward.icon || '';
    const nameEl = document.createElement('div');
    nameEl.className = 'reward-name';
    nameEl.textContent = reward.name;
    const starsReq = document.createElement('div');
    starsReq.className = 'reward-stars';
    starsReq.textContent = `Requires ${reward.stars_required} \u2B50`;
    card.appendChild(icon);
    card.appendChild(nameEl);
    card.appendChild(starsReq);
    grid.appendChild(card);
  });
}

// Initialize page: hide overlay and load data
document.addEventListener('DOMContentLoaded', async () => {
  const loadingOverlay = document.getElementById('loading');
  if (loadingOverlay) loadingOverlay.style.display = 'none';
  const members = await fetchTeamMembers();
  displayTeamMembers(members);
  const rewards = await fetchRewards();
  displayRewards(rewards);
});
