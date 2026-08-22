let stories = [];
let currentStory = null;
let isPlaying = false;
let isSlowMode = false;
let currentUtterance = null;
let words = [];
let showArabicTranslation = false;

const sampleStories = [
  {
    id: "story-1",
    title: "The Magic Forest",
    titleAr: "الغابة السحرية",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600",
    category: "Adventure",
    ageRange: "3-6",
    duration: "5 min",
    content: "Once upon a time, in a magical forest, there lived a little rabbit named Benny. Benny loved to explore the forest and make new friends. One day, he found a glowing mushroom that could talk! The mushroom said, 'Hello Benny! I am Magic Mushroom. I can grant you one wish.' Benny thought carefully and wished for all the animals in the forest to be happy forever. The mushroom smiled and said, 'Your wish is granted!' From that day on, all the animals lived happily together in the magical forest.",
    arabicContent: "كان يا ما كان في غابة سحرية، كان يعيش أرنب صغير اسمه بيني. كان بيني يحب استكشاف الغابة وتكوين أصدقاء جدد. في يوم من الأيام، وجد فطرًا متوهجًا يمكنه التحدث! قال الفطر: 'مرحبًا بيني! أنا الفطر السحري. يمكنني أن أمنحك أمنية واحدة.' فكر بيني بعناية وتمنى أن يكون جميع الحيوانات في الغابة سعداء إلى الأبد. ابتسم الفطر وقال: 'تمنيتك قد تحققت!' ومن ذلك اليوم، عاشت جميع الحيوانات بسعادة معًا في الغابة السحرية.",
    voice: "child",
    rate: 0.9,
    pitch: 1.3
  },
  {
    id: "story-2",
    title: "The Brave Little Star",
    titleAr: "النجمة الشجاعة",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600",
    category: "Fantasy",
    ageRange: "4-8",
    duration: "7 min",
    content: "High up in the night sky, there was a little star named Stella. She was smaller than all the other stars, but she had the biggest heart. One night, a little boy on Earth was crying because he was afraid of the dark. Stella saw him and decided to shine brighter than ever before. She twinkled and sparkled until the boy looked up and smiled. 'Look mommy, that little star is shining just for me!' From that night on, Stella knew that even the smallest light can make a big difference.",
    arabicContent: "عاليًا في سماء الليل، كانت هناك نجمة صغيرة اسمها ستيلا. كانت أصغر من جميع النجوم الأخرى، لكن كان لديها أكبر قلب. في ليلة من الليالي، كان طفل صغير على الأرض يبكي لأنه خائف من الظلام. رأت ستيلا ذلك وقررت أن تلمع أكثر من أي وقت مضى. تألقت وتلألأت حتى نظر الطفل إليها وابتسم. 'انظري يا أمي، تلك النجمة الصغيرة تلمع من أجلي!' ومن تلك الليلة، عرفت ستيلا أن حتى أصغر ضوء يمكن أن يحدث فرقًا كبيرًا.",
    voice: "female",
    rate: 1.0,
    pitch: 1.1
  },
  {
    id: "story-3",
    title: "The Friendly Dragon",
    titleAr: "التنين الودود",
    image: "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=600",
    category: "Fantasy",
    ageRange: "5-9",
    duration: "8 min",
    content: "In a cave high on a mountain, there lived a dragon named Danny. All the villagers were scared of him, but Danny was actually very friendly. He loved to bake cookies and sing songs. One day, a little girl named Lily got lost in the mountains. She found Danny's cave and was scared at first. But Danny offered her a warm cookie and a cozy blanket. They became best friends, and Danny even flew her back home. The villagers learned that you should never judge someone by how they look.",
    arabicContent: "في كهف عالي على جبل، كان يعيش تنين اسمه داني. كان جميع القرويين خائفين منه، لكن داني كان في الواقع ودودًا جدًا. كان يحب خبز الكعك وغناء الأغاني. في يوم من الأيام، ضلت فتاة صغيرة اسمها ليلي في الجبال. وجدت كهف داني وكانت خائفة في البداية. لكن داني قدم لها كعكة دافئة وبطانية مريحة. أصبحا أفضل أصدقاء، وحتى أن داني طار بها إلى المنزل. تعلم القرويون أنه يجب ألا تحكم على شخص من مظهره.",
    voice: "male",
    rate: 1.0,
    pitch: 0.9
  }
];

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
      if (stories.length === 0) {
        stories = sampleStories;
        console.log('📚 تم تحميل القصص النموذجية');
      }
      return;
    }
  } catch (error) {
    console.warn('⚠️ فشل جلب ملف JSON...', error);
  }
  
  try {
    const localData = localStorage.getItem('bed_stories_db');
    if (localData) {
      const data = JSON.parse(localData);
      stories = data.stories || [];
      console.log(`✅ تم تحميل ${stories.length} قصة من localStorage`);
    } else {
      stories = sampleStories;
      console.log('📚 تم تحميل القصص النموذجية');
    }
  } catch (e) {
    console.error('❌ خطأ:', e);
    stories = sampleStories;
  }
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