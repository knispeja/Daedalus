var TRUE = 0;
var FALSE = 1;
var TRUE_FALSE_OPTIONS = ['True', 'False'];
var MULTIPLE_CHOICE_START_CODE = 65; // capital a:'A'

var Question = function(text, options, answer, explanation) {
    this.text = text;
    this.options = options;
    this.answer = answer;
    this.explanation = explanation;
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
    var code = MULTIPLE_CHOICE_START_CODE;
    options = options.map(function(opt) {return String.fromCharCode(code++) + ". " + opt});

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
    )
]