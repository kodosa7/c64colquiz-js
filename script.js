const wantedColor = document.getElementById('wanted-color')
const leftArea = document.getElementById('left-area')
const rightArea = document.getElementById('right-area')
const homeScreen = document.getElementById('home-screen')
const gameScreen = document.getElementById('game-screen')
const startTrigger = document.getElementById('start-trigger')
const soundBtn = document.getElementById('sound-button')
const paletteBtn = document.getElementById('palette-button')
const gameOverX = document.getElementById('game-over-x')
const inGameScoreCounter = document.getElementById('middle-score-counter')
const menuScoreBarLeft = document.getElementById('top-score-bar-left')
const menuScoreBarRight = document.getElementById('top-score-bar-right')
const audioSfxGood = document.getElementById('audio-sfx-good')
const audioSfxFail = document.getElementById('audio-sfx-fail')
const paletteSelector = document.getElementById('palette-selector')

// when music ends, play it again
var myAudio = new Audio('sfx/music.mp3')
myAudio.addEventListener('ended', function() {
    this.currentTime = 0
    this.play()
}, false)

let isMusic = false
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

function init() {
    console.log("init()")
    leftArea.style.display = 'none'
    rightArea.style.display = 'none'
    gameScreen.style.display = 'none'
    gameOverX.style.display = 'none'
    homeScreen.style.display = ''
    paletteSelector.innerHTML = `<link rel="stylesheet" href="palette1.css" id="palette-selector">`
}

init()

document.addEventListener('click', function(e) {
    // listen for 'start game' button
    if (e.target.dataset.start) {
        handleStartTrigger(e.target.dataset.start)
    }
    
    // listen for music mutton
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
})
    
function initLeftArea() {
    leftAreaClick = function() {
        console.log("left area clicked")
        if (currentColors[1] === currentColors[2]) {
            console.log("left color matches")
            score[0] += 1
            if (score <= 30) {
                delay -= 2  // timer decreasing speed
            }
            // if (delay <= 1) {
            //     delay = 1
            // }
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

function initRightArea() {
    rightAreaClick = function() {
        console.log("right area clicked")
        if (currentColors[1] === currentColors[3]) {
            console.log("right color matches")
            score[0] += 1
            if (score <= 30) {
                delay -= 2  // timer decreasing speed
            }
            // if (delay <= 1) {
            //     delay = 1
            // }
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

function zeroizeNumber(num) {
    let zeroedScore = num.toString()
    while (zeroedScore.length < 8)
    zeroedScore = "0" + zeroedScore
    return zeroedScore
}

function renderNewColor() {
    console.log('renderNewColor()')
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
    console.log(currentColors)
}    

function countdown() {
    readyToClick = true
    const middleTimeBar = document.getElementById('middle-time-bar')
    // increase border value to mimic time bar decrease
    if (!intervalForCountDown) {
        readyToClick = true
        let cnt = 0
        intervalForCountDown = setInterval(function() {
            console.log('cnt', cnt)
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
            console.log("game over delay counter", cnt)
            if (cnt === 2) {
                console.log('intervalForGameOver finished!')
                resetCountdown()
                showHomeScreen()
            }
        }, 1000, {once: true})
    }
}

function handleStartTrigger() {
    gameScreen.style.display = ''
    homeScreen.style.display = 'none'
    leftArea.style.display = ''
    rightArea.style.display = ''
    score = [0]
    inGameScoreCounter.innerHTML = `${zeroizeNumber(score[0])}`
    gameLoop = true
    game()
}

function game() {
    if (gameLoop) {
        renderNewColor()
        initLeftArea()
        initRightArea()
        countdown()
    }
}

function handleSoundBtn() {
    myAudio.loop = true
    myAudio.play()
}

function removeClickableAreas() {
    leftArea.removeEventListener('click', leftAreaClick)
    rightArea.removeEventListener('click', rightAreaClick)
    readyToClick = false
}

function resetCountdown() {
    clearInterval(intervalForGameOver)
    clearInterval(intervalForCountDown)
    intervalForGameOver = null
    intervalForCountDown = null
}