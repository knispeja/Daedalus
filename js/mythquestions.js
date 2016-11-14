// For use in true and false questions
var TRUE = 0;
var FALSE = 1;

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
        "Who is Dionysus' mother?",
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
            "Heracles",
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
        "Medea is made to fall in love with Jason by Aphrodite, helps him to obtain the Golden Fleece."
    ),
    makeTrueFalseQuestion(
        "Agamemnon is killed by his daughter, Electra.",
        FALSE,
        "Agamemnon is either killed by his wife, Clytemnestra, or her lover, Aegisthus, in some versions."
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
        "Cronus devours his children because gods are delicious and he is incredibly hungry.",
        FALSE,
        "Cronus ate his children because a prophecy told him he would be succeeded by one of them."
    ),
    makeTrueFalseQuestion(
        "Cassandra had the gift of prophecy, but nobody believed her predictions.",
        TRUE,
        "Apollo cursed Cassandra so because she rejected his love."
    ),
    makeMultipleChoiceQuestion(
        "What animal did Zeus turn into in order to kidnap Europa?",
        [
            "A bull",
            "An eagle",
            "A ram",
            "A swan"
        ],
        "Zeus transformed into a white bull and carried Europa off to Crete."
    ),
    makeMultipleChoiceQuestion(
        "Who is left alive after the great flood Zeus brought upon the world?",
        [
            "Deucalion and Pyrrha",
            "Baucis and Philemon",
            "Orpheus and Eurydice"
        ]
    ),
    makeTrueFalseQuestion(
        "Heracles released Prometheus from his chains.",
        TRUE
    ),
    makeTrueFalseQuestion(
        "Dionysus is the primary god of <i>The Bacchae</i>.",
        TRUE
    ),
    makeTrueFalseQuestion(
        "Oedipus is killed for his heinous acts in Thebes.",
        FALSE,
        "Oedipus lives a relatively long life and dies peacefully."
    ),
    makeMultipleChoiceQuestion(
        "Who is the father of Oedipus?",
        [
            "Laius",
            "Creon",
            "Polybus"
        ],
        "Polybus is Oedipus' adopted father."
    ),
    makeMultipleChoiceQuestion(
        "What is Antigone's relation to Oedipus?",
        [
            "Daughter",
            "Sister",
            "Mother",
            "Grandmother"
        ],
        "Antigone is the daughter of Oedipus and Jocasta, making her both Jocasta's daughter <i>and</i> granddaughter."
    ),
    makeTrueFalseQuestion(
        "Oedipus is aware of who his parents are when he defeats the Sphinx.",
        FALSE,
        "Oedipus believes his parents to be Polybus and Merope at that point."
    ),
    makeTrueFalseQuestion(
        "Oedipus kills his father.",
        TRUE,
        "He is not aware it is his father, however."
    ),
    makeMultipleChoiceQuestion(
        "Which is not true about Pandora?",
        [
            "She is a gift to humanity at Zeus' instruction.",
            "She is the first woman.",
            "She is created by Hephaestus.",
            "She is given gifts by the Olympians."
        ],
        "Although Zeus does instruct Pandora be created, her creation is meant to be a punishment."
    ),
    makeMultipleChoiceQuestion(
        "How many labors does Heracles perform?",
        [
            "3",
            "7",
            "12",
            "16"
        ],
        "",
        2,
        false
    ),
    makeMultipleChoiceQuestion(
        "After whom was the Hellespont named?",
        [
            "Helle",
            "Helen",
            "Helios"
        ],
        "Helle falls into what is now the Hellespont while fleeing her home on a golden ram."
    ),
    makeMultipleChoiceQuestion(
        "What is the name of the ship upon which the Argonauts sailed?",
        [
            "<i>Argo</i>",
            "<i>Argos</i>",
            "<i>Argus</i>"
        ],
        "Argus, the master craftsman, constructed <i>Argo</i>."
    ),
    makeMultipleChoiceQuestion(
        "Who kills Achilles with the help of Apollo during the Trojan War?",
        [
            "Paris",
            "Hector",
            "Agamemnon",
            "Aeneas",
            "Ajax"
        ],
        "Paris kills Achilles with an arrow to the heel, as predicted by Hector in his dying words."
    ),
    makeMultipleChoiceQuestion(
        "What enrages Achilles and drives him to return to battle and kill Hector in the Trojan War?",
        [
            "The death of Patroclus",
            "The loss of Briseis",
            "The death of his mother",
            "The death of his father",
            "The theft of his armor"
        ],
        "Patroclus is Achilles' closest companion, so his death is the major motivation."
    ),
    makeMultipleChoiceQuestion(
        "How is Ixion punished for eternity?",
        [
            "He is bound to a spinning wheel",
            "He is forced to forever push a boulder up a hill",
            "His liver is repeatedly eaten"
        ],
        "Ixion is punished in this way by Zeus for coveting Hera."
    ),
    makeMultipleChoiceQuestion(
        "Who pushes a boulder uphill in a futile and eternal struggle?",
        [
            "Sisyphus",
            "Ixion",
            "Polynices",
            "Theseus",
            "Prometheus"
        ]
    ),
    makeTrueFalseQuestion(
        "The Greek name of Pluto is Hades.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "Who is the goddess of the hearth and home?",
        [
            "Hestia",
            "Artemis",
            "Hera",
            "Hebe",
            "Athena"
        ]
    ),
    makeMultipleChoiceQuestion(
        "Who is the original cupbearer of the gods?",
        [
            "Hebe",
            "Hestia",
            "Hera",
            "Hermes",
            "Hades"
        ],
        "Hebe is the cupbearer of the gods until she is married to Heracles and supplanted by Ganymede."
    ),
    makeTrueFalseQuestion(
        "Aeschylus is the author of <i>The Aeneid</i>.",
        FALSE,
        "<i>The Aeneid</i> was written by Virgil."
    ),
    makeTrueFalseQuestion(
        "Sophocles is the author of the trilogy about Oedipus.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "Who is Aeneas' divine mother?",
        [
            "Aphrodite",
            "Hera",
            "Leto",
            "Demeter",
            "Hebe"
        ],
        "Aeneas is the son of Aphrodite and Anchises."
    ),
    makeMultipleChoiceQuestion(
        "Who is abandoned on Naxos by Theseus?",
        [
            "Ariadne",
            "Phaedra",
            "Medea",
            "Pasiphae"
        ]
    ),
    makeTrueFalseQuestion(
        "Heracles kills the Minotaur.",
        FALSE,
        "Theseus kills the Minotaur."
    ),
    makeMultipleChoiceQuestion(
        "Who fell in love with Hippolytus?",
        [
            "Phaedra, his step-mother.",
            "Theseus, his father.",
            "Hippolyta, his mother."
        ]
    ),
    makeMultipleChoiceQuestion(
        "Who is not a child of Zeus?",
        [
            "Hestia",
            "Artemis",
            "Hebe",
            "Hermes",
            "Perseus"
        ],
        "Hestia is the daughter of Cronus and Rhea, just like Zeus."
    ),
    makeTrueFalseQuestion(
        "Zeus is Hera's brother.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "Who throws the Apple of Discord into the divine wedding party?",
        [
            "Eris",
            "Paris",
            "Hera",
            "Aphrodite",
            "Helen"
        ],
        "Eris wasn't invited to the wedding, so she decided to cause trouble."
    ),
    makeTrueFalseQuestion(
        "Hermes stole Apollo's livestock as a baby.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "Who gave Theseus the thread to help him find his way in the labyrinth?",
        [
            "Ariadne",
            "Semele",
            "Helen",
            "Phaedra"
        ]
    ),
    makeMultipleChoiceQuestion(
        "From what event did Pegasus originate?",
        [
            "The death of Medusa",
            "The injury of Zeus",
            "The death of Heracles",
            "The mating of a horse and an eagle"
        ]
    ),
    makeMultipleChoiceQuestion(
        "Who killed Medusa?",
        [
            "Perseus",
            "Theseus",
            "Heracles"
        ]
    ),
    makeTrueFalseQuestion(
        "The gray sisters shared but one ear among them all.",
        FALSE,
        "It was an eye and a tooth that they shared."
    ),
    makeMultipleChoiceQuestion(
        "Choose the odd one out.",
        [
            "Faerun",
            "Erinyes",
            "Eumenides",
            "Furies"
        ],
        "All are names for the Furies except for 'Faerun.'"
    ),
    makeMultipleChoiceQuestion(
        "Who is not a child of Leda?",
        [
            "Diomedes",
            "Castor",
            "Pollux",
            "Clytemnestra",
            "Helen"
        ]
    ),
    makeTrueFalseQuestion(
        "Of Castor and Pollux, the former is naturally immortal.",
        FALSE,
        "It was Pollux who was born immortal."
    ),
    makeMultipleChoiceQuestion(
        "Poseidon is the god of both the sea and...?",
        [
            "Earthquakes",
            "Rain",
            "Fish",
            "Sand"
        ]
    ),
    makeMultipleChoiceQuestion(
        "God of healing and father of Asclepius.",
        [
            "Apollo",
            "Dionysus",
            "Ares",
            "Zeus",
            "Poseidon"
        ]
    ),
    makeTrueFalseQuestion(
        "Asclepius is killed by Zeus.",
        TRUE,
        "Thisiswas a punishment for bringing people back from the dead."
    ),
    makeMultipleChoiceQuestion(
        "How do the Argonauts pass safely by the Sirens?",
        [
            "Orpheus drowns out their singing with his own, more beautiful music.",
            "They fill their ears with wax to block out the singing.",
            "They tie each other to various parts of the boat."
        ]
    ),
    makeTrueFalseQuestion(
        "Hades kidnapped Persephone.",
        TRUE
    ),
    makeMultipleChoiceQuestion(
        "Select the pair that does not fit:",
        [
            "Narcissus and Isis",
            "Ceyx and Alcyone",
            "Cupid and Psyche",
            "Hero and Leander",
            "Orpheus and Eurydice"
        ],
        "All other options are famous lovers."
    ),
    makeMultipleChoiceQuestion(
        "Who is Daedalus?",
        [
            "The creator of the Labyrinth in Crete",
            "The creator of this website",
            "The creator of <i>Argo</i>",
            "The son of Icarus"
        ]
    ),
    makeTrueFalseQuestion(
        "Minos is a king of Crete.",
        TRUE
    ),
    makeTrueFalseQuestion(
        "The Minotaur is the son of Minos' daughter.",
        FALSE,
        "The Minotaur was born of Minos' wife, Pasiphae."
    ),
    makeMultipleChoiceQuestion(
        "From which part of Zeus is Athena classically born?",
        [
            "The head",
            "The breast",
            "The thigh"
        ],
        "This is symbolic of her great wisdom."
    ),
    makeMultipleChoiceQuestion(
        "What nymph does Apollo pursue?",
        [
            "Daphne",
            "Thetis",
            "Echo"
        ]
    ),
    makeMultipleChoiceQuestion(
        "Which goddess is not chaste?",
        [
            "Artemis",
            "Athena",
            "Hestia",
            "Hebe"
        ],
        "Hebe is even married to Heracles."
    ),
    makeMultipleChoiceQuestion( // #60
        "Which is an epithet for Hera?",
        [
            "Ox-eyed",
            "Gray-eyed",
            "Owl-eyed"
        ],
        "The other options are epithets for Athena."
    )
];