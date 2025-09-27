// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize data in localStorage if it doesn't exist
  initializeLocalStorage()

  // Set up event listeners
  setupEventListeners()

  // Check if user is logged in
  checkAuthStatus()

  // Load quizzes on the explore page
  loadQuizzes()

  // Load leaderboard data
  loadLeaderboard()
})

// Initialize localStorage with default data if it doesn't exist
function initializeLocalStorage() {
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]))
  }

  if (!localStorage.getItem("quizzes")) {
    localStorage.setItem(
      "quizzes",
      JSON.stringify([
        {
          id: "quiz1",
          title: "General Knowledge Quiz",
          description: "Test your knowledge on various topics",
          category: "general",
          author: "admin",
          questions: [
            {
              text: "What is the capital of France?",
              options: ["London", "Paris", "Berlin", "Madrid"],
              correctOption: 1,
            },
            {
              text: "Which planet is known as the Red Planet?",
              options: ["Earth", "Mars", "Jupiter", "Venus"],
              correctOption: 1,
            },
            {
              text: "Who painted the Mona Lisa?",
              options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
              correctOption: 1,
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "quiz2",
          title: "Science Quiz",
          description: "Test your knowledge of basic science concepts",
          category: "science",
          author: "admin",
          questions: [
            {
              text: "What is the chemical symbol for water?",
              options: ["WA", "H2O", "W", "HO"],
              correctOption: 1,
            },
            {
              text: "What is the largest organ in the human body?",
              options: ["Heart", "Liver", "Skin", "Brain"],
              correctOption: 2,
            },
            {
              text: "What is the hardest natural substance on Earth?",
              options: ["Gold", "Iron", "Diamond", "Platinum"],
              correctOption: 2,
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ]),
    )
  }

  if (!localStorage.getItem("attempts")) {
    localStorage.setItem("attempts", JSON.stringify([]))
  }

  if (!localStorage.getItem("currentUser")) {
    localStorage.setItem("currentUser", JSON.stringify(null))
  }
}

// Set up all event listeners for the application
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const page = e.target.getAttribute("data-page")
      navigateTo(page)
    })
  })

  // Auth buttons
  document.getElementById("login-btn").addEventListener("click", () => {
    openAuthModal("login")
  })

  document.getElementById("register-btn").addEventListener("click", () => {
    openAuthModal("register")
  })

  document.getElementById("logout-btn").addEventListener("click", () => {
    logout()
  })

  // Auth modal
  document.querySelector(".close-modal").addEventListener("click", () => {
    closeAuthModal()
  })

  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab")
      switchAuthTab(tabName)
    })
  })

  // Auth forms
  document.getElementById("login-form-element").addEventListener("submit", (e) => {
    e.preventDefault()
    handleLogin()
  })

  document.getElementById("register-form-element").addEventListener("submit", (e) => {
    e.preventDefault()
    handleRegister()
  })

  // Home page buttons
  document.getElementById("explore-btn").addEventListener("click", () => {
    navigateTo("explore")
  })

  document.getElementById("create-btn").addEventListener("click", () => {
    if (isLoggedIn()) {
      navigateTo("create-quiz")
    } else {
      openAuthModal("login")
    }
  })

  // Dashboard
  document.getElementById("create-quiz-btn").addEventListener("click", () => {
    navigateTo("create-quiz")
  })

  // Create quiz
  document.getElementById("add-question-btn").addEventListener("click", () => {
    addQuestionForm()
  })

  document.getElementById("cancel-quiz-btn").addEventListener("click", () => {
    navigateTo("dashboard")
  })

  document.getElementById("create-quiz-form").addEventListener("submit", (e) => {
    e.preventDefault()
    saveQuiz()
  })

  // Quiz taking
  document.getElementById("prev-question").addEventListener("click", () => {
    navigateQuizQuestion(-1)
  })

  document.getElementById("next-question").addEventListener("click", () => {
    navigateQuizQuestion(1)
  })

  document.getElementById("submit-quiz").addEventListener("click", () => {
    submitQuiz()
  })

  // Quiz results
  document.getElementById("view-answers-btn").addEventListener("click", () => {
    toggleResultsDetails()
  })

  document.getElementById("retake-quiz-btn").addEventListener("click", () => {
    retakeQuiz()
  })

  document.getElementById("back-to-explore-btn").addEventListener("click", () => {
    navigateTo("explore")
  })

  // Quiz analytics
  document.getElementById("back-to-dashboard-btn").addEventListener("click", () => {
    navigateTo("dashboard")
  })

  document.getElementById("edit-quiz-btn").addEventListener("click", () => {
    editQuiz()
  })

  document.getElementById("delete-quiz-btn").addEventListener("click", () => {
    deleteQuiz()
  })

  // Search
  document.getElementById("search-quiz").addEventListener("input", (e) => {
    searchQuizzes(e.target.value)
  })

  // Leaderboard filter
  document.getElementById("leaderboard-quiz-select").addEventListener("change", (e) => {
    filterLeaderboard(e.target.value)
  })
}

// Navigation Functions
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active")
  })

  // Show the selected page
  document.getElementById(page).classList.add("active")

  // Special handling for certain pages
  if (page === "dashboard" && isLoggedIn()) {
    loadDashboard()
  } else if (page === "create-quiz") {
    initCreateQuizPage()
  }
}

// Authentication Functions
function openAuthModal(tab) {
  const modal = document.getElementById("auth-modal")
  modal.classList.add("active")
  switchAuthTab(tab)
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal")
  modal.classList.remove("active")
}

function switchAuthTab(tab) {
  // Update tab buttons
  document.querySelectorAll(".auth-tab").forEach((t) => {
    t.classList.remove("active")
  })
  document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add("active")

  // Update form visibility
  document.querySelectorAll(".auth-form").forEach((f) => {
    f.classList.remove("active")
  })
  document.getElementById(`${tab}-form`).classList.add("active")
}

function handleLogin() {
  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value

  const users = JSON.parse(localStorage.getItem("users"))
  const user = users.find((u) => u.username === username && u.password === password)

  if (user) {
    // Store current user in localStorage (excluding password)
    const { password, ...userWithoutPassword } = user
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

    // Update UI
    updateAuthUI()
    closeAuthModal()

    // Navigate to dashboard
    navigateTo("dashboard")
  } else {
    alert("Invalid username or password")
  }
}

function handleRegister() {
  const username = document.getElementById("register-username").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm-password").value

  // Validate input
  if (password !== confirmPassword) {
    alert("Passwords do not match")
    return
  }

  const users = JSON.parse(localStorage.getItem("users"))

  // Check if username already exists
  if (users.some((u) => u.username === username)) {
    alert("Username already exists")
    return
  }

  // Add new user
  const newUser = {
    id: generateId(),
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))

  // Auto login
  const { password: pwd, ...userWithoutPassword } = newUser
  localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

  // Update UI
  updateAuthUI()
  closeAuthModal()

  // Navigate to dashboard
  navigateTo("dashboard")
}

function logout() {
  localStorage.setItem("currentUser", JSON.stringify(null))
  updateAuthUI()
  navigateTo("home")
}

function isLoggedIn() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  return currentUser !== null
}

function checkAuthStatus() {
  updateAuthUI()
}

function updateAuthUI() {
  const isUserLoggedIn = isLoggedIn()

  // Update auth buttons
  document.getElementById("login-btn").classList.toggle("hidden", isUserLoggedIn)
  document.getElementById("register-btn").classList.toggle("hidden", isUserLoggedIn)
  document.getElementById("logout-btn").classList.toggle("hidden", !isUserLoggedIn)

  // Update dashboard link
  document.getElementById("dashboard-link").classList.toggle("hidden", !isUserLoggedIn)
}

// Quiz Functions
function loadQuizzes() {
  const quizzesContainer = document.getElementById("quizzes-container")
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))

  quizzesContainer.innerHTML = ""

  quizzes.forEach((quiz) => {
    const quizCard = document.createElement("div")
    quizCard.className = "quiz-card"
    quizCard.innerHTML = `
      <div class="quiz-card-content">
        <h3>${quiz.title}</h3>
        <div class="quiz-meta">
          <span>${quiz.category}</span>
          <span>${quiz.questions.length} questions</span>
        </div>
        <p>${quiz.description}</p>
        <div class="quiz-actions">
          <button class="btn btn-primary take-quiz-btn" data-id="${quiz.id}">Take Quiz</button>
          <span>by ${quiz.author}</span>
        </div>
      </div>
    `

    quizzesContainer.appendChild(quizCard)

    // Add event listener to the take quiz button
    quizCard.querySelector(".take-quiz-btn").addEventListener("click", () => {
      startQuiz(quiz.id)
    })
  })
}

function searchQuizzes(query) {
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(query.toLowerCase()) ||
      quiz.description.toLowerCase().includes(query.toLowerCase()) ||
      quiz.category.toLowerCase().includes(query.toLowerCase()),
  )

  const quizzesContainer = document.getElementById("quizzes-container")
  quizzesContainer.innerHTML = ""

  if (filteredQuizzes.length === 0) {
    quizzesContainer.innerHTML = "<p>No quizzes found matching your search.</p>"
    return
  }

  filteredQuizzes.forEach((quiz) => {
    const quizCard = document.createElement("div")
    quizCard.className = "quiz-card"
    quizCard.innerHTML = `
      <div class="quiz-card-content">
        <h3>${quiz.title}</h3>
        <div class="quiz-meta">
          <span>${quiz.category}</span>
          <span>${quiz.questions.length} questions</span>
        </div>
        <p>${quiz.description}</p>
        <div class="quiz-actions">
          <button class="btn btn-primary take-quiz-btn" data-id="${quiz.id}">Take Quiz</button>
          <span>by ${quiz.author}</span>
        </div>
      </div>
    `

    quizzesContainer.appendChild(quizCard)

    // Add event listener to the take quiz button
    quizCard.querySelector(".take-quiz-btn").addEventListener("click", () => {
      startQuiz(quiz.id)
    })
  })
}

// Dashboard Functions
function loadDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const attempts = JSON.parse(localStorage.getItem("attempts"))

  // Filter user's quizzes
  const userQuizzes = quizzes.filter((quiz) => quiz.author === currentUser.username)

  // Calculate stats
  document.getElementById("total-quizzes").textContent = userQuizzes.length

  const userAttempts = attempts.filter((attempt) => userQuizzes.some((quiz) => quiz.id === attempt.quizId))
  document.getElementById("total-attempts").textContent = userAttempts.length

  if (userAttempts.length > 0) {
    const totalScore = userAttempts.reduce((sum, attempt) => sum + attempt.percentageScore, 0)
    const averageScore = totalScore / userAttempts.length
    document.getElementById("average-score").textContent = `${averageScore.toFixed(1)}%`
  } else {
    document.getElementById("average-score").textContent = "N/A"
  }

  // Load user's quizzes
  const myQuizzesContainer = document.getElementById("my-quizzes-container")
  myQuizzesContainer.innerHTML = ""

  if (userQuizzes.length === 0) {
    myQuizzesContainer.innerHTML = "<p>You haven't created any quizzes yet.</p>"
    return
  }

  userQuizzes.forEach((quiz) => {
    const quizCard = document.createElement("div")
    quizCard.className = "quiz-card"
    quizCard.innerHTML = `
      <div class="quiz-card-content">
        <h3>${quiz.title}</h3>
        <div class="quiz-meta">
          <span>${quiz.category}</span>
          <span>${quiz.questions.length} questions</span>
        </div>
        <p>${quiz.description}</p>
        <div class="quiz-actions">
          <button class="btn btn-outline view-analytics-btn" data-id="${quiz.id}">Analytics</button>
          <button class="btn btn-primary edit-quiz-btn" data-id="${quiz.id}">Edit</button>
        </div>
      </div>
    `

    myQuizzesContainer.appendChild(quizCard)

    // Add event listeners
    quizCard.querySelector(".view-analytics-btn").addEventListener("click", () => {
      viewQuizAnalytics(quiz.id)
    })

    quizCard.querySelector(".edit-quiz-btn").addEventListener("click", () => {
      editQuiz(quiz.id)
    })
  })
}

// Create Quiz Functions
function initCreateQuizPage() {
  // Clear form
  document.getElementById("quiz-title-input").value = ""
  document.getElementById("quiz-description-input").value = ""
  document.getElementById("quiz-category-input").value = ""

  // Clear questions
  document.getElementById("questions-container").innerHTML = ""

  // Add first question
  addQuestionForm()
}

function addQuestionForm() {
  const questionsContainer = document.getElementById("questions-container")
  const questionCount = questionsContainer.children.length + 1

  // Clone the template
  const template = document.getElementById("question-template")
  const questionItem = template.content.cloneNode(true)

  // Update question number
  questionItem.querySelector(".question-number").textContent = questionCount

  // Update radio button names to be unique
  const radioButtons = questionItem.querySelectorAll(".correct-option")
  radioButtons.forEach((radio) => {
    radio.name = `correct-option-${questionCount}`
  })

  // Add event listener to remove button
  const removeBtn = questionItem.querySelector(".remove-question-btn")
  removeBtn.addEventListener("click", (e) => {
    e.target.closest(".question-item").remove()
    // Update question numbers
    updateQuestionNumbers()
  })

  // Add event listener to add option button
  const addOptionBtn = questionItem.querySelector(".add-option-btn")
  addOptionBtn.addEventListener("click", (e) => {
    const optionsContainer = e.target.previousElementSibling
    const optionCount = optionsContainer.children.length

    if (optionCount >= 6) {
      alert("Maximum 6 options allowed per question")
      return
    }

    const newOption = document.createElement("div")
    newOption.className = "option-item"
    newOption.innerHTML = `
      <input type="radio" name="correct-option-${questionCount}" class="correct-option" value="${optionCount}" required>
      <input type="text" class="option-text" placeholder="Option ${optionCount + 1}" required>
    `

    optionsContainer.appendChild(newOption)
  })

  questionsContainer.appendChild(questionItem)
}

function updateQuestionNumbers() {
  const questionItems = document.querySelectorAll(".question-item")
  questionItems.forEach((item, index) => {
    item.querySelector(".question-number").textContent = index + 1

    // Update radio button names
    const radioButtons = item.querySelectorAll(".correct-option")
    radioButtons.forEach((radio) => {
      radio.name = `correct-option-${index + 1}`
    })
  })
}

function saveQuiz() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Get quiz details
  const title = document.getElementById("quiz-title-input").value
  const description = document.getElementById("quiz-description-input").value
  const category = document.getElementById("quiz-category-input").value

  // Get questions
  const questionItems = document.querySelectorAll(".question-item")
  const questions = []

  questionItems.forEach((item) => {
    const questionText = item.querySelector(".question-text").value
    const options = []
    const optionInputs = item.querySelectorAll(".option-text")

    optionInputs.forEach((input) => {
      options.push(input.value)
    })

    const correctOption = Number.parseInt(item.querySelector(".correct-option:checked").value)

    questions.push({
      text: questionText,
      options,
      correctOption,
    })
  })

  // Validate
  if (questions.length === 0) {
    alert("Please add at least one question")
    return
  }

  // Create quiz object
  const quiz = {
    id: generateId(),
    title,
    description,
    category,
    author: currentUser.username,
    questions,
    createdAt: new Date().toISOString(),
  }

  // Save to localStorage
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  quizzes.push(quiz)
  localStorage.setItem("quizzes", JSON.stringify(quizzes))

  // Navigate to dashboard
  alert("Quiz created successfully!")
  navigateTo("dashboard")
}

// Take Quiz Functions
let currentQuiz = null
let currentQuestionIndex = 0
let userAnswers = []
let quizStartTime = null

function startQuiz(quizId) {
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  currentQuiz = quizzes.find((quiz) => quiz.id === quizId)

  if (!currentQuiz) {
    alert("Quiz not found")
    return
  }

  // Reset quiz state
  currentQuestionIndex = 0
  userAnswers = Array(currentQuiz.questions.length).fill(null)
  quizStartTime = new Date()

  // Update UI
  document.getElementById("quiz-title").textContent = currentQuiz.title
  document.getElementById("quiz-description").textContent = currentQuiz.description
  document.getElementById("quiz-question-count").textContent = `${currentQuiz.questions.length} questions`
  document.getElementById("quiz-author").textContent = `by ${currentQuiz.author}`

  // Load first question
  loadQuestion(0)

  // Navigate to take quiz page
  navigateTo("take-quiz")
}

function loadQuestion(index) {
  const question = currentQuiz.questions[index]

  // Update question text
  document.getElementById("question-text").textContent = question.text

  // Update progress
  document.getElementById("quiz-progress").style.width = `${((index + 1) / currentQuiz.questions.length) * 100}%`
  document.getElementById("quiz-progress-text").textContent = `Question ${index + 1} of ${currentQuiz.questions.length}`

  // Update options
  const optionsContainer = document.getElementById("options-container")
  optionsContainer.innerHTML = ""

  question.options.forEach((option, optionIndex) => {
    const optionElement = document.createElement("div")
    optionElement.className = "option-item"
    if (userAnswers[index] === optionIndex) {
      optionElement.classList.add("selected")
    }
    optionElement.textContent = option
    optionElement.addEventListener("click", () => {
      // Remove selected class from all options
      optionsContainer.querySelectorAll(".option-item").forEach((item) => {
        item.classList.remove("selected")
      })

      // Add selected class to clicked option
      optionElement.classList.add("selected")

      // Save user's answer
      userAnswers[index] = optionIndex
    })

    optionsContainer.appendChild(optionElement)
  })

  // Update navigation buttons
  document.getElementById("prev-question").disabled = index === 0
  document.getElementById("next-question").classList.toggle("hidden", index === currentQuiz.questions.length - 1)
  document.getElementById("submit-quiz").classList.toggle("hidden", index !== currentQuiz.questions.length - 1)
}

function navigateQuizQuestion(direction) {
  currentQuestionIndex += direction

  if (currentQuestionIndex < 0) {
    currentQuestionIndex = 0
  } else if (currentQuestionIndex >= currentQuiz.questions.length) {
    currentQuestionIndex = currentQuiz.questions.length - 1
  }

  loadQuestion(currentQuestionIndex)
}

function submitQuiz() {
  // Check if all questions are answered
  const unansweredQuestions = userAnswers.findIndex((answer) => answer === null)

  if (unansweredQuestions !== -1) {
    if (
      !confirm(
        `You have ${userAnswers.filter((a) => a === null).length} unanswered questions. Do you want to submit anyway?`,
      )
    ) {
      // Navigate to the first unanswered question
      currentQuestionIndex = unansweredQuestions
      loadQuestion(currentQuestionIndex)
      return
    }
  }

  // Calculate score
  let correctAnswers = 0
  currentQuiz.questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctOption) {
      correctAnswers++
    }
  })

  const score = correctAnswers
  const totalQuestions = currentQuiz.questions.length
  const percentageScore = Math.round((score / totalQuestions) * 100)

  // Calculate time taken
  const quizEndTime = new Date()
  const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000) // in seconds
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`

  // Save attempt
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const username = currentUser ? currentUser.username : "Guest"

  const attempt = {
    id: generateId(),
    quizId: currentQuiz.id,
    username,
    score,
    totalQuestions,
    percentageScore,
    timeTaken,
    answers: [...userAnswers],
    date: new Date().toISOString(),
  }

  const attempts = JSON.parse(localStorage.getItem("attempts"))
  attempts.push(attempt)
  localStorage.setItem("attempts", JSON.stringify(attempts))

  // Update results page
  document.getElementById("result-score").textContent = `${score}/${totalQuestions}`
  document.getElementById("result-percentage").textContent = `${percentageScore}%`
  document.getElementById("result-time").textContent = timeString

  // Navigate to results page
  navigateTo("quiz-results")

  // Load question review
  loadQuestionReview()
}

function loadQuestionReview() {
  const reviewContainer = document.getElementById("questions-review-container")
  reviewContainer.innerHTML = ""

  currentQuiz.questions.forEach((question, index) => {
    const reviewItem = document.createElement("div")
    reviewItem.className = "question-review"

    const isCorrect = userAnswers[index] === question.correctOption

    reviewItem.innerHTML = `
      <h4>Question ${index + 1}: ${isCorrect ? "✅" : "❌"}</h4>
      <p>${question.text}</p>
      <div class="review-options">
        ${question.options
          .map((option, optionIndex) => {
            let className = "review-option"
            if (optionIndex === question.correctOption) {
              className += " correct"
            } else if (optionIndex === userAnswers[index] && userAnswers[index] !== question.correctOption) {
              className += " incorrect"
            }

            if (optionIndex === userAnswers[index]) {
              className += " selected"
            }

            return `<div class="${className}">${option}</div>`
          })
          .join("")}
      </div>
    `

    reviewContainer.appendChild(reviewItem)
  })
}

function toggleResultsDetails() {
  const resultsDetails = document.getElementById("results-details")
  resultsDetails.classList.toggle("hidden")

  const viewAnswersBtn = document.getElementById("view-answers-btn")
  if (resultsDetails.classList.contains("hidden")) {
    viewAnswersBtn.textContent = "View Answers"
  } else {
    viewAnswersBtn.textContent = "Hide Answers"
  }
}

function retakeQuiz() {
  startQuiz(currentQuiz.id)
}

// Leaderboard Functions
function loadLeaderboard() {
  const attempts = JSON.parse(localStorage.getItem("attempts"))
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))

  // Sort attempts by score (highest first)
  const sortedAttempts = [...attempts].sort((a, b) => {
    if (b.percentageScore !== a.percentageScore) {
      return b.percentageScore - a.percentageScore
    }
    // If scores are equal, sort by time (fastest first)
    return a.timeTaken - b.timeTaken
  })

  // Populate quiz select
  const quizSelect = document.getElementById("leaderboard-quiz-select")
  quizSelect.innerHTML = '<option value="all">All Quizzes</option>'

  quizzes.forEach((quiz) => {
    const option = document.createElement("option")
    option.value = quiz.id
    option.textContent = quiz.title
    quizSelect.appendChild(option)
  })

  // Display leaderboard
  displayLeaderboard(sortedAttempts)
}

function displayLeaderboard(attempts) {
  const leaderboardBody = document.getElementById("leaderboard-body")
  leaderboardBody.innerHTML = ""

  if (attempts.length === 0) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">No attempts recorded yet</td></tr>'
    return
  }

  const quizzes = JSON.parse(localStorage.getItem("quizzes"))

  attempts.forEach((attempt, index) => {
    const quiz = quizzes.find((q) => q.id === attempt.quizId)
    if (!quiz) return

    const row = document.createElement("tr")

    // Format date
    const date = new Date(attempt.date)
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${attempt.username}</td>
      <td>${quiz.title}</td>
      <td>${attempt.percentageScore}% (${attempt.score}/${attempt.totalQuestions})</td>
      <td>${formattedDate}</td>
    `

    leaderboardBody.appendChild(row)
  })
}

function filterLeaderboard(quizId) {
  const attempts = JSON.parse(localStorage.getItem("attempts"))

  let filteredAttempts
  if (quizId === "all") {
    filteredAttempts = attempts
  } else {
    filteredAttempts = attempts.filter((attempt) => attempt.quizId === quizId)
  }

  // Sort attempts
  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    if (b.percentageScore !== a.percentageScore) {
      return b.percentageScore - a.percentageScore
    }
    return a.timeTaken - b.timeTaken
  })

  displayLeaderboard(sortedAttempts)
}

// Quiz Analytics Functions
function viewQuizAnalytics(quizId) {
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const quiz = quizzes.find((q) => q.id === quizId)

  if (!quiz) {
    alert("Quiz not found")
    return
  }

  const attempts = JSON.parse(localStorage.getItem("attempts"))
  const quizAttempts = attempts.filter((a) => a.quizId === quizId)

  // Update analytics header
  document.getElementById("analytics-title").textContent = `Analytics: ${quiz.title}`

  // Update analytics summary
  document.getElementById("analytics-attempts").textContent = quizAttempts.length

  if (quizAttempts.length > 0) {
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.percentageScore, 0)
    const averageScore = totalScore / quizAttempts.length
    document.getElementById("analytics-avg-score").textContent = `${averageScore.toFixed(1)}%`

    // Calculate completion rate (non-null answers / total questions)
    const totalAnswers = quizAttempts.reduce((sum, attempt) => {
      return sum + attempt.answers.filter((a) => a !== null).length
    }, 0)
    const totalPossibleAnswers = quizAttempts.length * quiz.questions.length
    const completionRate = (totalAnswers / totalPossibleAnswers) * 100
    document.getElementById("analytics-completion").textContent = `${completionRate.toFixed(1)}%`
  } else {
    document.getElementById("analytics-avg-score").textContent = "N/A"
    document.getElementById("analytics-completion").textContent = "N/A"
  }

  // Load question performance
  const performanceContainer = document.getElementById("question-performance-container")
  performanceContainer.innerHTML = ""

  quiz.questions.forEach((question, index) => {
    const questionItem = document.createElement("div")
    questionItem.className = "question-performance"

    // Calculate correct answer rate for this question
    let correctCount = 0
    let attemptCount = 0

    quizAttempts.forEach((attempt) => {
      if (attempt.answers[index] !== null) {
        attemptCount++
        if (attempt.answers[index] === question.correctOption) {
          correctCount++
        }
      }
    })

    const correctRate = attemptCount > 0 ? (correctCount / attemptCount) * 100 : 0

    questionItem.innerHTML = `
      <h4>Question ${index + 1}</h4>
      <p>${question.text}</p>
      <p>Correct answer: ${question.options[question.correctOption]}</p>
      <p>Correct answer rate: ${correctRate.toFixed(1)}% (${correctCount}/${attemptCount})</p>
      <div class="performance-bar">
        <div class="performance-fill" style="width: ${correctRate}%"></div>
      </div>
    `

    performanceContainer.appendChild(questionItem)
  })

  // Set up edit and delete buttons
  document.getElementById("edit-quiz-btn").setAttribute("data-id", quizId)
  document.getElementById("delete-quiz-btn").setAttribute("data-id", quizId)

  // Add event listeners
  document.getElementById("edit-quiz-btn").onclick = () => editQuiz(quizId)
  document.getElementById("delete-quiz-btn").onclick = () => deleteQuiz(quizId)

  // Navigate to analytics page
  navigateTo("quiz-analytics")
}

function editQuiz(quizId) {
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const quiz = quizzes.find((q) => q.id === quizId)

  if (!quiz) {
    alert("Quiz not found")
    return
  }

  // Populate form
  document.getElementById("quiz-title-input").value = quiz.title
  document.getElementById("quiz-description-input").value = quiz.description
  document.getElementById("quiz-category-input").value = quiz.category

  // Clear questions
  document.getElementById("questions-container").innerHTML = ""

  // Add questions
  quiz.questions.forEach((question) => {
    addQuestionForm()

    const questionItems = document.querySelectorAll(".question-item")
    const lastQuestion = questionItems[questionItems.length - 1]

    lastQuestion.querySelector(".question-text").value = question.text

    // Add options
    const optionsContainer = lastQuestion.querySelector(".options-container")
    optionsContainer.innerHTML = ""

    question.options.forEach((option, index) => {
      const optionItem = document.createElement("div")
      optionItem.className = "option-item"
      optionItem.innerHTML = `
        <input type="radio" name="correct-option-${questionItems.length}" class="correct-option" value="${index}" ${index === question.correctOption ? "checked" : ""} required>
        <input type="text" class="option-text" placeholder="Option ${index + 1}" value="${option}" required>
      `

      optionsContainer.appendChild(optionItem)
    })
  })

  // Change form submission to update instead of create
  const saveBtn = document.getElementById("save-quiz-btn")
  saveBtn.textContent = "Update Quiz"
  saveBtn.onclick = (e) => {
    e.preventDefault()
    updateQuiz(quizId)
  }

  // Navigate to create quiz page
  navigateTo("create-quiz")
}

function updateQuiz(quizId) {
  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const quizIndex = quizzes.findIndex((q) => q.id === quizId)

  if (quizIndex === -1) {
    alert("Quiz not found")
    return
  }

  // Get quiz details
  const title = document.getElementById("quiz-title-input").value
  const description = document.getElementById("quiz-description-input").value
  const category = document.getElementById("quiz-category-input").value

  // Get questions
  const questionItems = document.querySelectorAll(".question-item")
  const questions = []

  questionItems.forEach((item) => {
    const questionText = item.querySelector(".question-text").value
    const options = []
    const optionInputs = item.querySelectorAll(".option-text")

    optionInputs.forEach((input) => {
      options.push(input.value)
    })

    const correctOption = Number.parseInt(item.querySelector(".correct-option:checked").value)

    questions.push({
      text: questionText,
      options,
      correctOption,
    })
  })

  // Validate
  if (questions.length === 0) {
    alert("Please add at least one question")
    return
  }

  // Update quiz
  quizzes[quizIndex] = {
    ...quizzes[quizIndex],
    title,
    description,
    category,
    questions,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem("quizzes", JSON.stringify(quizzes))

  // Reset form submission
  const saveBtn = document.getElementById("save-quiz-btn")
  saveBtn.textContent = "Save Quiz"
  saveBtn.onclick = null

  // Navigate to dashboard
  alert("Quiz updated successfully!")
  navigateTo("dashboard")
}

function deleteQuiz(quizId) {
  if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
    return
  }

  const quizzes = JSON.parse(localStorage.getItem("quizzes"))
  const updatedQuizzes = quizzes.filter((q) => q.id !== quizId)

  localStorage.setItem("quizzes", JSON.stringify(updatedQuizzes))

  // Delete related attempts
  const attempts = JSON.parse(localStorage.getItem("attempts"))
  const updatedAttempts = attempts.filter((a) => a.quizId !== quizId)

  localStorage.setItem("attempts", JSON.stringify(updatedAttempts))

  // Navigate to dashboard
  alert("Quiz deleted successfully!")
  navigateTo("dashboard")
}

// Utility Functions
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

