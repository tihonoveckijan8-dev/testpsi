(function(){
  "use strict";

  // ---------- ОСНОВНОЕ ПРИЛОЖЕНИЕ ----------
  let currentUser = null;
  let testResults = [];
  let activeTest = null;
  let appMode = 'register';
  let activeTab = 'tests';
  const STORAGE_KEY = 'psych_pro_v13';

  const TESTS = [
    {
      id: 'stress',
      title: 'Шкала воспринимаемого стресса (PSS-10)',
      description: 'Оценка уровня стресса за последний месяц',
      icon: 'fa-heart-pulse',
      questions: [
        { text: 'Как часто за последний месяц вы чувствовали, что не можете контролировать важные вещи?', options: ['Никогда', 'Почти никогда', 'Иногда', 'Довольно часто', 'Очень часто'] },
        { text: 'Как часто вы чувствовали уверенность в своей способности справиться с личными проблемами?', options: ['Никогда', 'Почти никогда', 'Иногда', 'Довольно часто', 'Очень часто'] },
        { text: 'Как часто вы чувствовали, что всё идёт так, как вы хотите?', options: ['Никогда', 'Почти никогда', 'Иногда', 'Довольно часто', 'Очень часто'] },
        { text: 'Как часто вы чувствовали, что трудности накапливаются и вы не можете их преодолеть?', options: ['Никогда', 'Почти никогда', 'Иногда', 'Довольно часто', 'Очень часто'] }
      ],
      interpret: (score) => {
        if (score <= 7) return { level: 'Низкий', description: 'Низкий уровень стресса. Хорошая адаптация.', recommendations: 'Поддерживайте текущий образ жизни, практикуйте осознанность.' };
        if (score <= 14) return { level: 'Умеренный', description: 'Умеренный стресс. Требуется внимание к восстановлению.', recommendations: 'Рекомендованы техники релаксации, регулярный сон, физическая активность.' };
        return { level: 'Высокий', description: 'Высокий уровень стресса. Рекомендована консультация специалиста.', recommendations: 'Обратитесь к психологу, изучите методы управления стрессом (дыхание, медитация).' };
      }
    },
    {
      id: 'selfesteem',
      title: 'Шкала самоуважения Розенберга',
      description: 'Глобальная самооценка',
      icon: 'fa-star',
      questions: [
        { text: 'Я чувствую, что я достойный человек, по крайней мере не хуже других.', options: ['Совсем не согласен', 'Не согласен', 'Согласен', 'Полностью согласен'] },
        { text: 'Я склонен думать, что я неудачник.', options: ['Совсем не согласен', 'Не согласен', 'Согласен', 'Полностью согласен'] },
        { text: 'Я чувствую, что у меня есть ряд хороших качеств.', options: ['Совсем не согласен', 'Не согласен', 'Согласен', 'Полностью согласен'] },
        { text: 'Я способен делать многие вещи так же хорошо, как большинство.', options: ['Совсем не согласен', 'Не согласен', 'Согласен', 'Полностью согласен'] }
      ],
      interpret: (score) => {
        if (score >= 25) return { level: 'Высокая', description: 'Устойчивая позитивная самооценка.', recommendations: 'Продолжайте развивать сильные стороны.' };
        if (score >= 15) return { level: 'Средняя', description: 'Адекватная самооценка с потенциалом роста.', recommendations: 'Работа с аффирмациями и ведение дневника достижений.' };
        return { level: 'Низкая', description: 'Сниженная самооценка, возможны трудности.', recommendations: 'Рекомендована психотерапия, когнитивно-поведенческие техники.' };
      }
    },
    {
      id: 'eq',
      title: 'Эмоциональный интеллект',
      description: 'Способность распознавать эмоции',
      icon: 'fa-face-smile',
      questions: [
        { text: 'Я хорошо понимаю свои эмоции.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Я могу управлять своими эмоциями в сложных ситуациях.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Я замечаю, когда другие расстроены, даже если они этого не показывают.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Мне легко поставить себя на место другого человека.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] }
      ],
      interpret: (score) => {
        if (score >= 14) return { level: 'Высокий', description: 'Развитый эмоциональный интеллект.', recommendations: 'Используйте эмпатию для укрепления отношений.' };
        if (score >= 9) return { level: 'Средний', description: 'Базовые навыки, есть зоны роста.', recommendations: 'Практикуйте активное слушание и ведение дневника эмоций.' };
        return { level: 'Низкий', description: 'Трудности в распознавании и управлении эмоциями.', recommendations: 'Полезны тренинги эмоционального интеллекта, психологическое консультирование.' };
      }
    },
    {
      id: 'coping',
      title: 'Копинг-стратегии',
      description: 'Способы совладания со стрессом',
      icon: 'fa-shield',
      questions: [
        { text: 'В трудной ситуации я стараюсь найти поддержку у друзей.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Я предпринимаю активные действия, чтобы изменить ситуацию.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Я стараюсь увидеть ситуацию в более позитивном свете.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] },
        { text: 'Я смиряюсь с тем, что ничего не могу изменить.', options: ['Никогда', 'Редко', 'Иногда', 'Часто', 'Всегда'] }
      ],
      interpret: (score) => {
        if (score >= 14) return { level: 'Активные', description: 'Вы используете эффективные копинг-стратегии.', recommendations: 'Продолжайте опираться на поддержку и планирование.' };
        if (score >= 9) return { level: 'Смешанные', description: 'Частично эффективные стратегии.', recommendations: 'Усильте проактивные методы, избегайте пассивности.' };
        return { level: 'Пассивные', description: 'Склонность к избеганию или пассивному принятию.', recommendations: 'Рекомендовано обучение проблемно-ориентированному копингу.' };
      }
    }
  ];

  // ----- Хранилище -----
  function loadUserData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.currentUser) {
          currentUser = data.currentUser;
          testResults = data.testResults || [];
          appMode = 'dashboard';
        } else appMode = 'register';
      } catch(e){ appMode = 'register'; }
    } else appMode = 'register';
  }
  function saveToStorage() {
    if (!currentUser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUser, testResults }));
  }

  const contentDiv = document.getElementById('dynamicContent');
  const settingsModal = document.getElementById('settingsModal');
  const detailsModal = document.getElementById('detailsModal');

  // ----- УЛУЧШЕННОЕ ОКНО НАСТРОЕК -----
  function openSettings() {
    const currentTheme = document.body.getAttribute('data-theme') || 'blue';
    settingsModal.style.display = 'block';
    settingsModal.innerHTML = `
      <div class="modal-overlay" id="settingsOverlay">
        <div class="modal-content" style="max-width: 480px;">
          <div class="flex-between" style="margin-bottom: 24px;">
            <h3 style="font-weight: 500;"><i class="fas fa-sliders-h" style="margin-right: 10px;"></i>Настройки</h3>
            <button class="btn btn-outline-light" id="closeSettingsBtn" style="padding:8px 16px;"><i class="fas fa-times"></i></button>
          </div>
          
          <div style="margin-bottom: 28px;">
            <h4 style="margin-bottom: 16px; font-weight: 500;">Тема оформления</h4>
            <div class="settings-theme-option ${currentTheme==='blue'?'active':''}" data-theme="blue">
              <div class="theme-color-dot" style="background: #1e3a5f;"></div>
              <div><strong>Синий</strong><br><span style="font-size:0.85rem; opacity:0.8;">Спокойствие и глубина</span></div>
            </div>
            <div class="settings-theme-option ${currentTheme==='green'?'active':''}" data-theme="green">
              <div class="theme-color-dot" style="background: #1b4d3e;"></div>
              <div><strong>Зелёный</strong><br><span style="font-size:0.85rem; opacity:0.8;">Природа и баланс</span></div>
            </div>
            <div class="settings-theme-option ${currentTheme==='yellow'?'active':''}" data-theme="yellow">
              <div class="theme-color-dot" style="background: #a0791a;"></div>
              <div><strong>Жёлтый</strong><br><span style="font-size:0.85rem; opacity:0.8;">Энергия и тепло</span></div>
            </div>
          </div>
          
          <div class="profile-card">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 56px; height: 56px; background: var(--accent-primary); border-radius: 40px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem;">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div>
                <h4 style="font-weight: 500;">${currentUser ? currentUser.name : 'Гость'}</h4>
                <p style="opacity:0.8;">${currentUser ? currentUser.group || '—' : 'Войдите в систему'}</p>
              </div>
            </div>
            ${currentUser ? `
              <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 16px; margin-top: 8px;">
                <p><i class="fas fa-calendar-alt"></i> ID: ${currentUser.id.slice(0,8)}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            ${currentUser ? `<button class="btn btn-outline-light" id="logoutFromSettings"><i class="fas fa-sign-out-alt"></i> Выйти</button>` : ''}
            <button class="btn btn-primary" id="closeSettingsDone">Готово</button>
          </div>
        </div>
      </div>
    `;
    
    document.querySelectorAll('.settings-theme-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const newTheme = opt.dataset.theme;
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('psych_theme', newTheme);
        settingsModal.querySelectorAll('.settings-theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
    
    document.getElementById('closeSettingsBtn').addEventListener('click', () => settingsModal.style.display = 'none');
    document.getElementById('closeSettingsDone').addEventListener('click', () => settingsModal.style.display = 'none');
    document.getElementById('settingsOverlay').addEventListener('click', (e) => { if(e.target.id==='settingsOverlay') settingsModal.style.display = 'none'; });
    const logoutBtn = document.getElementById('logoutFromSettings');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { settingsModal.style.display = 'none'; logout(); });
  }

  function logout() {
    currentUser = null; testResults = []; appMode = 'register';
    localStorage.removeItem(STORAGE_KEY); renderApp();
  }

  // ----- Регистрация -----
  function renderRegister() {
    contentDiv.innerHTML = `
      <div class="reg-wrapper glass-card">
        <h2 style="margin-bottom: 32px;"><i class="fas fa-id-card"></i> Регистрация учащегося</h2>
        <form id="regForm">
          <div class="input-group">
            <label><i class="fas fa-user"></i> Имя и фамилия</label>
            <input id="regName" class="input-glass" placeholder="Анна Смирнова" required>
          </div>
          <div class="input-group">
            <label><i class="fas fa-users"></i> Группа / класс</label>
            <input id="regGroup" class="input-glass" placeholder="ПС-21">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; margin-top: 8px;"><i class="fas fa-arrow-right"></i> Начать тестирование</button>
        </form>
      </div>`;
    document.getElementById('regForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      if(!name) return;
      const group = document.getElementById('regGroup').value.trim() || '—';
      currentUser = { id: name.toLowerCase().replace(/\s/g,'')+Date.now(), name, group };
      const hist = localStorage.getItem(`psych_hist_${currentUser.id}`);
      testResults = hist ? JSON.parse(hist) : [];
      appMode = 'dashboard'; activeTab = 'tests'; saveToStorage(); renderApp();
    });
  }

  // ----- Дашборд -----
  function renderDashboard() {
    contentDiv.innerHTML = `
      <div class="tabs">
        <button class="tab-btn ${activeTab==='tests'?'active':''}" data-tab="tests"><i class="fas fa-flask"></i> Тесты</button>
        <button class="tab-btn ${activeTab==='analytics'?'active':''}" data-tab="analytics"><i class="fas fa-chart-line"></i> Аналитика</button>
      </div>
      <div id="tabContent"></div>
    `;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', (e) => {
      activeTab = btn.dataset.tab;
      renderDashboard();
    }));
    const tabContent = document.getElementById('tabContent');
    if (activeTab === 'tests') renderTestsTab(tabContent);
    else renderAnalyticsTab(tabContent);
  }

  function renderTestsTab(container) {
    const historyHtml = testResults.slice().reverse().map(att => {
      const date = new Date(att.timestamp).toLocaleString('ru', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
      return `<div class="history-item"><div class="flex-between"><span><i class="fas fa-clipboard"></i> ${att.testTitle}</span><span class="badge">${date}</span></div>
        <div><strong>${att.resultLevel}</strong> · ${att.interpretationShort}</div>
        <div style="margin-top:16px; display:flex; gap:8px;">
          <button class="btn btn-outline-light download-txt-btn" data-id="${att.id}"><i class="fas fa-file-alt"></i> TXT</button>
          <button class="btn btn-outline-light view-details-btn" data-id="${att.id}"><i class="fas fa-eye"></i> Подробно</button>
        </div></div>`;
    }).join('') || '<div class="history-item" style="text-align:center;">Нет завершённых тестов</div>';

    container.innerHTML = `<div class="grid-2col">
      <div><h2 style="margin-bottom:18px;">Доступные тесты</h2><div class="test-list" id="testListContainer"></div></div>
      <div><h2 style="margin-bottom:18px;">История</h2><div class="history-section">${historyHtml}</div></div>
    </div>`;
    const cont = document.getElementById('testListContainer');
    TESTS.forEach(t => {
      const card = document.createElement('div'); card.className = 'test-card flex-between';
      card.innerHTML = `<div><i class="fas ${t.icon}"></i> <strong>${t.title}</strong><br><small>${t.description}</small></div>
        <button class="btn btn-primary start-test" data-testid="${t.id}"><i class="fas fa-play"></i> Пройти</button>`;
      cont.appendChild(card);
    });
    document.querySelectorAll('.start-test').forEach(b => b.addEventListener('click', e => startTest(b.dataset.testid)));
    document.querySelectorAll('.download-txt-btn').forEach(b => b.addEventListener('click', e => {
      const att = testResults.find(a => a.id === b.dataset.id); if(att) downloadTextReport(att);
    }));
    document.querySelectorAll('.view-details-btn').forEach(b => b.addEventListener('click', e => {
      const att = testResults.find(a => a.id === b.dataset.id); if(att) showDetailsModal(att);
    }));
  }

  function renderAnalyticsTab(container) {
    if (testResults.length === 0) {
      container.innerHTML = `<div class="glass-card text-center">Нет данных для аналитики. Пройдите хотя бы один тест.</div>`;
      return;
    }
    const grouped = {};
    testResults.forEach(r => { if(!grouped[r.testId]) grouped[r.testId] = []; grouped[r.testId].push(r); });
    const testIds = Object.keys(grouped);
    let selectOptions = testIds.map(id => `<option value="${id}">${TESTS.find(t=>t.id===id)?.title || id}</option>`).join('');
    
    container.innerHTML = `
      <div class="glass-card">
        <div class="flex-between"><h3>Динамика по тесту</h3>
          <select id="testSelect" class="input-glass" style="width:auto; padding:10px 20px;">${selectOptions}</select>
        </div>
        <div style="height:250px;"><canvas id="singleChart"></canvas></div>
      </div>
      <div class="glass-card" style="margin-top:24px;">
        <h3>Сводный график (последние 5 попыток каждого теста)</h3>
        <div style="height:280px;"><canvas id="combinedChart"></canvas></div>
      </div>
    `;
    
    const ctxSingle = document.getElementById('singleChart').getContext('2d');
    const ctxCombined = document.getElementById('combinedChart').getContext('2d');
    let singleChart, combinedChart;
    
    function updateSingleChart(testId) {
      const attempts = grouped[testId] || [];
      const sorted = [...attempts].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      const labels = sorted.map((_,i) => `#${i+1}`);
      const scores = sorted.map(a => a.totalScore);
      if (singleChart) singleChart.destroy();
      singleChart = new Chart(ctxSingle, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Баллы',
            data: scores,
            borderColor: getComputedStyle(document.body).getPropertyValue('--accent-primary'),
            backgroundColor: 'rgba(255,255,255,0.2)',
            tension: 0.2,
            fill: true
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    
    function updateCombinedChart() {
      const datasets = [];
      const colors = ['#1e3a5f', '#2e6b4f', '#a0791a', '#7a5c00'];
      testIds.forEach((id, idx) => {
        const attempts = grouped[id].slice(-5);
        const sorted = [...attempts].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
        datasets.push({
          label: TESTS.find(t=>t.id===id)?.title || id,
          data: sorted.map(a => a.totalScore),
          borderColor: colors[idx % colors.length],
          tension: 0.2
        });
      });
      if (combinedChart) combinedChart.destroy();
      combinedChart = new Chart(ctxCombined, {
        type: 'line',
        data: {
          labels: [...Array(Math.max(...datasets.map(d=>d.data.length)))].map((_,i)=> `Попытка ${i+1}`),
          datasets
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
    
    updateSingleChart(testIds[0]);
    updateCombinedChart();
    document.getElementById('testSelect').addEventListener('change', e => updateSingleChart(e.target.value));
  }

  function startTest(id) {
    const def = TESTS.find(t=>t.id===id); if(!def) return;
    activeTest = { ...def, currentIndex:0, answers: new Array(def.questions.length).fill(null) };
    appMode = 'taking'; renderQuestion();
  }

  function renderQuestion() {
    const q = activeTest.questions[activeTest.currentIndex];
    contentDiv.innerHTML = `<div class="glass-card"><div class="flex-between"><span class="badge">${activeTest.title}</span><span>${activeTest.currentIndex+1}/${activeTest.questions.length}</span></div>
      <div style="height:6px; background:rgba(255,255,255,0.3); margin:24px 0;"><div style="width:${(activeTest.currentIndex/activeTest.questions.length)*100}%; height:6px; background:var(--accent-primary); border-radius:6px;"></div></div>
      <div class="question-text">${q.text}</div>
      <div class="options">${q.options.map((opt,i)=>`<div class="option-btn ${activeTest.answers[activeTest.currentIndex]===i?'selected':''}" data-opt="${i}">${opt}</div>`).join('')}</div>
      <div class="footer-actions"><button class="btn btn-outline-light" id="prevBtn" ${activeTest.currentIndex===0?'disabled':''}>← Назад</button>
      <button class="btn btn-primary" id="nextBtn">${activeTest.currentIndex===activeTest.questions.length-1?'Завершить':'Далее →'}</button></div></div>`;
    document.querySelectorAll('.option-btn').forEach(o=>o.addEventListener('click', ()=>{
      activeTest.answers[activeTest.currentIndex] = parseInt(o.dataset.opt); renderQuestion();
    }));
    document.getElementById('prevBtn')?.addEventListener('click', ()=>{ if(activeTest.currentIndex>0){activeTest.currentIndex--; renderQuestion();} });
    document.getElementById('nextBtn')?.addEventListener('click', ()=>{
      if(activeTest.answers[activeTest.currentIndex]===null) { alert('Выберите ответ'); return; }
      if(activeTest.currentIndex < activeTest.questions.length-1) { activeTest.currentIndex++; renderQuestion(); }
      else finishTest();
    });
  }

  function finishTest() {
    let score = 0;
    if (activeTest.id === 'selfesteem') {
      activeTest.answers.forEach((a,i)=> score += (i===1||i===3) ? (3-a) : a);
    } else { score = activeTest.answers.reduce((s,v)=>s+v,0); }
    const interp = activeTest.interpret(score);
    const attempt = {
      id: Date.now()+'-'+Math.random().toString(36), testId: activeTest.id, testTitle: activeTest.title,
      timestamp: new Date().toISOString(), answers: [...activeTest.answers], totalScore: score,
      resultLevel: interp.level, interpretationShort: interp.description,
      recommendations: interp.recommendations, student: {...currentUser}
    };
    testResults.push(attempt);
    localStorage.setItem(`psych_hist_${currentUser.id}`, JSON.stringify(testResults));
    saveToStorage();
    appMode = 'result'; activeTest.attempt = attempt; renderResult(attempt);
  }

  function renderResult(attempt) {
    contentDiv.innerHTML = `<div class="glass-card text-center"><i class="fas fa-circle-check fa-3x" style="color:var(--accent-primary);"></i>
      <h2>${attempt.testTitle}</h2><div class="result-highlight">${attempt.resultLevel}</div><p>${attempt.interpretationShort}</p>
      <div style="background:rgba(255,255,255,0.2); padding:16px; border-radius:40px; margin:20px 0;"><strong>Рекомендации:</strong> ${attempt.recommendations || '—'}</div>
      <div class="footer-actions" style="justify-content:center;"><button class="btn btn-primary" id="toDashboard">К тестам</button>
      <button class="btn btn-outline-light" id="showDetailsFromResult"><i class="fas fa-file-alt"></i> Подробный отчёт</button></div></div>`;
    document.getElementById('toDashboard').addEventListener('click', ()=>{ appMode='dashboard'; activeTab='tests'; renderApp(); });
    document.getElementById('showDetailsFromResult').addEventListener('click', ()=> showDetailsModal(attempt));
  }

  function showDetailsModal(attempt) {
    const testDef = TESTS.find(t=>t.id===attempt.testId);
    const answersText = attempt.answers.map((ans,i) => `${i+1}. ${testDef.questions[i].options[ans]}`).join('<br>');
    detailsModal.style.display = 'block';
    detailsModal.innerHTML = `
      <div class="modal-overlay" id="detailsOverlay">
        <div class="modal-content wide-modal">
          <div class="flex-between"><h3>${attempt.testTitle}</h3><button class="btn btn-outline-light" id="closeDetailsBtn"><i class="fas fa-times"></i></button></div>
          <p><strong>Дата:</strong> ${new Date(attempt.timestamp).toLocaleString('ru')}</p>
          <p><strong>Результат:</strong> ${attempt.resultLevel} (балл: ${attempt.totalScore})</p>
          <p><strong>Интерпретация:</strong> ${attempt.interpretationShort}</p>
          <p><strong>Рекомендации:</strong> ${attempt.recommendations}</p>
          <p><strong>Ответы:</strong><br>${answersText}</p>
          <div class="footer-actions"><button class="btn btn-primary" id="downloadTxtFromModal"><i class="fas fa-file-alt"></i> Скачать TXT</button></div>
        </div>
      </div>
    `;
    document.getElementById('closeDetailsBtn').addEventListener('click', () => detailsModal.style.display = 'none');
    document.getElementById('detailsOverlay').addEventListener('click', (e) => { if(e.target.id==='detailsOverlay') detailsModal.style.display = 'none'; });
    document.getElementById('downloadTxtFromModal').addEventListener('click', () => { downloadTextReport(attempt); detailsModal.style.display = 'none'; });
  }

  function downloadTextReport(attempt) {
    const testDef = TESTS.find(t=>t.id===attempt.testId);
    const answersText = attempt.answers.map((ans,i) => `Вопрос ${i+1}: ${testDef.questions[i].text}\nОтвет: ${testDef.questions[i].options[ans]}`).join('\n\n');
    const content = `ПСИХОЛОГИЧЕСКИЙ ОТЧЁТ\n==============================\nСтудент: ${attempt.student.name}\nГруппа: ${attempt.student.group}\nТест: ${attempt.testTitle}\nДата: ${new Date(attempt.timestamp).toLocaleString('ru')}\n--------------------------------\nРЕЗУЛЬТАТ: ${attempt.resultLevel}\nБалл: ${attempt.totalScore}\n\nИнтерпретация:\n${attempt.interpretationShort}\n\nРекомендации:\n${attempt.recommendations || '—'}\n--------------------------------\nВЫБРАННЫЕ ОТВЕТЫ:\n${answersText}\n--------------------------------\nОтчёт сгенерирован профессиональной системой.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PsychReport_${attempt.testId}_${attempt.student.name.replace(/\s/g,'_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('psych_theme') || 'blue';
    document.body.setAttribute('data-theme', savedTheme);
  }

  function renderApp() {
    if(!currentUser) { appMode='register'; renderRegister(); return; }
    if(appMode==='dashboard') renderDashboard();
    else if(appMode==='taking') renderQuestion();
    else if(appMode==='result' && activeTest?.attempt) renderResult(activeTest.attempt);
    else { appMode='dashboard'; activeTab='tests'; renderDashboard(); }
  }

  document.getElementById('openSettingsBtn').addEventListener('click', openSettings);

  loadUserData();
  initTheme();
  renderApp();
})();