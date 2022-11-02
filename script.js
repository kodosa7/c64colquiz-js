// C64ColQuiz
// by ELS 2022

// set up elements
const wantedColor = document.getElementById('wanted-color')
const leftArea = document.getElementById('left-area')
const rightArea = document.getElementById('right-area')
const homeScreen = document.getElementById('home-screen')
const gameScreen = document.getElementById('game-screen')
const startTrigger = document.getElementById('start-trigger')
const soundBtn = document.getElementById('sound-button')
const paletteBtn = document.getElementById('palette-button')
const helpBtn = document.getElementById('help-button')
const gameOverX = document.getElementById('game-over-x')
const inGameScoreCounter = document.getElementById('middle-score-counter')
const menuScoreBarLeft = document.getElementById('top-score-bar-left')
const menuScoreBarRight = document.getElementById('top-score-bar-right')
const audioSfxGood = document.getElementById('audio-sfx-good')
const audioSfxFail = document.getElementById('audio-sfx-fail')
const paletteSelector = document.getElementById('palette-selector')
const helpText = document.getElementById('help-text')

// when music ends, play it again
var myAudio = new Audio('sfx/music.mp3')
myAudio.addEventListener('ended', function() {
    this.currentTime = 0
    this.play()
}, false)

// define global variables
let isMusic = false
let isHelpBar = false
let isVicePalette = false
let currentColors = []
let score = [0]
let hiScore = [0]
let readyToClick = false
let intervalForGameOver
let intervalForCountDown
let leftAreaClick
let rightAreaClick
let gameLoop = false
let delay = 100

// initialize on the first run
function init() {
    console.log("init()")
    leftArea.style.display = 'none'
    rightArea.style.display = 'none'
    gameScreen.style.display = 'none'
    gameOverX.style.display = 'none'
    homeScreen.style.display = ''
    paletteSelector.innerHTML = `<link rel="stylesheet" href="palette1.css" id="palette-selector">`
    // helpBar.innerHTML = helpBarInitText
}

init()

// listen for document events
document.addEventListener('click', function(e) {
    // listen for 'start game' button
    if (e.target.dataset.start) {
        handleStartTrigger(e.target.dataset.start)
    }
    
    // listen for music button
    if (e.target.dataset.sound) {
        if (!isMusic) {
            isMusic = true
            soundBtn.style.backgroundImage = "url('img/note-disabled.png')"
            soundBtn.style.backgroundColor = `var(--c02)`
            soundBtn.style.animation = "soundbtn 250ms infinite"
            handleSoundBtn(e.target.dataset.sound)
        } else {
            isMusic = false
            soundBtn.style.backgroundImage = "url('img/note.png')"
            soundBtn.style.backgroundColor = `var(--c0d)`
            soundBtn.style.animation = "none"
            myAudio.pause()
        }
    }
    
    // listen for palette button
    if (e.target.dataset.palette) {
        if (!isVicePalette) {
            isVicePalette = true
            paletteBtn.style.backgroundColor = `var(--c08)`
            paletteSelector.innerHTML = `<link rel="stylesheet" href="palette2.css" id="palette-selector">`
        } else {
            isVicePalette = false
            paletteBtn.style.backgroundColor = `var(--c03)`
            paletteSelector.innerHTML = `<link rel="stylesheet" href="palette1.css" id="palette-selector">`
        }
        showHomeScreen()
    }

    // listen for help bar
    if (e.target.dataset.help) {
        if (!isHelpBar) {
            isHelpBar = true
            helpText.style.display = ''
            helpBtn.style.backgroundColor = `var(--c05)`

        } else {
            isHelpBar = false
            helpText.style.display = 'none'
            helpBtn.style.backgroundColor = `var(--c0f)`
        }
    }

})
    
// handle clicks on the left area
function initLeftArea() {
    leftAreaClick = function() {
        console.log("left area clicked")
        if (currentColors[1] === currentColors[2]) {
            score[0] += 1
            if (score <= 30) {
                delay -= 2  // timer decreasing speed
            }
            audioSfxGood.play()
            inGameScoreCounter.innerHTML = `${zeroizeNumber(score[0])}`
            readyToClick = false
            gameLoop = true
            resetCountdown()
            removeClickableAreas()
            game()
        } else {
            readyToClick = false
            resetCountdown()
            removeClickableAreas()
            showGameOver()
        }
    }
    leftArea.addEventListener('click', leftAreaClick)
}

// handle clicks on the right area
function initRightArea() {
    rightAreaClick = function() {
        if (currentColors[1] === currentColors[3]) {
            score[0] += 1
            if (score <= 30) {
                delay -= 2  // timer decreasing speed
            }
            audioSfxGood.play()
            inGameScoreCounter.innerHTML = `${zeroizeNumber(score[0])}`
            readyToClick = false
            gameLoop = true
            resetCountdown()
            removeClickableAreas()
            game()
        } else {
            readyToClick = false
            resetCountdown()
            removeClickableAreas()
            showGameOver()
        }
    }
    rightArea.addEventListener('click', rightAreaClick)
}

// custom score number format (########)
function zeroizeNumber(num) {
    let zeroedScore = num.toString()
    while (zeroedScore.length < 8)
    zeroedScore = "0" + zeroedScore
    return zeroedScore
}

// generate a random color
function renderNewColor() {
    const leftRightRandomizer = Math.floor(Math.random() * 2)
    let randomColorLeft = Math.floor(Math.random() * 16).toString(16)
    let randomColorRight = Math.floor(Math.random() * 16).toString(16)
    currentColors = []

    // if both colors are the same, generate them again
    if (randomColorLeft === randomColorRight) {
        randomColorLeft = Math.floor(Math.random() * 16).toString(16)
        randomColorRight = Math.floor(Math.random() * 16).toString(16)
    }
    
    // swap color sides randomly
    // and set color and render wanted color number
    if (leftRightRandomizer === 0) {
        // push description and correct color to the array
        currentColors.push('left')
        currentColors.push(randomColorRight)

        wantedColor.innerHTML = `${randomColorRight.toUpperCase()}`
        leftArea.style.background = `var(--c0${randomColorRight})`
        rightArea.style.background = `var(--c0${randomColorLeft})`
        
    } else {
        // push description and correct color to the array
        currentColors.push('right')
        currentColors.push(randomColorLeft)

        wantedColor.innerHTML = `${randomColorLeft.toUpperCase()}`
        rightArea.style.background = `var(--c0${randomColorLeft})`
        leftArea.style.background = `var(--c0${randomColorRight})`
    }

    // push left & right colors into the array
    currentColors.push(randomColorRight)
    currentColors.push(randomColorLeft)
}    

// set time interval for in-game cuntdown
function countdown() {
    readyToClick = true
    const middleTimeBar = document.getElementById('middle-time-bar')
    // increase border value to mimic time bar decrease
    if (!intervalForCountDown) {
        readyToClick = true
        let cnt = 0
        intervalForCountDown = setInterval(function() {
            cnt++
            middleTimeBar.style.borderLeft = `${cnt * 2.93}px solid black`
            middleTimeBar.style.borderRight = `${cnt * 2.93}px solid black`
            if (cnt > 32) {
                resetCountdown()
                removeClickableAreas()
                readyToClick = false
                intervalForCountDown = false
                showGameOver()
                gameLoop = false
            } 
        }, delay, {once: true})
    }
}

// show home screen again after game over
function showHomeScreen() {
    gameScreen.style.display = 'none'
    homeScreen.style.display = ''
    leftArea.style.display = 'none'
    rightArea.style.display = 'none'
    gameOverX.style.display = 'none'
    wantedColor.style.display = ''
    menuScoreBarLeft.innerHTML = `Last:${zeroizeNumber(score[0])}`
    menuScoreBarRight.innerHTML = `High:${zeroizeNumber(hiScore[0])}`
}

// game over animation
function showGameOver() {
    audioSfxFail.play()
    delay = 100
    gameLoop = false
    readyToClick = false
    wantedColor.style.display = 'none'
    gameOverX.style.display = ''

    if (hiScore[0] <= score[0]) {
        hiScore = score
    }

    if (!intervalForGameOver) {
        let cnt = 0
        intervalForGameOver = setInterval(function() {
            cnt++
            if (cnt === 2) {
                resetCountdown()
                showHomeScreen()
            }
        }, 1000, {once: true})
    }
}

// when start button is pressed, perform these
function handleStartTrigger() {
    gameScreen.style.display = ''
    homeScreen.style.display = 'none'
    leftArea.style.display = ''
    rightArea.style.display = ''
    helpText.style.display = 'none'
    helpBtn.style.backgroundColor = `var(--c0f)`
    isHelpBar = false
    score = [0]
    inGameScoreCounter.innerHTML = `${zeroizeNumber(score[0])}`
    gameLoop = true
    game()
}

// main loop
function game() {
    if (gameLoop) {
        renderNewColor()
        initLeftArea()
        initRightArea()
        countdown()
    }
}

// handle sound button toggling the music on/off
function handleSoundBtn() {
    myAudio.loop = true
    myAudio.play()
}

// disable clicks on in-game left and right areas
function removeClickableAreas() {
    leftArea.removeEventListener('click', leftAreaClick)
    rightArea.removeEventListener('click', rightAreaClick)
    readyToClick = false
}

// disable both contdown and game over intervals
function resetCountdown() {
    clearInterval(intervalForGameOver)
    clearInterval(intervalForCountDown)
    intervalForGameOver = null
    intervalForCountDown = null
}