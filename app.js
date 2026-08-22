let stories = [];
let currentStory = null;
let isPlaying = false;
let isSlowMode = false;
let currentUtterance = null;
let words = [];
let showArabicTranslation = false;



window.addEventListener('DOMContentLoaded', async () => {
  await loadStories();
  setupEventListeners();
  renderStories();
});

async function loadStories() {
  try {
    const response = await fetch('./stories.json?v=' + Date.now());
    if (response.ok) {
      const data = await response.json();
      stories = data.stories || [];
      console.log(`✅ تم تحميل ${stories.length} قصة من ملف JSON`);
      return;
    }
  } catch (error) {
    console.warn('⚠️ فشل جلب ملف JSON...', error);
  }
  
  // محاولة من localStorage
  try {
    const localData = localStorage.getItem('bed_stories_db');
    if (localData) {
      const data = JSON.parse(localData);
      stories = data.stories || [];
      console.log(`✅ تم تحميل ${stories.length} قصة من localStorage`);
      return;
    }
  } catch (e) {
    console.error('❌ خطأ:', e);
  }
  
  // إذا لم يوجد شيء
  stories = [];
  console.log('⚠️ لا توجد قصص محملة');
}

function setupEventListeners() {
  document.getElementById('searchInput').addEventListener('input', renderStories);
  document.getElementById('categoryFilter').addEventListener('change', renderStories);
  document.getElementById('ageFilter').addEventListener('change', renderStories);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  document.getElementById('rateSlider').addEventListener('input', (e) => {
    document.getElementById('rateValue').textContent = e.target.value;
  });
  
  document.getElementById('pitchSlider').addEventListener('input', (e) => {
    document.getElementById('pitchValue').textContent = e.target.value;
  });
  
  document.getElementById('voiceSelect').addEventListener('change', updateVoiceSettings);
}

function renderStories() {
  const grid = document.getElementById('storiesGrid');
  const noStories = document.getElementById('noStories');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;
  const ageFilter = document.getElementById('ageFilter').value;
  
  const filtered = stories.filter(story => {
    const matchSearch = story.title.toLowerCase().includes(searchTerm) || 
                       story.titleAr.includes(searchTerm);
    const matchCategory = categoryFilter === 'all' || story.category === categoryFilter;
    const matchAge = ageFilter === 'all' || story.ageRange === ageFilter;
    return matchSearch && matchCategory && matchAge;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '';
    noStories.classList.remove('hidden');
    return;
  }
  
  noStories.classList.add('hidden');
  grid.innerHTML = filtered.map(story => `
    <div class="story-card" onclick="openStory('${story.id}')">
      <img src="${story.image}" alt="${story.title}" class="story-card-image">
      <div class="story-card-content">
        <h3 class="story-card-title">${story.title}</h3>
        <p class="story-card-title-ar">${story.titleAr}</p>
        <div class="story-card-meta">
          <span class="badge">📂 ${story.category}</span>
          <span class="badge">👶 ${story.ageRange}</span>
          <span class="badge">⏱️ ${story.duration}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  updateCategoryFilter();
}

function updateCategoryFilter() {
  const categories = [...new Set(stories.map(s => s.category))];
  const select = document.getElementById('categoryFilter');
  const currentValue = select.value;
  
  select.innerHTML = '<option value="all">📂 All Categories</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  
  select.value = currentValue;
}

function openStory(storyId) {
  currentStory = stories.find(s => s.id === storyId);
  if (!currentStory) return;
  
  document.getElementById('storyImage').src = currentStory.image;
  document.getElementById('storyTitle').textContent = currentStory.title;
  document.getElementById('storyTitleAr').textContent = currentStory.titleAr;
  document.getElementById('storyCategory').textContent = '📂 ' + currentStory.category;
  document.getElementById('storyAge').textContent = '👶 ' + currentStory.ageRange;
  document.getElementById('storyDuration').textContent = '⏱️ ' + currentStory.duration;
  
  document.getElementById('voiceSelect').value = currentStory.voice || 'child';
  document.getElementById('rateSlider').value = currentStory.rate || 0.9;
  document.getElementById('rateValue').textContent = currentStory.rate || 0.9;
  document.getElementById('pitchSlider').value = currentStory.pitch || 1.2;
  document.getElementById('pitchValue').textContent = currentStory.pitch || 1.2;
  
  renderStoryContent();
  setupArabicTranslation();
  
  document.getElementById('storyModal').classList.remove('hidden');
  localStorage.setItem('last_story_id', storyId);
}

function renderStoryContent() {
  const contentDiv = document.getElementById('storyContent');
  const text = currentStory.content;
  words = text.split(/\s+/);
  
  contentDiv.innerHTML = words.map((word, index) => 
    `<span class="story-word" data-index="${index}" onclick="speakWord(${index})">${word}</span>`
  ).join(' ');
}

function setupArabicTranslation() {
  const arabicTextDiv = document.getElementById('arabicText');
  const speakBtn = document.getElementById('arabicSpeakBtn');
  const toggleBtn = document.getElementById('arabicToggle');
  
  if (currentStory.arabicContent && currentStory.arabicContent.trim()) {
    arabicTextDiv.textContent = currentStory.arabicContent;
    arabicTextDiv.classList.add('hidden');
    speakBtn.classList.add('hidden');
    toggleBtn.classList.remove('hidden');
    showArabicTranslation = false;
  } else {
    toggleBtn.classList.add('hidden');
    arabicTextDiv.classList.add('hidden');
    speakBtn.classList.add('hidden');
  }
}

function toggleArabicTranslation() {
  showArabicTranslation = !showArabicTranslation;
  const textDiv = document.getElementById('arabicText');
  const speakBtn = document.getElementById('arabicSpeakBtn');
  const toggleBtn = document.getElementById('arabicToggle');
  
  if (showArabicTranslation) {
    textDiv.classList.remove('hidden');
    speakBtn.classList.remove('hidden');
    toggleBtn.textContent = '📖 Hide Arabic Translation';
  } else {
    textDiv.classList.add('hidden');
    speakBtn.classList.add('hidden');
    toggleBtn.textContent = ' Show Arabic Translation';
    window.speechSynthesis.cancel();
  }
}

function speakArabicTranslation() {
  if (!currentStory.arabicContent) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(currentStory.arabicContent);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  
  const voices = window.speechSynthesis.getVoices();
  const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
  if (arabicVoice) utterance.voice = arabicVoice;
  
  window.speechSynthesis.speak(utterance);
  showToast('🔊 جاري القراءة بالعربية...');
}

function speakWord(index) {
  if (index < 0 || index >= words.length) return;
  
  window.speechSynthesis.cancel();
  
  const word = words[index];
  const utterance = new SpeechSynthesisUtterance(word);
  
  const voice = getSelectedVoice();
  utterance.voice = voice.voice;
  utterance.rate = parseFloat(document.getElementById('rateSlider').value);
  utterance.pitch = parseFloat(document.getElementById('pitchSlider').value);
  utterance.lang = 'en-US';
  
  highlightWord(index);
  
  utterance.onend = () => {
    removeHighlight();
  };
  
  window.speechSynthesis.speak(utterance);
}

function togglePlay() {
  if (isPlaying) {
    pauseReading();
  } else {
    startReading();
  }
}

function startReading() {
  if (!currentStory) return;
  
  isPlaying = true;
  document.getElementById('playBtn').textContent = '⏸ Pause';
  
  const text = currentStory.content;
  const utterance = new SpeechSynthesisUtterance(text);
  
  const voice = getSelectedVoice();
  utterance.voice = voice.voice;
  utterance.rate = parseFloat(document.getElementById('rateSlider').value);
  utterance.pitch = parseFloat(document.getElementById('pitchSlider').value);
  utterance.lang = 'en-US';
  
  utterance.onboundary = (event) => {
    if (event.name === 'word') {
      const charIndex = event.charIndex;
      const textBefore = text.substring(0, charIndex);
      const wordIndex = textBefore.split(/\s+/).length - 1;
      highlightWord(wordIndex);
    }
  };
  
  utterance.onend = () => {
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶ Play';
    removeHighlight();
    
    if (isSlowMode) {
      setTimeout(() => startReading(), 1000);
    }
  };
  
  utterance.onerror = (event) => {
    console.error('خطأ في النطق:', event);
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶ Play';
  };
  
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function pauseReading() {
  window.speechSynthesis.cancel();
  isPlaying = false;
  document.getElementById('playBtn').textContent = '▶ Play';
  removeHighlight();
}

function stopReading() {
  window.speechSynthesis.cancel();
  isPlaying = false;
  isSlowMode = false;
  document.getElementById('playBtn').textContent = '▶ Play';
  document.getElementById('slowBtn').textContent = '🐢 Slow Repeat';
  removeHighlight();
}

function toggleSlowMode() {
  isSlowMode = !isSlowMode;
  const btn = document.getElementById('slowBtn');
  
  if (isSlowMode) {
    btn.textContent = '🐢 Slow Mode: ON';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    document.getElementById('rateSlider').value = 0.7;
    document.getElementById('rateValue').textContent = '0.7';
    showToast('🐢 Slow repeat mode activated!');
  } else {
    btn.textContent = '🐢 Slow Repeat';
    btn.style.background = '';
    document.getElementById('rateSlider').value = 0.9;
    document.getElementById('rateValue').textContent = '0.9';
    showToast('✨ Normal mode restored!');
  }
}

function getSelectedVoice() {
  const voiceType = document.getElementById('voiceSelect').value;
  const voices = window.speechSynthesis.getVoices();
  
  let voice = voices[0];
  let pitch = parseFloat(document.getElementById('pitchSlider').value);
  
  if (voiceType === 'child') {
    voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female')) || voices[0];
    pitch = 1.5;
  } else if (voiceType === 'male') {
    voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || voices[0];
    pitch = 0.9;
  } else if (voiceType === 'female') {
    voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google UK English Female')) || voices[0];
    pitch = 1.1;
  }
  
  return { voice, pitch };
}

function updateVoiceSettings() {
  const voice = getSelectedVoice();
  document.getElementById('pitchSlider').value = voice.pitch;
  document.getElementById('pitchValue').textContent = voice.pitch;
}

function highlightWord(index) {
  removeHighlight();
  const wordElement = document.querySelector(`.story-word[data-index="${index}"]`);
  if (wordElement) {
    wordElement.classList.add('active');
    wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function removeHighlight() {
  document.querySelectorAll('.story-word.active').forEach(el => {
    el.classList.remove('active');
  });
}

function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('themeToggle');
  
  if (body.classList.contains('night-mode')) {
    body.classList.remove('night-mode');
    body.classList.add('day-mode');
    btn.textContent = '☀️';
  } else {
    body.classList.remove('day-mode');
    body.classList.add('night-mode');
    btn.textContent = '🌙';
  }
}

function closeStoryModal() {
  stopReading();
  document.getElementById('storyModal').classList.add('hidden');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

window.speechSynthesis.onvoiceschanged = () => {
  console.log('✅ تم تحميل الأصوات:', window.speechSynthesis.getVoices().length);
};
