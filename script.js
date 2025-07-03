let questions = [];
let selected = [];
let usedQuestions = []; // ⬅️ 新增：紀錄已出過的題目
let current = 0;
let score = 0;
let gameRound = 1;
const totalRounds = 30;
const questionsPerRound = 20;
let timeLeft = 600;
let timerInterval;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const quizBox = document.getElementById('quiz');
const resultBox = document.getElementById('result');
const scoreEl = document.getElementById('score');
const blessingEl = document.getElementById('blessing');
const timerEl = document.getElementById('timer');
const correctSound = new Audio('sfx/correct.mp3');
const wrongSound = new Audio('sfx/wrong.mp3');

fetch('questions.json')
  .then(res => res.json())
  .then(data => {
    questions = data;
    startGame();
  });

function startGame() {
  score = 0;
  current = 0;

  // 過濾出未使用的題目
  const unused = questions.filter(q => !usedQuestions.includes(q.question));

  // 題目不足時直接破關
  if (unused.length < questionsPerRound) {
    endGame("🎉 你已完成所有題目，破關成功！");
    return;
  }

  selected = shuffle(unused).slice(0, questionsPerRound);
  usedQuestions.push(...selected.map(q => q.question));

  startTimer();
  showQuestion();
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startTimer() {
  timeLeft = 600;
  timerInterval = setInterval(() => {
    timeLeft--;
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    timerEl.textContent = `剩餘時間：${min}:${sec.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) endGame('時間到！');
  }, 1000);
}

function showQuestion() {
  const q = selected[current];
  questionEl.textContent = `（${q.category}）第 ${current + 1} 題：${q.question}`;
  optionsEl.innerHTML = '';
  nextBtn.classList.add('hidden');

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => {
      const correct = opt === q.answer;
      btn.style.backgroundColor = correct ? 'lightgreen' : 'salmon';
      if (correct) {
        score++;
        correctSound.play();
      } else {
        wrongSound.play();
      }
      Array.from(optionsEl.children).forEach(b => b.disabled = true);
      nextBtn.classList.remove('hidden');
    };
    optionsEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  current++;
  if (current < selected.length) {
    showQuestion();
  } else {
    gameRound++;
    if (gameRound > totalRounds || usedQuestions.length >= questions.length) {
      endGame('🎉 恭喜！你已完成所有題目，破關成功！');
    } else {
      alert(`你已完成第 ${gameRound - 1} 回合，進入第 ${gameRound} 回合`);
      startGame();
    }
  }
};

function endGame(message) {
  clearInterval(timerInterval);
  quizBox.classList.add('hidden');
  resultBox.classList.remove('hidden');
  scoreEl.textContent = `${message} 你本回合共答對 ${score}/${questionsPerRound} 題。`;
  blessingEl.textContent = score === questionsPerRound
    ? '神的話在你心中發旺，真棒！'
    : score >= 10
      ? '不錯哦，再接再勵！'
      : '繼續努力，熟讀聖經是長久之道！';
}
