// By Jon Dolan, http://five.jondolan.me , MIT License
// Commented for the benefit of others
// Note: JS OOP is weird!

var game;

function WordGame(name) { // create generic Game class
    this.numberOfGuesses = 0;
    this.maxGuesses = 10;
    this.guesses = [];
    this.line = '<span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "response"></span><span class = "response"></span>';
    this.gameName = name;
    this.gameEl = document.getElementById(name + '-game');
}
WordGame.prototype.setUp = function () {
    if (this.gameName == "easy") {
        var soon = document.createElement('div');
        soon.innerHTML = "Coming soon...";
        soon.setAttribute('class', 'hidden');
        this.gameEl.appendChild(soon);
        growAnimation(this.gameEl, 0, 30, 10, 10,
		function () {
            fadeInAnimation(soon,function (){});
        });
        return;
    }
    // This logic applies to the regular and easy game modes, multiplayer overrides completely
    var gamewrapper = document.createElement('div');
    gamewrapper.setAttribute('class', 'game-wrapper');
    gamewrapper.setAttribute('id', this.gameName + '-game-wrapper');
    this.gameEl.appendChild(gamewrapper);
    
    this.setUpFirstGuess();
    
    var random = Math.floor(Math.random()*smallWordList.length+1);
    this.setWord(smallWordList[random]);
    
};
WordGame.prototype.gameUp = function () {
    // TODO - add similar logic between 3 game types here!
};
WordGame.prototype.setWord = function (word) {// create generic word setter
    this.word = word;
    return this;
};
WordGame.prototype.getWord = function () { // create generic word getter
    return this.word;
};
WordGame.prototype.getNumberOfGuesses = function () { // create generic guess number getter
    return this.numberOfGuesses;
};
WordGame.prototype.incrementGuesses = function () { // increment the number of guesses
    this.numberOfGuesses++;
};
WordGame.prototype.setUpFirstGuess = function () {
    var firstguess = document.createElement('p');
    firstguess.setAttribute('class', 'first-guess');
    firstguess.setAttribute('id', this.gameName + '-first-guess');
    firstguess.innerHTML = 'Enter your first guess!';
    document.getElementById(this.gameName + '-game-wrapper').appendChild(firstguess);
    
    var guessinputp = document.createElement('p');
    guessinputp.setAttribute('class', 'bottom-guess-inputs');
    guessinputp.setAttribute('id', this.gameName + '-bottom-guess-inputs');
    document.getElementById(this.gameName + '-game-wrapper').appendChild(guessinputp);
    
    var guessinputfield = document.createElement('input');
    guessinputfield.setAttribute('type', 'text');
    guessinputfield.setAttribute('class', 'guess-input');
    guessinputfield.setAttribute('id', this.gameName + '-guess-input');
    guessinputfield.setAttribute('onkeyup', "submitForm(event, '" + this.gameName + "-guess-button');");
    guessinputfield.setAttribute('maxlength', '5');
    guessinputp.appendChild(guessinputfield);
    
    var guessinputbutton = document.createElement('input');
    guessinputbutton.setAttribute('class', 'guess-button');
    guessinputbutton.setAttribute('id', this.gameName + '-guess-button');
    guessinputbutton.setAttribute('type', 'submit');
    guessinputbutton.setAttribute('value', 'Submit guess!');
    guessinputbutton.setAttribute('onclick', "game.enterGuess('" + this.gameName + "-guess-input');");
    guessinputp.appendChild(guessinputbutton);
    
    var thus = this;
    growAnimation(this.gameEl, 0, 48, 10, 10, function () {
        fadeInAnimation(document.getElementById(thus.gameName + '-game-wrapper'), function (){});
        guessinputfield.focus();
    });
};
WordGame.prototype.animateFirstGuess = function (rowToAdd) {
    var wrapper = document.getElementById(this.gameName + '-game');
    
    var wrap = document.getElementById(this.gameName + '-game-wrapper');
    var rlrp = document.createElement('span');
    rlrp.setAttribute('class', 'response');
    rlrp.setAttribute('id', 'rlrp');
    rlrp.innerHTML = 'rlrp';
    wrap.insertBefore(rlrp, wrap.childNodes[0]);
    
    var rlwp = document.createElement('span');
    rlwp.setAttribute('class', 'response');
    rlwp.setAttribute('id', 'rlwp');
    rlwp.innerHTML = 'rlwp';
    wrap.insertBefore(rlwp, wrap.childNodes[1]);
    
    
    var thus = this;
    shrinkAnimation(wrapper, 0, 10, 10,
    function () {
        var firstguess = document.getElementById(thus.gameName + '-first-guess');
        firstguess.parentElement.removeChild(firstguess);
     
        document.getElementById(thus.gameName + '-bottom-guess-inputs').style.display = 'none';
     
        growAnimation(wrapper, 0, 75, 10, 10, 
        function () {
            fadeInAnimation(document.getElementById(thus.gameName + '-game-wrapper'), function (){});
            fadeInAnimation(rowToAdd, function (){});
            fadeInAnimation(document.getElementById(thus.gameName + '-bottom-guess-inputs'), function (){});
            document.getElementById(thus.gameName + '-guess-input').focus();
        });
    });
}
WordGame.prototype.enterGuess = function (id) { // generic code to enter a guess
    if (this.getNumberOfGuesses() == 10) {
        alert('You already lost, reload the page (will be changed...)');
        return;
    }
    var guess = document.getElementById(id).value.toLowerCase();
    if (this.isValidWord(guess) == true) {
        var container = document.getElementById(this.gameName + '-game-wrapper');
        var rowToAdd = document.createElement('div');
        rowToAdd.setAttribute('class', 'word-row');
        rowToAdd.innerHTML = this.line;

        for (var i = 0; i < this.guesses.length; i++) {
            if (this.guesses[i] == guess) {
            alert("You should not submit the same word twice. You're welcome...");
            return;
            }
        }
     
        this.guesses[this.getNumberOfGuesses()] = guess;
        this.incrementGuesses();
     
        document.getElementById(id).placeholder = (this.maxGuesses - this.getNumberOfGuesses()) + ' guess' + ((this.getNumberOfGuesses() == 9) ? '' : 'es') + ' left';
        document.getElementById(id).value = '';  
     
        if (this.getWord() == guess) {
            alert('You won!');
            return;
        }
        else
        {
            var rlrp = 0;
            var rlwp = 0;
            for (var i = 0; i < 5; i++) {
                var letter = guess.substring(i, i+1);
                rowToAdd.getElementsByClassName('word-col')[i].innerHTML = letter;
                if (this.getWord().search(letter) != -1) {
                    if (this.getWord().search(letter) == i)
                        rlrp++;
                    else
                        rlwp++;
                }
            }
            rowToAdd.getElementsByClassName('response')[0].innerHTML = rlrp; // rlrp
            rowToAdd.getElementsByClassName('response')[1].innerHTML =  rlwp; // rlwp

            container.insertBefore(rowToAdd, container.childNodes[container.childNodes.length-1]);
            if (this.guesses.length == 1) {
                this.animateFirstGuess(rowToAdd);  
            }
            else
            {
                this.animateGuess(rowToAdd);
            }
        }
        if (this.getNumberOfGuesses() == 10 && this.getWord() != guess)
            alert('You lost! The word was ' + this.getWord());
    }
};
WordGame.prototype.animateGuess = function (rowToAdd) {
    var temp = ANIMATIONSPEED;
    ANIMATIONSPEED = 1;
    var wrapper = document.getElementById(this.gameName + '-game-wrapper');
    var thus = this;
    var extraSize = document.getElementById('rlwp').clientHeight;

    fadeOutAnimation(document.getElementById(this.gameName + '-bottom-guess-inputs'), 
    function () {
        growAnimation(wrapper, extraSize+(thus.getNumberOfGuesses())*getElementsByClass('word-row')[0].clientHeight, extraSize+(thus.getNumberOfGuesses()+1)*30, 0, 0, 
        function () {
            fadeInAnimation(rowToAdd, function (){});
            fadeInAnimation(document.getElementById(thus.gameName + '-bottom-guess-inputs'), function (){});
            document.getElementById(thus.gameName + '-guess-input').focus();
            ANIMATIONSPEED = temp;
        });
    });
};
WordGame.prototype.isValidWord = function (word) {
    var words = largeWordList;
    
    if (word.length != 5)
        alert('The word must be five letters long!');
    else if (word.repeatedLetters())
        alert('Words with double letters are not allowed!');
    else if (words.binarySearch(word) == null)
        alert('This word is not in my dictionary. If you think this is in error, use the "Report a Bug" link at the bottom of the page!'); // TODO: add bug link lol
    else
        return true;
    return false;
}


function MultiGame(word) {// create more specific MultGame class
    this.base = WordGame;
    this.base('multi');
};
MultiGame.prototype = new WordGame; // set the inheritance chain

MultiGame.prototype.setUp = function () {
    var setup = document.createElement('div');
    setup.setAttribute('id', this.gameName + '-setup-wrapper'); // MAYBE same for all games?
    
    var typewordMessage = document.createElement('div');
    typewordMessage.setAttribute('id', 'type-word-p');
    typewordMessage.innerHTML = 'Type your word here (have the other players turn away!)';
    setup.appendChild(typewordMessage);
    
     
    var inputp = document.createElement('p');
    
    var inputField = document.createElement('input');
    inputField.setAttribute('type', 'text');
    inputField.setAttribute('class', 'text');
    inputField.setAttribute('id', this.gameName + '-word-input');
    inputField.setAttribute('onkeyup', "submitForm(event, 'submit-multi-word');");
    inputField.setAttribute('maxlength', '5');
    inputp.appendChild(inputField);
    
    var inputSubmit = document.createElement('input');
    inputSubmit.setAttribute('id', 'submit-multi-word'); // TODO: change to multi-word-submit, maybe same?
    inputSubmit.setAttribute('type', 'submit');
    inputSubmit.setAttribute('class', 'button');
    inputSubmit.setAttribute('value', 'Play!');
    inputSubmit.setAttribute('onclick', "game.submitMultiWord('multi-word-input');");
    inputp.appendChild(inputSubmit);
    
    setup.appendChild(inputp);
    
    this.gameEl.appendChild(setup);
    
    var gameEl = this.gameEl;
    growAnimation(this.gameEl, 0, 48, 10, 10,
    function () {
        fadeIn(gameEl.childNodes);
        document.getElementById('multi-word-input').focus(); // focus multiplayer input
    });
        
};
MultiGame.prototype.setUpGame = function () {
    var thus = this; // so it can be accessed in anon function below
    var setup = document.getElementById('multi-setup-wrapper');
    shrinkAnimation(this.gameEl, 0, 10, 10, 
    function () {
        setup.parentElement.removeChild(setup);

        var gamewrapper = document.createElement('span');
        gamewrapper.setAttribute('id', 'multi-game-wrapper');
        gamewrapper.setAttribute('class', 'game-wrapper');
        thus.gameEl.appendChild(gamewrapper);
     
        thus.setUpFirstGuess();
    });
};
MultiGame.prototype.submitMultiWord = function (element) {
    var input = document.getElementById(element).value.toLowerCase();
    if (this.isValidWord(input)) {
        this.setWord(input);
        this.setUpGame();
    }
};


function startGame(name) { // start the game, grow the corresponding game container 
    var list = getElementsByClass('new-game-buttons', document.getElementById('button-container'), 'div');
    for (var i = 0; i < list.length; i++) {
        list[i].removeAttribute('onclick');
    }
    if (name == 'multi')
        game = new MultiGame('multi');
    else if (name == 'easy')
        game = new WordGame('easy');
    else if (name == 'regular')
        game = new WordGame('regular');
	ga('send', 'event', 'game', 'play', name);
    
    fadeOutAnimation(document.getElementById('how-to-container'), 
    function () {
        document.getElementById('game-container').style.marginBottom = "75px";
        shrinkAnimation(document.getElementById("new-game"), 0, 10, 10,
        function () // grow the next thing
        {
            document.getElementById("new-game").style.paddingTop = '10px';
            document.getElementById("new-game").style.paddingBottom = '10px';
            game.setUp();
        });
    });
}

String.prototype.repeatedLetters = function () {
   for (var i = 0; i < this.length; i++) {
       if (this.indexOf(this.substring(i, i+1)) != -1 && this.indexOf(this.substring(i, i+1)) != i) {
           return true;
       }
    }
    return false;
};

Array.prototype.binarySearch = function (find) {
    var low = 0, 
        high = this.length - 1,
        i, 
        comparison;
    while (low <= high) {
        i = Math.floor((low + high) / 2);
        if (this[i] < find) { 
            low = i + 1; continue; 
        }
        if (this[i] > find) {
            high = i - 1; continue; 
        }
        return i;
    }
    return null;
};