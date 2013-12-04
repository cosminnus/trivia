exports = typeof window !== 'undefined' && window !== null ? window : global;

exports.Game = function() {
    
    var players            = [],     // the list with the participating players
        currentPlayer      = null,   // current player
        totalPlayers       = 0,      // total number of players. tunable.
        
        
        questions          = [],     // the list with the questions
        questionTypes      = [       // the types of the questions
            'science',
            'pop',
            'sports',
            'rock'
        ],
        totalQuestionTypes = questionTypes.length,
    
        gameIsWon          = false,
    
    // player creator
    createPlayer = (function() {
        
        var playerId = 0;
        
        return function( playerName ) {
        
            var coins              = 0,                    // total amount of conins the player owns
                name               = playerName || 'john', // the name of the player
                id                 = ++playerId,           // player ID
                player             = this,                 // link to this
                hasHandicap        = false,                // weather the player has a handicap or not
                place              = 0,                    // the place the player situates?
                freshlyUnpenaltied = false,                // weather or not the handicap property was changed from a true to a false state
                isWinner           = false                 // weather or not the player is the winner of the game
            ;
            
            // increment the number of total players
            totalPlayers++;
            
            // add the player to the players pool
            players.push( player );
            
            // define player coins property
            Object.defineProperty( player, "coins", {
                "get": function() {
                    return coins;
                },
                "set": function( value ) {
                    coins = ~~value; // force coins to always be an integer
                    console.log( name, " now has ", coins, " gold coins" );
                    
                    // This rule was in the original game in function didPlayerWin()
                    // I don't understand what kind of rule is this, but ...
                    if ( coins == 6 ) {
                        gameIsWon = true;
                        isWinner = true;
                        console.log( name, "has won the game!" );
                    }
                    
                }
            });
            
            // name of the player. read-only.
            Object.defineProperty( player, "name", {
                "get": function() {
                    return name;
                }
            } );
            
            // weather or not the player is the winner of the game
            Object.defineProperty( player, "isWinner", {
                "get": function() {
                    return isWinner;
                }
            } );
            
            // define player id property, read-only
            Object.defineProperty( player, "id", {
                "get": function() {
                    return id;
                }
            });
            
            // define the player handicap, boolean
            Object.defineProperty( player, "handicap", {
                "get": function() {
                    return hasHandicap;
                },
                "set": function( value ) {
                    
                    if ( hasHandicap != !!value ) {
                        freshlyUnpenaltied = hasHandicap;
                        hasHandicap = !!value;
                        console.log( name, " is ", ( hasHandicap ? "entering in" : "leaving from" ), " the penalty box" );
                    }
                    
                }
            } );
            
            // implement the player place, integer.
            Object.defineProperty( player, "place", {
                "get": function() {
                    return place;
                },
                "set": function( intval ) {
                    place = ~~intval;
                    
                    if ( place > 11 )
                        place %= 12;
                    
                    console.log( name, "'s new place is now ", place );
                }
            } );
            
            // in a real-world game, the answer should be implemented,
            // but in this simulation, the answer is a random number
            player.answer = function( question ) {
                
                var answerValue = freshlyUnpenaltied
                    ? true
                    : ~~( Math.random() * 10 ) == 7;
                
                if ( question.validateAnswer( answerValue ) ) {
                    console.log( name, " answered good!" );
                    player.coins++;
                } else {
                    console.log( name, " answered wrong!" );
                    // sendit' to the cage :))
                    player.handicap = true;
                }
                
            };
            
            //console.log( "Created player: ", name );
            
            return player;
        };
        
    } )(),
    
    // question creator
    createQuestion = ( function() {
        
        var questionId = 0;
        
        return function( questionCategory ) {
            var instance = this,              // link to this
                category = questionCategory,  // the question category ( e.g. "science", etc. )
                question = '',                // the question body ( e.g.: "Does the science is awesome?" )
                answer   = 0,                 // the question correct answer.
                id       = ++questionId       // the question id
            ;
            
            // push the question to the game questions list
            questions.push( this );
            
            // question getter. read-only
            Object.defineProperty( instance, "question", {
                "get": function() {
                    return question;
                }
            });
            
            // question id. read-only
            Object.defineProperty( instance, "id", {
                "get": function() {
                    return id;
                }
            });
            
            // question category. read-only
            Object.defineProperty( instance, "category", {
                "get": function() {
                    return category;
                }
            });
            
            // we don't want to expose the question answer to the outside
            // world, so we're just returning a boolean, based on a player
            // answer.
            instance.validateAnswer = function( playerAnswer ) {
                return playerAnswer == true;
            };
            
            // Initialize ...
            question = 'Question #' + id + ' from ' + category;
            answer   = ~~( Math.random() * totalPlayers );
            
            // console.log( "Created question #", id, " from ", category );
            
            return instance; // or this, is the same thing.
        };
    } )(),
    
    initializeGame = function() {
        
        // in a real-world app, the player names should be obtained from
        // a source, that's why they're hardcoded inside an array
        var playerNames = [ 'Chet', 'Pat', 'Sue' ]; 
        
        // add players with their corresponding names
        for ( var i=0, len = playerNames.length; i<len; i++ ) {
            new createPlayer( playerNames[i] );
        }
        
        // initialize game questions
        for ( var i=0, questionTypeIndex = 0; i < 200; i++ ) {
            
            new createQuestion( questionTypes[ questionTypeIndex++ ] );
            
            questionTypeIndex = questionTypeIndex < totalQuestionTypes
                ? questionTypeIndex
                : 0;
        }
        
        // initialize current player
        currentPlayer = players[0];
    };
    
    this.nextRound = function( probability ) {
        
        console.log( currentPlayer.name, " is the next player" );
        console.log( currentPlayer.name, " has rolled a ", probability );
        
        if ( currentPlayer.handicap ) {
            
            if ( ( probability % 2 ) != 0 ) {

                currentPlayer.handicap = false;

                currentPlayer.place += probability;
                
                currentPlayer.answer(
                    questions.shift()
                );
                
            } else {
                // the player is staying in the penalty box further
                console.log( currentPlayer.name, " is staying in the penalty box further" );
            }
        } else {
            
            currentPlayer.place += probability;

            currentPlayer.answer( questions.shift() );
            
        }
        
        // advance to the next player
        currentPlayer = players[ currentPlayer.id == totalPlayers ? 0 : currentPlayer.id ];
        
    }
    
    // weather or not we have a winner for the game
    Object.defineProperty( this, "gameIsWon", {
        "get": function() {
            return gameIsWon;
        }
    } );
    
    // returns the instance of the winner if a winner
    // exists, or FALSE otherwise
    Object.defineProperty( this, "gameWinner", {
        "get": function() {
            for ( var i=0, len = players.length; i<len; i++ )
                if ( players[i].isWinner )
                    return players[i];
            return false;
        }
    } );
    
    // returns true if game is still playable
    Object.defineProperty( this, "gameIsPlayable", {
        
        "get": function() {
            return !this.gameIsWon && questions.length > 0;
        }
        
    } );
    
    initializeGame();
    
    return this;
};

var g = new Game();

exports.winner = false;

do { 
    g.nextRound( ~~( Math.random() * 6 ) + 1 );
} while ( g.gameIsPlayable );

winner = !!g.gameWinner;