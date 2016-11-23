// Constants
const MULTIPLE_CHOICE_USE_LETTERS = false; // whether or not to prefix multiple choice answers with letters
const MULTIPLE_CHOICE_START_CODE = 65; // capital a:'A'
const TOTAL_QUESTIONS_ASKED = 10;
const CORRECT_OPTION_COLOR = '#006400';
const INCORRECT_OPTION_COLOR = '#7F0000';
const INSTRUCTIONS = [
    "Welcome to Daedalus' Game!<br>Click to continue, or press Escape to skip.",
    "This is a game based on Greek and Roman mythology.",
    "You will first be presented with a quiz with 10 randomly-selected questions.",
    "Try to get as many as you can correct!<br>Your score determines the difficulty of the subsequent game.",
    "In the game after the quiz, you play as Theseus.<br>Your goal is to kill the Minotaur then make it back to the entrance of the labyrinth.",
    "Ariadne will grant you thread that will help you find your way back to the entrance.",
    "Are you ready? It's time to take the quiz!"
];

// Globals
var defaultOptionColor;
var instructionParagraphElement;
var questionElement;
var optionElements = [];
var questionsLeft = TOTAL_QUESTIONS_ASKED;
var currentQuestion;
var nextBtn;
var explanationDiv;
var progressDiv;
var nextplanationShown = true;
var askingPhase = true;
var numberCorrect = 0;

var Question = function(text, options, answer, explanation) {

    this.text = text;
    this.options = options;
    this.answer = answer;
    this.explanation = explanation;

    this.display = function() {

        if(this.options.length > optionElements.length) {
            console.error("Question given too many options: " + this.text);
        }

        questionElement.innerHTML = this.text;
        for(var i=0; i<optionElements.length; i++) {
            if (i < options.length) {
                optionElements[i].innerHTML = this.options[i];
                optionElements[i].style.display = SHOW;
            } else {
                optionElements[i].style.display = HIDE;
            }
            optionElements[i].style.backgroundColor = defaultOptionColor;
        }
        explanationDiv.innerHTML = this.explanation;
    }
}

function makeTrueFalseQuestion(question, answer, explanation="") {
    return new Question(
        question,
        ['True', 'False'],
        answer,
        explanation
    );
}

function makeMultipleChoiceQuestion(question, options, explanation="", answer=0, scramble=true) {

    // Shuffle array and update answer index to shuffled answer location
    if(scramble) {
        var originalAnswer = options[answer];
        options = shuffleArray(options);
        for (var i = 0; i < options.length; i++) {
            if (options[i] === originalAnswer) {
                answer = i;
                break;
            }
        }
    }

    // Append letters to the beginning of the multiple choice questions
    if (MULTIPLE_CHOICE_USE_LETTERS) {
        var code = MULTIPLE_CHOICE_START_CODE;
        options = options.map(function(opt) {return String.fromCharCode(code++) + ". " + opt});
    }

    return new Question(
        question,
        options,
        answer,
        explanation
    );
}

function updateProgressText() {
    var questionsAsked = TOTAL_QUESTIONS_ASKED - questionsLeft;
    var percentCorrect = numberCorrect*1.0/(questionsAsked) * 100;
    var progressStr =
        "Question " +
        (questionsAsked + 1) +
        " out of " +
        TOTAL_QUESTIONS_ASKED;

    if (questionsAsked > 0)
        progressStr +=
            "&emsp;&emsp;(" +
            percentCorrect.toFixed(0) +
            "% correct)";

    progressDiv.innerHTML = progressStr;
}

function displayRandomQuestion() {
    if(questionsLeft === 0) {
        skipToGame();
    }

    updateProgressText();

    var i = randomIndexOf(QUESTIONS);
    currentQuestion = QUESTIONS[i];
    QUESTIONS.splice(i, 1); // remove question from list
    currentQuestion.display();

    toggleNextBtnExplanationShown();
    askingPhase = true;
}

function toggleNextBtnExplanationShown() {
    if(nextplanationShown)
        nextBtn.style.display = explanationDiv.style.display = HIDE;
    else {
        nextBtn.style.display = explanationDiv.style.display = SHOW;
        if(questionsLeft === 0) nextBtn.innerText = "Finish";
    }

    nextplanationShown = !nextplanationShown;
}

function skipToGame() {
    document.getElementById("progress").style.display = HIDE;
    document.getElementById("container").style.display = HIDE;
    document.getElementById("navcontainer").style.display = HIDE;

    beginMazeNav(1 - (numberCorrect*1.0/(TOTAL_QUESTIONS_ASKED)));
    return;
}

function selectedAnswer() {

    questionsLeft--;

    if(!askingPhase) return;

    var indexClicked = this.id.charCodeAt(0) - MULTIPLE_CHOICE_START_CODE;
    if(indexClicked === currentQuestion.answer) {
        optionElements[indexClicked].style.backgroundColor = CORRECT_OPTION_COLOR;
        numberCorrect++;
        updateProgressText();
    } else {
        optionElements[indexClicked].style.backgroundColor = INCORRECT_OPTION_COLOR;
        optionElements[currentQuestion.answer].style.backgroundColor = CORRECT_OPTION_COLOR;
    }

    toggleNextBtnExplanationShown();

    askingPhase = false;
}

function exitInstructions() {
    document.getElementById("instructDiv").style.display = HIDE;
    window.removeEventListener("keydown", instructionCloser, false);
}

function nextInstruction() {
    var message = INSTRUCTIONS.shift();
    if (message) {
        instructionParagraphElement.innerHTML = message;
        instructionParagraphElement.classList.toggle("fade");
    } else {
        exitInstructions();
    }
}

function instructionCloser(event) {
    if (event.keyCode === 27) { // escape
        exitInstructions();
    }
}

function addActionListeners() {

    window.addEventListener("keydown", instructionCloser, false);

    document.getElementById("instructDiv").onclick = function(){
        instructionParagraphElement.classList.toggle("fade");
        setTimeout(nextInstruction, 500); // Time should be similar to the CSS fade transition time
    }

    document.getElementById("skip").onclick = skipToGame;
    nextBtn.onclick = displayRandomQuestion;

    for(var i=0; i<optionElements.length; i++) {
        optionElements[i].onclick = selectedAnswer;
        optionElements[i].onselectstart = function() {return false;};
    }
}

function init() {

    mazeGenInit();

    instructionParagraphElement = document.getElementById("instructP");
    instructionParagraphElement.innerHTML = INSTRUCTIONS.shift();

    questionElement = document.getElementById("question");

    optionElements.push(document.getElementById("A"));
    optionElements.push(document.getElementById("B"));
    optionElements.push(document.getElementById("C"));
    optionElements.push(document.getElementById("D"));
    optionElements.push(document.getElementById("E"));

    defaultOptionColor = optionElements[0].style.backgroundColor;

    nextBtn = document.getElementById("next");
    progressDiv = document.getElementById("progress");
    explanationDiv = document.getElementById("explanation");

    addActionListeners();
    displayRandomQuestion();
}

window.onload = init;