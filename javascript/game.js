(function () {
    "use strict";

    var exports = typeof window !== "undefined" && window ? window : global;

    exports.Game = function () {
        var players          = [],
            places           = [],
            purses           = [],
            inPenaltyBox     = [],
            popQuestions     = [],
            scienceQuestions = [],
            sportsQuestions  = [],
            rockQuestions    = [],
            currentPlayer    = 0,
            isGettingOutOfPenaltyBox = false,

            didPlayerWin = function () {
                return purses[currentPlayer] !== 6;
            },

            currentCategory = function () {
                var place = places[currentPlayer];

                switch (place) {
                    case 0:
                    case 4:
                    case 8:
                        return 'Pop';
                    case 1:
                    case 5:
                    case 9:
                        return 'Science';
                    case 2:
                    case 6:
                    case 10:
                        return 'Sports';
                    default:
                        return 'Rock';
                }
            },

            askQuestion = function () {
                var myCat = currentCategory();

                switch (myCat) {
                    case 'Pop':
                        console.log(popQuestions.shift());
                        break;
                    case 'Science':
                        console.log(scienceQuestions.shift());
                        break;
                    case 'Sports':
                        console.log(sportsQuestions.shift());
                        break;
                    case 'Rock':
                        console.log(rockQuestions.shift());
                        break;
                }
            },

            createRockQuestion = function (index) {
                return "Rock Question " + index;
            };

        this.add = function (playerName) {
            players.push(playerName);
            places[players.length - 1] = 0;
            purses[players.length - 1] = 0;
            inPenaltyBox[players.length - 1] = false;

            console.log(playerName + " was added");
            console.log("They are player number " + players.length);

            return true;
        };

        this.roll = function (roll) {
            console.log(players[currentPlayer] + " is the current player");
            console.log("They have rolled a " + roll);

            if (inPenaltyBox[currentPlayer] && roll % 2 === 0) {
                console.log(players[currentPlayer] + " is not getting out of the penalty box");
                isGettingOutOfPenaltyBox = false;
            } else {
                if (inPenaltyBox[currentPlayer] && roll % 2 !== 0) {
                    isGettingOutOfPenaltyBox = true;

                    console.log(players[currentPlayer] + " is getting out of the penalty box");
                }
                places[currentPlayer] = places[currentPlayer] + roll;
                if (places[currentPlayer] > 11) {
                    places[currentPlayer] = places[currentPlayer] - 12;
                }

                console.log(players[currentPlayer] + "'s new location is " + places[currentPlayer]);
                console.log("The category is " + currentCategory());

                askQuestion();
            }
        };

        this.wasCorrectlyAnswered = function () {
            var winner = true;

            if (inPenaltyBox[currentPlayer] && isGettingOutOfPenaltyBox || !inPenaltyBox[currentPlayer]) {
                console.log("Answer was correct!!!!");
                purses[currentPlayer] += 1;
                console.log(players[currentPlayer] + " now has " +
                    purses[currentPlayer] + " Gold Coins.");

                winner = didPlayerWin();
            }

            currentPlayer += 1;
            if (currentPlayer === players.length) {
                currentPlayer = 0;
            }

            return winner;
        };

        this.wrongAnswer = function () {
            console.log('Question was incorrectly answered');
            console.log(players[currentPlayer] + " was sent to the penalty box");
            inPenaltyBox[currentPlayer] = true;

            currentPlayer += 1;
            if(currentPlayer === players.length){
                currentPlayer = 0;
            }
            return true;
        };

        for (var i = 0; i < 50; i++){
            popQuestions.push("Pop Question " + i);
            scienceQuestions.push("Science Question " + i);
            sportsQuestions.push("Sports Question " + i);
            rockQuestions.push(createRockQuestion(i));
        }
    };

    var notAWinner = true,
        game = new Game();

    game.add('Chet');
    game.add('Pat');
    game.add('Sue');

    while (notAWinner) {
        game.roll(Math.floor(Math.random()*6) + 1);

        if (Math.floor(Math.random()*10) === 7) {
            notAWinner = game.wrongAnswer();
        } else {
            notAWinner = game.wasCorrectlyAnswered();
        }
    }
})();
