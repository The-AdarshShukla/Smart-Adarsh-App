        class QuizGame {
            constructor() {
                // DOM Elements
                this.elements = {
                    quizContainer: document.getElementById('quiz'),
                    currentQuestionEl: document.getElementById('current-question'),
                    scoreEl: document.getElementById('score'),
                    questionTextEl: document.getElementById('question-text'),
                    optionsContainer: document.getElementById('options-container'),
                    timerProgressEl: document.getElementById('timer-progress'),
                    timeLeftEl: document.getElementById('time-left'),
                    prevBtn: document.getElementById('prev-btn'),
                    nextBtn: document.getElementById('next-btn'),
                    submitBtn: document.getElementById('submit-btn'),
                    quizResultEl: document.getElementById('quiz-result'),
                    totalQuestionsEl: document.getElementById('total-questions'),
                    correctAnswersEl: document.getElementById('correct-answers'),
                    wrongAnswersEl: document.getElementById('wrong-answers'),
                    finalScoreEl: document.getElementById('final-score'),
                    timeTakenEl: document.getElementById('time-taken'),
                    scoreBadgeEl: document.getElementById('score-badge'),
                    timeBadgeEl: document.getElementById('time-badge'),
                    streakBadgeEl: document.getElementById('streak-badge'),
                    restartQuizBtn: document.getElementById('restart-quiz'),
                    newQuizBtn: document.getElementById('new-quiz'),
                    categoryBtns: document.querySelectorAll('.category-btn')
                };

                // Quiz state
                this.state = {
                    questions: [],
                    filteredQuestions: [],
                    currentQuestionIndex: 0,
                    score: 0,
                    userAnswers: [],
                    timer: null,
                    timeLeft: 30,
                    timeTaken: 0,
                    correctStreak: 0,
                    selectedCategory: 'all',
                    isDarkMode: document.body.classList.contains('dark-mode')
                };

                // Initialize
                this.init();
            }

            async init() {
                // Load questions
                await this.loadQuestions();

                // Initialize event listeners
                this.initEventListeners();

                // Start the quiz
                this.startQuiz();

                // Watch for theme changes
                this.watchThemeChanges();
            }

            async loadQuestions() {
                try {
                    // Try to load from API first
                    const apiResponse = await fetch('https://opentdb.com/api.php?amount=50');
                    if (apiResponse.ok) {
                        const data = await apiResponse.json();
                        this.state.questions = this.transformApiQuestions(data.results);
                    } else {
                        throw new Error('API failed, using fallback');
                    }
                } catch (error) {
                    // Fallback to local questions if API fails
                    console.log('Using fallback questions:', error);
                    this.state.questions = this.getLocalQuestions();
                }
            }

            transformApiQuestions(apiQuestions) {
                return apiQuestions.map(q => ({
                    question: this.decodeHtmlEntities(q.question),
                    options: [...q.incorrect_answers.map(a => this.decodeHtmlEntities(a)),
                    this.decodeHtmlEntities(q.correct_answer)].sort(() => Math.random() - 0.5),
                    answer: this.decodeHtmlEntities(q.correct_answer),
                    category: q.category.toLowerCase().replace(/[^a-z]/g, '-'),
                    difficulty: q.difficulty
                }));
            }

            decodeHtmlEntities(text) {
                const textArea = document.createElement('textarea');
                textArea.innerHTML = text;
                return textArea.value;
            }

            getLocalQuestions() {
                // Your existing hardcoded questions plus more
                return [
                    // General Knowledge (10 questions)
                    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], answer: "Paris", category: "general", difficulty: "easy" },
                    { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: "Mars", category: "general", difficulty: "easy" },
                    { question: "What is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], answer: "Pacific Ocean", category: "general", difficulty: "medium" },

                    // Science (10 questions)
                    { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: "H2O", category: "science", difficulty: "easy" },
                    { question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Cell membrane"], answer: "Mitochondria", category: "science", difficulty: "medium" },

                    // Add more questions for each category...
                ];
            }

            initEventListeners() {
                // Category selection
                this.elements.categoryBtns.forEach(btn => {
                    btn.addEventListener('click', () => this.selectCategory(btn));
                });

                // Navigation buttons
                this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
                this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
                this.elements.submitBtn.addEventListener('click', () => this.submitQuiz());
                this.elements.restartQuizBtn.addEventListener('click', () => this.restartQuiz());
                this.elements.newQuizBtn.addEventListener('click', () => this.newQuiz());

                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') this.prevQuestion();
                    if (e.key === 'ArrowRight') this.nextQuestion();
                    if (e.key >= 1 && e.key <= 4) {
                        const optionIndex = parseInt(e.key) - 1;
                        const options = document.querySelectorAll('.option-btn');
                        if (options[optionIndex]) options[optionIndex].click();
                    }
                });
            }

            watchThemeChanges() {
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (mutation.attributeName === 'class') {
                            this.state.isDarkMode = document.body.classList.contains('dark-mode');
                            this.updateThemeDependentStyles();
                        }
                    });
                });

                observer.observe(document.body, {
                    attributes: true,
                    attributeFilter: ['class']
                });
            }

            updateThemeDependentStyles() {
                const { isDarkMode } = this.state;
                const root = document.documentElement;

                if (isDarkMode) {
                    root.style.setProperty('--light-color', '#2d3748');
                    root.style.setProperty('--dark-color', '#f8f9fa');
                    root.style.setProperty('--light-gray', '#4a5568');
                } else {
                    root.style.setProperty('--light-color', '#f8f9fa');
                    root.style.setProperty('--dark-color', '#212529');
                    root.style.setProperty('--light-gray', '#e9ecef');
                }
            }

            selectCategory(btn) {
                // Update UI
                this.elements.categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update state
                this.state.selectedCategory = btn.dataset.category;

                // Start new quiz with selected category
                this.newQuiz();
            }

            startQuiz() {
                // Filter questions by category
                this.state.filteredQuestions = this.state.selectedCategory === 'all'
                    ? [...this.state.questions]
                    : this.state.questions.filter(q => q.category === this.state.selectedCategory);

                // Shuffle questions
                this.shuffleQuestions();

                // Limit to 10 questions for the quiz
                this.state.filteredQuestions = this.state.filteredQuestions.slice(0, 10);

                // Reset quiz state
                this.resetQuizState();

                // Show first question
                this.showQuestion();
            }

            shuffleQuestions() {
                for (let i = this.state.filteredQuestions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.state.filteredQuestions[i], this.state.filteredQuestions[j]] =
                        [this.state.filteredQuestions[j], this.state.filteredQuestions[i]];
                }
            }

            resetQuizState() {
                this.state.currentQuestionIndex = 0;
                this.state.score = 0;
                this.state.userAnswers = new Array(this.state.filteredQuestions.length).fill(null);
                this.state.timeLeft = 30;
                this.state.timeTaken = 0;
                this.state.correctStreak = 0;

                // Update UI
                this.elements.scoreEl.textContent = `Score: ${this.state.score}`;
                this.elements.quizResultEl.style.display = 'none';
                document.querySelector('.quiz-question-container').style.display = 'block';

                // Start timer
                this.startTimer();
            }

            showQuestion() {
                const { currentQuestionIndex, filteredQuestions } = this.state;
                const question = filteredQuestions[currentQuestionIndex];

                if (!question) {
                    this.submitQuiz();
                    return;
                }

                // Update question counter
                this.elements.currentQuestionEl.textContent =
                    `${currentQuestionIndex + 1}/${filteredQuestions.length}`;

                // Set question text
                this.elements.questionTextEl.textContent = question.question;

                // Create options
                this.elements.optionsContainer.innerHTML = '';
                question.options.forEach((option, index) => {
                    const optionBtn = document.createElement('button');
                    optionBtn.className = 'option-btn';
                    optionBtn.textContent = option;
                    optionBtn.dataset.option = option;

                    // Add accessibility attributes
                    optionBtn.setAttribute('role', 'radio');
                    optionBtn.setAttribute('aria-checked', 'false');
                    optionBtn.setAttribute('tabindex', '0');

                    // Check if this option was previously selected
                    if (this.state.userAnswers[currentQuestionIndex] === option) {
                        optionBtn.classList.add('selected');
                        optionBtn.setAttribute('aria-checked', 'true');

                        // Show correct/wrong feedback if answer was submitted
                        if (this.state.userAnswers[currentQuestionIndex] === question.answer) {
                            optionBtn.classList.add('correct');
                        } else {
                            optionBtn.classList.add('wrong');
                        }
                    }

                    optionBtn.addEventListener('click', () => this.selectOption(option));
                    this.elements.optionsContainer.appendChild(optionBtn);
                });

                // Update navigation buttons
                this.elements.prevBtn.disabled = currentQuestionIndex === 0;
                this.elements.nextBtn.style.display =
                    currentQuestionIndex < filteredQuestions.length - 1 ? 'block' : 'none';
                this.elements.submitBtn.style.display =
                    currentQuestionIndex === filteredQuestions.length - 1 ? 'block' : 'none';

                // Reset timer for new question
                this.resetTimer();

                // Focus on first option for keyboard navigation
                const firstOption = this.elements.optionsContainer.querySelector('.option-btn');
                if (firstOption) firstOption.focus();
            }

            selectOption(selectedOption) {
                const { currentQuestionIndex, filteredQuestions } = this.state;
                const question = filteredQuestions[currentQuestionIndex];

                // Save user answer
                this.state.userAnswers[currentQuestionIndex] = selectedOption;

                // Update UI to show selected option
                const optionButtons = document.querySelectorAll('.option-btn');
                optionButtons.forEach(button => {
                    const option = button.dataset.option;
                    const isSelected = option === selectedOption;
                    const isCorrect = option === question.answer;

                    // Reset all states first
                    button.classList.remove('selected', 'correct', 'wrong');
                    button.setAttribute('aria-checked', 'false');

                    // Mark user's selection
                    if (isSelected) {
                        button.classList.add('selected');
                        button.setAttribute('aria-checked', 'true');
                    }

                    // Special handling after answer is selected
                    if (this.state.userAnswers[currentQuestionIndex] !== null) {
                        // Always show correct answer
                        if (isCorrect) {
                            button.classList.add('correct');
                        }
                        // Show wrong indication only on selected wrong answers
                        if (isSelected && !isCorrect) {
                            button.classList.add('wrong');
                        }
                    }
                });

                // Check if answer is correct
                const isCorrectAnswer = selectedOption === question.answer;
                if (isCorrectAnswer) {
                    this.state.correctStreak++;
                    this.state.score++;
                    this.updateScore();
                    this.playSound('correct');
                    this.showFeedback('Correct!', 'correct');
                } else {
                    this.state.correctStreak = 0;
                    this.playSound('wrong');
                    this.showFeedback(`Correct answer: ${question.answer}`, 'wrong');
                }

                // Automatically move to next question after delay if not last question
                if (currentQuestionIndex < filteredQuestions.length - 1) {
                    setTimeout(() => {
                        this.nextQuestion();
                    }, 1500);
                } else {
                    this.updateScore();
                }
            }
            playSound(type) {
                // Create audio context if it doesn't exist
                if (!window.audioContext) {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    window.audioContext = new AudioContext();
                }

                const oscillator = window.audioContext.createOscillator();
                const gainNode = window.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(window.audioContext.destination);

                if (type === 'correct') {
                    oscillator.frequency.value = 880; // A5 note
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(window.audioContext.currentTime + 0.2);
                } else {
                    oscillator.frequency.value = 220; // A3 note
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(window.audioContext.currentTime + 0.5);
                }
            }

            showFeedback(message, type) {
                // Remove existing feedback if any
                const existingFeedback = document.querySelector('.feedback-message');
                if (existingFeedback) existingFeedback.remove();

                const feedback = document.createElement('div');
                feedback.className = `feedback-message ${type}`;
                feedback.textContent = message;

                const questionBox = document.querySelector('.question-box');
                questionBox.appendChild(feedback);

                // Animate feedback
                feedback.style.opacity = '0';
                feedback.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    feedback.style.opacity = '1';
                    feedback.style.transform = 'translateY(0)';
                }, 10);

                // Remove feedback after delay
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    feedback.style.transform = 'translateY(-10px)';
                    setTimeout(() => feedback.remove(), 300);
                }, 2000);
            }

            startTimer() {
                clearInterval(this.state.timer);
                this.state.timeLeft = 30;
                this.updateTimerDisplay();

                this.state.timer = setInterval(() => {
                    this.state.timeLeft--;
                    this.state.timeTaken++;
                    this.updateTimerDisplay();

                    if (this.state.timeLeft <= 0) {
                        clearInterval(this.state.timer);
                        this.autoNextQuestion();
                    }
                }, 1000);
            }

            resetTimer() {
                clearInterval(this.state.timer);
                this.state.timeLeft = 30;
                this.updateTimerDisplay();
                this.startTimer();
            }

            updateTimerDisplay() {
                this.elements.timeLeftEl.textContent = `${this.state.timeLeft}s`;
                this.elements.timerProgressEl.style.width = `${(this.state.timeLeft / 30) * 100}%`;

                // Change color when time is running out
                if (this.state.timeLeft <= 10) {
                    this.elements.timerProgressEl.style.backgroundColor = 'var(--danger-color)';
                    this.elements.timerProgressEl.classList.add('pulse');
                } else {
                    this.elements.timerProgressEl.style.backgroundColor = 'var(--primary-color)';
                    this.elements.timerProgressEl.classList.remove('pulse');
                }
            }

            autoNextQuestion() {
                if (this.state.currentQuestionIndex < this.state.filteredQuestions.length - 1) {
                    this.nextQuestion();
                } else {
                    this.submitQuiz();
                }
            }

            prevQuestion() {
                if (this.state.currentQuestionIndex > 0) {
                    this.state.currentQuestionIndex--;
                    this.showQuestion();
                    this.resetTimer();
                }
            }

            nextQuestion() {
                if (this.state.currentQuestionIndex < this.state.filteredQuestions.length - 1) {
                    this.state.currentQuestionIndex++;
                    this.showQuestion();
                    this.resetTimer();
                }
            }

            updateScore() {
                this.elements.scoreEl.textContent = `Score: ${this.state.score}`;
            }

            submitQuiz() {
                clearInterval(this.state.timer);

                const totalQuestions = this.state.filteredQuestions.length;
                const correctAnswers = this.state.score;
                const wrongAnswers = totalQuestions - correctAnswers;
                const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);

                // Save high score
                this.saveHighScore(this.state.selectedCategory, percentageScore);

                // Update result display
                this.elements.totalQuestionsEl.textContent = totalQuestions;
                this.elements.correctAnswersEl.textContent = correctAnswers;
                this.elements.wrongAnswersEl.textContent = wrongAnswers;
                this.elements.finalScoreEl.textContent = percentageScore;
                this.elements.timeTakenEl.textContent = this.state.timeTaken;

                // Update badges
                this.updateBadges(percentageScore, this.state.timeTaken, this.state.correctStreak);

                // Show result section
                this.elements.quizResultEl.style.display = 'block';
                document.querySelector('.quiz-question-container').style.display = 'none';

                // Play completion sound
                this.playCompletionSound(percentageScore);
            }

            saveHighScore(category, score) {
                const highScores = JSON.parse(localStorage.getItem('quizHighScores')) || {};
                if (!highScores[category] || score > highScores[category]) {
                    highScores[category] = score;
                    localStorage.setItem('quizHighScores', JSON.stringify(highScores));

                    // Show new high score message
                    if (score > 0) {
                        this.showFeedback(`New high score for ${category}: ${score}%!`, 'success');
                    }
                }
            }

            updateBadges(score, time, streak) {
                // Score badge
                if (score >= 90) {
                    this.elements.scoreBadgeEl.innerHTML = '<i class="fas fa-trophy"></i><span>Expert</span>';
                    this.elements.scoreBadgeEl.style.color = 'var(--happy-color)';
                } else if (score >= 70) {
                    this.elements.scoreBadgeEl.innerHTML = '<i class="fas fa-medal"></i><span>Great</span>';
                    this.elements.scoreBadgeEl.style.color = 'var(--accent-color)';
                } else if (score >= 50) {
                    this.elements.scoreBadgeEl.innerHTML = '<i class="fas fa-award"></i><span>Good</span>';
                    this.elements.scoreBadgeEl.style.color = 'var(--primary-color)';
                } else {
                    this.elements.scoreBadgeEl.innerHTML = '<i class="fas fa-star"></i><span>Try Again</span>';
                    this.elements.scoreBadgeEl.style.color = 'var(--gray-color)';
                }

                // Time badge
                const avgTimePerQuestion = time / (this.state.filteredQuestions.length || 1);
                if (avgTimePerQuestion < 5) {
                    this.elements.timeBadgeEl.innerHTML = '<i class="fas fa-bolt"></i><span>Speedster</span>';
                    this.elements.timeBadgeEl.style.color = 'var(--excited-color)';
                } else if (avgTimePerQuestion < 10) {
                    this.elements.timeBadgeEl.innerHTML = '<i class="fas fa-stopwatch"></i><span>Fast</span>';
                    this.elements.timeBadgeEl.style.color = 'var(--accent-color)';
                } else {
                    this.elements.timeBadgeEl.innerHTML = '<i class="fas fa-clock"></i><span>Steady</span>';
                    this.elements.timeBadgeEl.style.color = 'var(--neutral-color)';
                }

                // Streak badge
                if (streak >= 5) {
                    this.elements.streakBadgeEl.innerHTML = '<i class="fas fa-fire"></i><span>Hot Streak</span>';
                    this.elements.streakBadgeEl.style.color = 'var(--angry-color)';
                } else if (streak >= 3) {
                    this.elements.streakBadgeEl.innerHTML = '<i class="fas fa-bolt"></i><span>Streak</span>';
                    this.elements.streakBadgeEl.style.color = 'var(--happy-color)';
                } else {
                    this.elements.streakBadgeEl.innerHTML = '<i class="fas fa-flag"></i><span>Beginner</span>';
                    this.elements.streakBadgeEl.style.color = 'var(--neutral-color)';
                }
            }

            playCompletionSound(score) {
                if (!window.audioContext) {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    window.audioContext = new AudioContext();
                }

                const oscillator = window.audioContext.createOscillator();
                const gainNode = window.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(window.audioContext.destination);

                // Play different tone based on score
                if (score >= 80) {
                    // Victory fanfare
                    oscillator.frequency.setValueAtTime(440, window.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(554.37, window.audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(659.25, window.audioContext.currentTime + 0.2);
                    oscillator.frequency.setValueAtTime(880, window.audioContext.currentTime + 0.3);
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(window.audioContext.currentTime + 0.5);
                } else if (score >= 50) {
                    // Medium tone
                    oscillator.frequency.value = 440;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(window.audioContext.currentTime + 0.3);
                } else {
                    // Low tone
                    oscillator.frequency.value = 220;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    oscillator.stop(window.audioContext.currentTime + 0.5);
                }
            }

            restartQuiz() {
                // Restart with same questions
                this.resetQuizState();
                this.showQuestion();
            }

            newQuiz() {
                // Start fresh with new questions
                this.startQuiz();
            }
        }

        // Initialize quiz when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new QuizGame();
        });
