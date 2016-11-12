// For use in true and false questions
var TRUE = 0;
var FALSE = 1;

// Currently contains 10 questions
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
            "The glass armonica"
        ]
    ),
    makeTrueFalseQuestion(
        "Zeus entered into combat with his brothers, Hades and Poseidon, for control of the heavens.",
        FALSE,
        "Zeus drew lots with Hades and Poseidon to decide who would get control of the heavens, and won."
    ),
    makeMultipleChoiceQuestion(
        "Who was Dionysus' mother?",
        [
            "Semele",
            "Hera",
            "Europa",
            "Io",
            "Aphrodite"
        ]
    ),
    makeMultipleChoiceQuestion(
        "Which hero is not a son of Zeus?",
        [
            "Achilles",
            "Hercules",
            "Perseus"
        ],
        "Achilles is the son of Peleus and the nymph Thetis."
    ),
    makeMultipleChoiceQuestion(
        "What woman is most often associated with Jason of the Argonauts?",
        [
            "Medea",
            "Penelope",
            "Deianeira",
            "Clytemnestra",
            "Helen"
        ],
        "Medea was made to fall in love with Jason by Aphrodite, and she helped him to obtain the Golden Fleece."
    ),
    makeTrueFalseQuestion(
        "Agamemnon was killed by Aegisthus and his wife, Clytemnestra.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "To which goddess did Paris give the apple of discord?",
        [
            "Aphrodite",
            "Hera",
            "Athena"
        ],
        "Aphrodite promised Paris the most beautiful woman in the world in return: Helen of Sparta."
    ),
    makeTrueFalseQuestion(
        "Cronus devoured his children because immortals were delicious and he was incredibly hungry.",
        FALSE,
        "Cronus ate his children because a prophecy told him he would be succeeded by one of them."
    ),
    makeTrueFalseQuestion(
        "Cassandra had the gift of prophecy, but nobody believed her predictions.",
        TRUE,
        "Apollo cursed Cassandra so because she rejected his love."
    )
];