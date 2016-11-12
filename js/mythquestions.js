// Constants
var TRUE = 0;
var FALSE = 1;
var TRUE_FALSE_OPTIONS = ['True', 'False'];
var MULTIPLE_CHOICE_START_CODE = 65; // capital a:'A'
var TOTAL_QUESTIONS_ASKED = 10;

// Globals
var questionElement;
var optionElements = [];
var questionsLeft = TOTAL_QUESTIONS_ASKED;

var Question = function(text, options, answer, explanation) {
    this.text = text;
    this.options = options;
    this.answer = answer;
    this.explanation = explanation;

    this.display = function() {
        questionElement.innerHTML = this.text;
        for(var i=0; i<optionElements.length; i++) {
            if (i < options.length) {
                optionElements[i].innerHTML = this.options[i];
                optionElements[i].style.display = "block";
            } else {
                optionElements[i].style.display = "none";
            }
        }
    }
}

function makeTrueFalseQuestion(question, answer, explanation) {
    return new Question(
        question,
        TRUE_FALSE_OPTIONS,
        answer,
        explanation
    );
}

function makeMultipleChoiceQuestion(question, options, explanation="", answer=0) {

    // Shuffle array and update answer index to shuffled answer location
    var originalAnswer = options[answer];
    options = shuffleArray(options);
    for(var i=0; i<options.length; i++) {
        if(options[i] === originalAnswer) {
            answer = i;
            break;
        }
    }

    // Append letters to the beginning of the multiple choice questions
    // var code = MULTIPLE_CHOICE_START_CODE;
    // options = options.map(function(opt) {return String.fromCharCode(code++) + ". " + opt});

    return new Question(
        question,
        options,
        answer,
        explanation
    );
}

// Create the array of all questions to be asked
var QUESTIONS = [
    makeMultipleChoiceQuestion(
        "Who is Talos?",
        [
            "An automaton",
            "A god",
            "A man",
            "A serpent"
        ],
        "Talos is a giant bronze automaton made to protect Europa in Crete."
    ),
    makeMultipleChoiceQuestion(
        "What instrument is Orpheus famous for?",
        [
            "The lyre",
            "The lute",
            "The flute",
            "The glass harmonica"
        ]
    )
];

function displayRandomQuestion() {
    if(questionsLeft-- == 0) {
        showCanvas();
        return;
    }

    var i = randomIndexOf(QUESTIONS);
    var question = QUESTIONS[i];
    QUESTIONS.splice(i, 1); // remove question from list
    question.display();
}

function init() {
    mazeGenInit();
    hideCanvas();

    questionElement = document.getElementById("question");

    optionElements.push(document.getElementById("A"));
    optionElements.push(document.getElementById("B"));
    optionElements.push(document.getElementById("C"));
    optionElements.push(document.getElementById("D"));
    optionElements.push(document.getElementById("E"));

    displayRandomQuestion();
}

window.onload = init;