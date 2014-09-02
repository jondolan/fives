// By Jon Dolan, http://fives.jondolan.me , MIT License

// A compilation of words
// The large word list is used as a list of valid guesses as well as valid word inputs in MULTIPLAYER only
// The small word list is a list the computer picks from in easy , regular, and time trial modes
// I believe this approach is the best way to create the most fun

// TODO : move wordlists here

var game, 
    saveFields = ["fancyName", "word", "guesses", "letterColors", "specialLetters", "gameSettings"];

function WordGame(name) { // create generic Game class, these vars are all self explanatory
    this.reloadMessage = 'Progress will be saved if you leave or reload the game';
    this.maxGuesses = 10;
	this.wordRows = [];
	this.eliminations = [];
	this.line = '<span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "word-col"></span><span class = "response"></span><span class = "response"></span>';
    this.gameName = name;
    this.fancyName = "classic";
    if (name == "multi")
        this.fancyName = "multiplayer";
    else if (name == "easy")
        this.fancyName = "practice";
    else if (name == "time")
        this.fancyName = "time trial";
}
/* Functions that return values related to the game */
WordGame.prototype.toString = function () { // just a formality
    return this.gameName;
};
WordGame.prototype.setWord = function (word) {// create generic word setter
    this.word = waves(word);
};
WordGame.prototype.getWord = function () { // create generic word getter
    return this.word;
};
WordGame.prototype.numberOfGuesses = function () { // create generic guess number getter
    return this.guesses.length;
};

WordGame.prototype.focusInput = function () { // small helper to focus the input easier
	$("#" + game.gameName + "-guess-input").focus();
	return $("#" + game.gameName + "-guess-input");
};
WordGame.prototype.isValidWord = function (word) { // is the word valid? if not, why?
	if (word.length != 5)
        return 'The word must be five letters long!';
	else if (word.search(/[^a-zA-Z]/) != -1)
		return 'Only letters are allowed!';
    else if (word.repeatedLetters())
        return 'Words with double letters are not allowed!';
    else if (largeWordList.binarySearch(word) == null)
        return 'This word is not in the dictionary! Submit a bug if you think it should!';
    else {
        if (typeof game != "undefined") {
            for (var i = 0; i < game.guesses.length; i++) {
                if (this.guesses[i] == word) {
                    return "You should not submit the same word twice. (you're welcome...)";
                }
            }
        }
    }
    return true;
};
WordGame.prototype.pickWord = function () { // applies to everything except MultiGame
    game.setWord(smallWordList[(Math.floor(Math.random()*smallWordList.length+1))]);
	this.setupFirstGuess();
};

WordGame.prototype.makeGameEl = function () { // make the game container element
    this.gameEl = makeElement("div", {id: this.gameName + "-game", class: "game-window"}, "#game-container");
    
    this.gameContainer = makeElement ("div", {id: this.gameName + "-game-wrapper", class: "game-wrapper hidden-game"}, game.gameEl);
    
    $(".holder").droppable({ // make the holder droppable to word-cols and input a green letter on drop
        drop: function(event, ui) {
			game.letterDropped(this, ui.helper);
            game.focusInput();
        },
        accept: ".word-col" 
    });
    $(".holder").on('click', game.clickHolder); // make the onclick event for the holder
};
WordGame.prototype.addResponseTitles = function (wrap) { // add the rlwp and rlrp titles
    var rlrp = makeElement("span", {class: "response", id: "rlrp", title: "Right letter right place. A letter could be in the first position in both words, for example." });
    rlrp.innerHTML = 'rlrp';
    wrap.insertBefore(rlrp, wrap.childNodes[0]);
	
    var rlwp = makeElement("span", {class: "response", id: "rlwp", title: "Right letter wrong place. A letter could be in the first position in the word and the second position in the guess, for example."});
    rlwp.innerHTML = 'rlwp';
    wrap.insertBefore(rlwp, wrap.childNodes[1]);
};
WordGame.prototype.addInputs = function (wrap) { // add the bottom inputs
    var guessinputp = makeElement("p", {class: "bottom-guess-inputs", id: game.gameName + "-bottom-guess-inputs"}, wrap);
	
	makeElement("input", {type: "text", class: "guess-input", id: game.gameName + "-guess-input", maxlength: "5"}, guessinputp)
	$(".guess-input").on("keyup", {name: game.gameName + "-guess-button"}, submitForm);
    
	makeElement("input", {class: "guess-button", id: game.gameName + "-guess-button", type: "submit", value: "Submit guess!"}, guessinputp);
    $(".guess-button").on("click", game.submitGuess);
};

WordGame.prototype.setup = function (previous) { // generic code to setup the game wrappers and then move onto a more specific next step
	this.makeGameEl(); // make and set instance vars to game container information
    this.extraSetup(); // extra stuff to be setup?
	if (typeof previous != "undefined") { // if there was a previous game passed
		for (var i = 0; i < saveFields.length; i++) { // for each of the saved fields
			game[saveFields[i]] = previous[saveFields[i]]; // set the game variable to that
		}
		this.continueGame(); // continue the game (animate to previous spot), don't setup anew
	}
	else { // if there is no previous game to load, set all the settings to initial values and start with the first guess
		this.guesses = [];
		this.letterColors = [];
		this.specialLetters = { top: ["", "", "", "", ""], tentative: [], eliminated: []} ; // top row
		this.gameSettings = { autoGreen: true, autoOrange: true, autoRed: true, autoRedOnGuess: true, fontSize: true, autoSave: ( (canLocalStorage() == false) ? false : true ) };
		this.pickWord(); 
	}
};
WordGame.prototype.extraSetup = function () { // nothing to see here, just compensating for lack of super keyword in JS
};
WordGame.prototype.setupFirstGuess = function () { // set up the first guess screen, works for all games just happens later for MultiGame
	var firstguesswrapper = makeElement("div", {id: this.gameName + "-first-guess-wrapper", class: "first-guess-wrapper hidden-game"}, game.gameEl);
    
    var firstguess = makeElement("p", {class: "first-guess", id: this.gameName + "-first-guess"}, firstguesswrapper);
    if (this.gameName == 'time')
        firstguess.innerHTML = 'First guess:<p class = "small-notice">(Timer starts after you submit)</p>';
	else
		firstguess.innerHTML = 'First guess:';
    
    this.addInputs(firstguesswrapper);
    this.animateToFirstguess();
};


WordGame.prototype.submitGuess = function () { // when a guess is submitted, check for validity and other things
    game.extraEnterGuess();
	var guessEl = document.getElementById(game.gameName + "-guess-input");
	var guess = guessEl.value.toLowerCase();
	var valid = game.isValidWord(guess);
	if (valid == true) { // it's a valid guess
		game.guesses.push(guess); // add it to the list of guesses
		guessEl.placeholder = (game.maxGuesses - game.numberOfGuesses()) + ' guess' + ((game.numberOfGuesses() == 9) ? '' : 'es') + ' left'; // update the input placeholder
		guessEl.value = ""; // empty the input
		if (beach(game.getWord()) == guess) // if the guess is correct
			game.gameWon();
		else if (game.numberOfGuesses() == game.maxGuesses) // if that's the last guess and incorrect
			game.gameLost();
		else { // the guess needs to be added
			game.letterColors.push(["", "", "", "", ""]);
			
			var rowToAdd = game.guessFeedback(guess);
			
			if (game.numberOfGuesses() == 1) {
				game.addResponseTitles(game.gameContainer);
				game.addInputs(game.gameContainer);
				game.animateFromFirstGuess();
			}
			else {
				$(rowToAdd).addClass('hidden-game');
				game.animateGuess(rowToAdd);
			}
			return rowToAdd;
		}
	}
	else { // guess is invalid, share why
		var close; // timer to close
        $('#popup').popup({ // create a popup to tell them it's invalid
            content : function () { 
                    return buildPopup(
                                    "Word is invalid!",
                                    valid + "<br /><br />game closes automatically in 3 seconds",
                                    "Continue",
                                        "$('#popup').data('popup').close();"
            )},
            beforeOpen : function ()
            {
                $('#' + game.gameName + '-guess-input').blur();
                $(document).on('keydown', function (event) {
                    if (event.keyCode == 13)
                        $('#popup').data('popup').close();
                });
            },
            afterOpen : function() {
                close = setTimeout("$('#popup').data('popup').close();", 3000);
                $(".popup_cont").draggable({
                    handle: ".popup-title"
                });
            },
            afterClose : function () {
                clearTimeout(close);
                game.focusInput();
                $(document).off('keydown', null, null);
            }
        }); 
        $('#popup').data('popup').open();
	}
};
WordGame.prototype.guessFeedback = function (guess) { // determine the row's contents
	window.onbeforeunload = confirmOnPageExit; // asks to make sure they want to reload, but only after the first guess
	
	var rowToAdd = makeElement("div", { class: "word-row" }); // make the row we're going to add
	rowToAdd.innerHTML = game.line; // set the default line for now
	
	var rlrp = 0, rlwp = 0; // feedback totals
	for (var i = 0; i < 5; i++) { // for the guess
		var letter = guess.charAt(i); // get the specific letter we're talking about
		rowToAdd.getElementsByClassName('word-col')[i].innerHTML = letter; // set the letter element to the letter
		if (beach(game.getWord()).search(letter) != -1) { // if the letter is found
			if (beach(game.getWord()).search(letter) == i) // if the letter is in the same index, right place
				rlrp++;
			else // if not, wrong place
				rlwp++;
		}
	}
	
	// feedback determined, so set them each
	rowToAdd.getElementsByClassName('response')[0].innerHTML = rlrp; // rlrp
	rowToAdd.getElementsByClassName('response')[1].innerHTML =  rlwp; // rlwp

	if (rlrp + rlwp == 0) { // if the setting to autored if 0 rl is enabled
		for (var i = 0; i < rowToAdd.getElementsByClassName('word-col').length; i++)
			game.letterColors[game.guesses.indexOf(guess)][i] = "eliminated";
	}
	
	game.wordRows.push(rowToAdd); // add it to the wordRows array
	game.gameContainer.insertBefore(rowToAdd, game.gameContainer.childNodes[game.gameContainer.childNodes.length-1]); // append the row before the bottom inputs
	
	$( ".word-col" ).draggable({
		helper: function(event) {
			var ret = $(this).clone().appendTo(game.gameEl);
			$(this).toggleClass("ghost");
			return ret;
		},
		stop: function (event, ui) {
			$(this).toggleClass("ghost");
		},
		distance: 20
	}); // make sure the letters draggable
	
	game.updateColors();
	
	return rowToAdd;
};
WordGame.prototype.extraEnterGuess = function () {
};

WordGame.prototype.animateGuess = function (rowToAdd) { // animate an entered guess in all games
    $("#" + game.gameName + "-game-wrapper").animate({
        'height': ($("#" + game.gameName + "-game-wrapper").height() + $(".word-row").first().outerHeight() + ((game.gameName == "time") ? parseInt($("#time-bottom-guess-inputs").css('margin-bottom')) : 0)) + 'px'
    }, 750);
    $("#" + game.gameName + "-bottom-guess-inputs").animate({
            'bottom': '-' + $(".word-row").first().outerHeight() + 'px'
    }, 750, function() {
        $("#" + game.gameName + "-game-wrapper").css('height', 'auto');
        $(rowToAdd).fadeIn().removeClass('hidden-game');
        $("#" + game.gameName + "-bottom-guess-inputs").css("bottom", "0px");
    });
};
WordGame.prototype.animateToFirstguess = function () { // animate to the first guess input screen
	$("#" + game.gameName + "-game").animate({
        'height': $("#" + game.gameName + "-first-guess-wrapper").actualHeight() + 'px',
        'padding-top': '24px',
        'padding-bottom': '20px'
    }, function() {
        $("#" + game.gameName + "-first-guess-wrapper").fadeIn().removeClass('hidden-game');
        game.focusInput();
    });
};
WordGame.prototype.animateFromFirstGuess = function () { // animate the first guess which is different because of the enter first guess screen
	
	$("#" + this.gameName + '-first-guess-wrapper').animate({
        'opacity': '0'
    }, function() {
        $("#" + game.gameName + '-first-guess-wrapper').remove();
        $("#" + game.gameName + '-game').animate({
            'height': '0px',
            'padding-top': '0px',
            'padding-bottom': '0px'
        }, function() {
            game.expandContainer();
        });
    });
};
WordGame.prototype.expandContainer = function () { // expand the game container to fit the size of the guesses
	$("#" + game.gameName + "-game").animate({
		'height': $("#" + game.gameName + "-game-wrapper").actualHeight() + 'px',
		'padding-top': '20px',
		'padding-bottom': '20px'
	}, function() {
		$("#" + game.gameName + "-game-wrapper").fadeIn().removeClass('hidden-game').css("height", "auto");
		$("#" + game.gameName + "-game").css("height", "auto");
		game.focusInput().attr('placeholder', ((game.maxGuesses - game.numberOfGuesses()) + ' guess' + ((game.numberOfGuesses() == 9) ? '' : 'es') + ' left'));
		$("#font-size, #settings-button").fadeIn();
		game.focusInput();
	});
};

WordGame.prototype.letterDropped = function (holder, letter) { // when a green letter is dropped into a holder
	var holderCol = $(holder).index(); // get the column we're being dropped into
	var letterRow = letter.parent().index()-1;
	letter = letter.text();
	holder = $(holder);
	var previous = holder.text(); // either a letter or ""
	
	if ($.inArray(letter, game.specialLetters["eliminated"]) !== -1 && game.gameSettings.autoRed == true)
		return;
	if ($.inArray(letter, game.specialLetters["top"]) !== -1)
		return
	
	game.specialLetters['top'][holderCol] = letter;
	holder.text(letter); // set the holders text
	
	game.updateColors();
};
WordGame.prototype.clickHolder = function (event) {
	var letter = event.target.innerHTML;
	var col = $(event.target).index();
			
	if (letter == "") { // trying to input a letter potentially from that column
		var done = false; // tracking the first green letter
		for (var i = 0; i < game.wordRows.length; i++) { // for each row
			var el = game.wordRows[i].getElementsByClassName("word-col")[col]; // get the element because we already know the column
			if ($(el).hasClass("green") == true) { // if a letter has green class
				if (done == false) { // if this is the first letter
					game.specialLetters['top'][col] = el.innerHTML; // add it to the top
					event.target.innerHTML = el.innerHTML; // set the text
					done = true; // no more
				}
				else // remove the color because we just took the first one
					game.letterColors[i][col] = "";
			}
		}
	}
	else { // trying to remove a letter by clicking an occupied slot
		game.specialLetters['top'][col] = "clear_" + letter; // set the info tag specifically so we know what to look for and remove in updateColors()
		event.target.innerHTML = ""; // set the top bar to blankness
	}
	game.updateColors();
};

WordGame.prototype.highlightLetter = function (el) { // highlight the letters when clicked, red -> yellow -> orange -> green -> normal -> yellow...
	el = $(el); // jQuery-ify
	
	var color = "tentative_" + game.numberOfGuesses();
	if (el.hasClass('green'))
		var color = "";
    else if (el.hasClass('yellow'))
		color = "orange";
    else if (el.hasClass('orange'))
        color = "green";
    else if (el.hasClass('red'))
        color = "yellow";
		
	game.letterColors[$('.word-row').index(el.parent())][el.index()] = color;
	game.updateColors();
};
WordGame.prototype.updateColors = function (reset) { // update the colors on all the letters based on their inclusion in tentativeEliminations, eliminations, or greenLetters. If remove is passed, color is removed on matching letters of said color
	var restart = false;
	for (var i = 0; i < game.wordRows.length; i++) { // for each row of color information
		var row = game.wordRows[i];
		for (var x = 0; x < game.letterColors[i].length; x++) { // for each individual letter's color info
			var el = row.getElementsByClassName("word-col")[x];
			
			if (game.letterColors[i][x] == "eliminated") {
				if (game.gameSettings.autoRed == true)
					game.letterColors[i][x] = "red";
				else if (game.gameSettings.autoRed == false && typeof reset != "undefined")
					game.letterColors[i][x] = "";
				if ($.inArray(el.innerHTML, game.specialLetters["eliminated"]) === -1) {
					game.specialLetters["eliminated"].push(el.innerHTML);
					for (var z = 0; z < game.specialLetters['tentative'].length; z++) {
						if (game.specialLetters['tentative'][z] == el.innerHTML)
							game.specialLetters['tentative'].splice(z, 1);
					}
					restart = true;
				}
			}
			else {
				for (var y = 0; y < game.specialLetters['eliminated'].length; y++) {
					if (game.specialLetters['eliminated'][y] == el.innerHTML) {
						if (game.gameSettings.autoRed == true)
							game.letterColors[i][x] = "red";
						else if (game.gameSettings.autoRed == false && typeof reset != "undefined")
							game.letterColors[i][x] = "";
					}
				}
			}

			for (var y = 0; y < game.specialLetters['top'].length; y++) {
				if (game.specialLetters['top'][y] == el.innerHTML) {
					if (game.gameSettings.autoGreen == true) {
						if (game.gameSettings.autoOrange == true && $(el).index() != y)
							game.letterColors[i][x] = "orange";
						else
							game.letterColors[i][x] = "green";
					}
					else if (game.gameSettings.autoGreen == false && typeof reset != "undefined")
						game.letterColors[i][x] = "";
				} else if (game.specialLetters['top'][y].search("clear") > -1) { // clear that letter
					var letter = game.letterColors[i][x].split("_")[1]; // letter to clear
					if ((game.gameSettings.autoOrange == true && y != x && $(el).hasClass("orange")) || (game.gameSettings.autoGreen == true && y == x && $(el).hasClass("green")) || (game.gameSettings.autoGreen == true && y == x && $(el).hasClass("green"))) // if autoOrange is enabled and the column is different from the holder and the letter is orange, remove it
						game.letterColors[i][x] = "";
					if (i+1 == game.wordRows.length && x+1 == game.letterColors[i].length) // if this is the last row and column, we can remove the message to remove this letter
						game.specialLetters['top'][y] = "";
				}
			}
			
			if (game.letterColors[i][x].search("tentative") > -1) {
				var num = parseInt(game.letterColors[i][x].split("_")[1]); // number associated
				if (num < game.numberOfGuesses()) { // this means we can add it
					if (game.gameSettings.autoRedOnGuess == true)
						game.letterColors[i][x] = "red";
					else if (game.gameSettings.autoRedOnGuess == false && typeof reset != "undefined")
						game.letterColors[i][x] = "";
					if ($.inArray(el.innerHTML, game.specialLetters["tentative"]) === -1) {
						game.specialLetters["tentative"].push(el.innerHTML);
						restart = true;
					}
				}
			}
			else {
				for (var y = 0; y < game.specialLetters['tentative'].length; y++) {
					if (game.specialLetters['tentative'][y] == el.innerHTML) {
							if (game.gameSettings.autoRedOnGuess == true)
								game.letterColors[i][x] = "red";
							else if (game.gameSettings.autoRedOnGuess == false && typeof reset != "undefined")
								game.letterColors[i][x] = "";
					}
				}
			}
			
			var colorclass = game.letterColors[i][x];
			
			if (colorclass.search("tentative") > -1 || colorclass == "eliminated") // double check catch all
				colorclass = "red";
			
			if ($(el).hasClass(colorclass) != true && colorclass != "") {
				//console.log("added " + colorclass + " to " + $(el).text() + " in row " + i + " column " + x);
				game.addColor($(el), colorclass);
			}
			else if (colorclass == "")
				game.removeColors($(el));
		}
		if (restart == true)
			i = -1, x = 0, restart = false;
	}
	game.saveGame();
};
WordGame.prototype.addColor = function (el, color) { // expects jQuery-ified element, will remove all other colors
	el.removeClass('red yellow orange green').addClass(color);
};
WordGame.prototype.removeColors = function (el) { // expects jQuery-ified element, will remove all colors
	$(el).removeClass('red yellow orange green');
};

WordGame.prototype.gameWon = function () { // popup telling player game is won!
    window.onbeforeunload = null;
    clearSave();
    if (game.guesses[game.numberOfGuesses()-1] == beach(game.getWord())) { // verify
        $('#popup').popup({
            content : function () {
                    var text = game.gameWonMessage() + " Play @FivesWordGame at http://fives.jondolan.me!";
                    return buildPopup(
                                    "Congrats, you won!",
                                    "Do you want to tweet about your victory?<div class = 'popup-tweet'>" + text + "</div>",
                                    "Tweet it!",
                                        "clearSave(); location.href='https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "'",
                                    "New game",
                                        "$('#popup').data('popup').close();"
            )},
            beforeOpen: function() {
                scrollToTop();
                $('#' + game.gameName + '-guess-input').blur();
            },
            afterClose: function() { // in case they didn't select either, or selected new game, regardless make a new game
                location.reload();
            },
            afterOpen: function() {
               $(".popup_cont").draggable({
                    handle: ".popup-title"
                });
            }
        }); 
        $('#popup').data('popup').open();
    }
    else
        return "haven't won yet :P";
};
WordGame.prototype.gameLost = function () { // popup telling them the game is over
	$('#popup').popup({ // create a popup
		content : function () { 
				return buildPopup(
								"You lost :(",
								"That was your last guess! The word was " + beach(game.getWord()),
								"Try again!",
									"$('#popup').data('popup').close();"
		)},
		beforeOpen: function() {
			window.onbeforeunload = null; // don't want to be confirmed to reload twice
			$('#' + game.gameName + '-guess-input').blur();
			$(document).on('keydown', function (event) {
				if (event.keyCode == 13)
					$('#popup').data('popup').close();
			});
		},
		afterOpen : function() {
			$(".popup_cont").draggable({
				handle: ".popup-title"
			});
			clearSave(); // clear the game save
		},
		afterClose : function () {
			location.reload();
		}
	}); 
	$('#popup').data('popup').open();
}
WordGame.prototype.gameWonMessage = function () { // the message to be displayed
    if (game.guesses[game.numberOfGuesses()-1] == beach(game.getWord()))
        return "I won a #Fives \"" + game.fancyName + "\" game in " + game.numberOfGuesses() + " " + ((game.numberOfGuesses() == 1) ? "guess" : "guesses") + "! The word was " + beach(game.getWord()) + ".";    
    else
        return "haven't won yet :P";
};

WordGame.prototype.showSettings = function () { // show a settings pane
    $('#popup').popup({
            content : function () {
                        return buildPopup(
                                        "Settings", 
                                        "<p class = 'switch-p'>Auto green same letters when letter placed in top holder:</p>" + game.buildSwitch("autoGreen", "game.toggleSettingsHandler") + "<br /><br />"
                                            + "<p class = 'switch-p'>^Make the same letters in different columns orange instead:</p>" + game.buildSwitch("autoOrange", "game.toggleSettingsHandler") + "<br /><br />"
                                            + "<p class = 'switch-p'>Auto red if the word has 0 rlwp and rlrp:</p>" + game.buildSwitch("autoRed", "game.toggleSettingsHandler") + "<br /><br />"
                                            + "<p class = 'switch-p'>Auto red letters that you make red (applied after next guess is submitted):</p>" + game.buildSwitch("autoRedOnGuess", "game.toggleSettingsHandler") + "<br /><br />"
                                            + "<p class = 'switch-p'>Show the font size changer: </p>" + game.buildSwitch("fontSize", "game.toggleSettingsHandler") + "<br /><br />"
                                            + "<p class = 'switch-p'>Allow game saving (will delete current game save): </p>" + game.buildSwitch("autoSave", "game.toggleSettingsHandler"),
                                        "Apply",
                                            "$('#popup').data('popup').close();"
            )},
            beforeOpen : function () {
                $('#' + game.gameName + '-guess-input').blur();
                $(document).on('keydown', function (event) {
                    if (event.keyCode == 13)
                        $('#popup').data('popup').close();
                });
            },
            afterOpen : function() {
                $(".popup_cont").draggable({
                    handle: ".popup-title"
                });
            },
            afterClose : function () {
                game.focusInput()
                $(document).off('keydown', null, null);
                game.applySettings();
            }
        }); 
        $('#popup').data('popup').open();
};
WordGame.prototype.toggleSettingsHandler = function (el) { // toggle a setting
    if (el.id == "autoOrange" && el.checked == true && game.gameSettings.autoGreen != true) { // cannot make the columns orange if you don't want them green in the first place
        el.checked = false;
        return;
    }
    else if (el.id == "autoGreen" && game.gameSettings.autoOrange == true) {
        document.getElementById('autoOrange').checked = false;
        game.gameSettings.autoOrange = false;
    }
	else if (el.id == "autoSave")	
		if (canLocalStorage() == false)
			el.checked = false;
    game.gameSettings[el.id] = el.checked;
};
WordGame.prototype.applySettings = function () { // actually apply those settings, only needed for fontSize
    if (game.gameSettings.fontSize == true)
        $("#font-size").fadeIn();
    else
        $("#font-size").fadeOut();
        
	game.updateColors(true);
        
    if (game.gameSettings.autoSave == false)
        clearSave();
    else
        game.saveGame();
};
WordGame.prototype.buildSwitch = function (id, clickFunction) { // build an on off switch
    var enabled = game.gameSettings[id];
    return '<div class="onoffswitch"><input type="checkbox" onclick = "' + clickFunction + '(this)" name="' + id + '" class="onoffswitch-checkbox" id="' + id + '" ' + ((enabled) ? "checked" : "") + '><label class="onoffswitch-label" for="' + id + '"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div>'
};

WordGame.prototype.saveGame = function () { // saves the current game state to a cookie
	if (game.gameSettings.autoSave == true && canLocalStorage() != false) {
        for (var i = 0; i < saveFields.length; i++) {
			if (saveFields[i] == "word" || saveFields[i] == "fancyName")
				localStorage.setItem(waves(saveFields[i]), waves(game[saveFields[i]]));
			else
				localStorage.setItem(waves(saveFields[i]), waves(JSON.stringify(game[saveFields[i]])));
        }
		localStorage.setItem(waves("time"), waves(new Date().getTime()));
	}
};
function clearSave () { // clears a game cookie
	if (canLocalStorage() != false) {
		var settings = localStorage.getItem(waves("gameSettings"));
		localStorage.clear();
		localStorage.setItem(waves("gameSettings"), settings);
	}
};
WordGame.prototype.continueGame = function () {
	var wrap = document.getElementById(game.gameName + '-game-wrapper');
	game.addResponseTitles(wrap);
	game.addInputs(wrap);
	for (var i = 0; i < game.numberOfGuesses(); i++) {
		var temprow = game.guessFeedback(game.guesses[i]);
	}
	for (var i = 0; i < $(".holder").length; i++) {
		$(".holder")[i].innerHTML = game.specialLetters['top'][i];
	}
	game.expandContainer();
};



function RegularGame(word) {// create more specific RegularGame class, no difference from WordGame though, just a formality
    this.base = WordGame;
    this.base('regular');
};
RegularGame.prototype = new WordGame; // set the inheritance chain



function EasyGame(word) {// create more specific EasyGame class (called Practice)
    this.base = WordGame;
    this.base('easy');
    this.line = '<span class = "easy-word-col"></span><span class = "easy-word-col"></span><span class = "easy-word-col"></span><span class = "easy-word-col"></span><span class = "easy-word-col"></span></span>';
};
EasyGame.prototype = new WordGame; // set the inheritance chain
EasyGame.prototype.addResponseTitles = function (wrap) { // do nothing! No rlrp and rlwp feedback
};
EasyGame.prototype.guessFeedback = function (guess) { // override the typical enterGuess method because feedback is different
	window.onbeforeunload = confirmOnPageExit; // asks to make sure they want to reload, but only after the first guess
	var rowToAdd = makeElement("div", { class: "word-row" }); // make the row we're going to add
	rowToAdd.innerHTML = game.line; // set the default line for now
	
	for (var i = 0; i < 5; i++) {
        var letter = guess.charAt(i);
        rowToAdd.getElementsByClassName('easy-word-col')[i].innerHTML = letter;
        if (beach(this.getWord()).search(letter) != -1) {
            if (beach(this.getWord()).search(letter) == i)
            {
                $(rowToAdd.getElementsByClassName('easy-word-col')[i]).addClass('green');
                $(".holder")[i].innerHTML = letter;
				game.specialLetters['top'][i] = letter;
            }
            else
                $(rowToAdd.getElementsByClassName('easy-word-col')[i]).addClass('yellow');
        }
    }
	game.wordRows.push(rowToAdd); // add it to the wordRows array
	game.gameContainer.insertBefore(rowToAdd, game.gameContainer.childNodes[game.gameContainer.childNodes.length-1]); // append the row before the bottom inputs	
	
	game.saveGame();
	
	return rowToAdd;
};
EasyGame.prototype.clickHolder = function () {
};
EasyGame.prototype.updateColors = function () {
};



function TimeGame(word) {// create more specific TimeGame class
    this.base = WordGame;
    this.base('time');
    this.maxGuesses = 15;
    this.reloadMessage = "Progress will be LOST if you leave or reload the game!";
};
TimeGame.prototype = new WordGame; // set the inheritance chain
TimeGame.prototype.extraSetup = function () { // add a time element
    var timer = makeElement("div", { class: "timer", id: game.gameName + "-timer" }); 
    timer.innerHTML = "0:00";
    game.timerSecs = 0;
    game.timerMins = 0;
    game.timeLeap = 0;
    
    $(game.gameContainer).prepend(timer);
};
TimeGame.prototype.extraEnterGuess = function () { // start timer
    if (typeof game.gameInterval == "undefined")
        game.gameInterval = setInterval('updateTimer()', 1000);
};
function updateTimer() { // interval to update the timer every one second
    var timeDif = (new Date().getTime()) - game.lastTime;
    var timer = $("#" + game.gameName + "-timer");
    var secs = game.timerSecs+1;
    var mins = game.timerMins;
    if (timeDif > 1000)
        game.timeLeap += timeDif-1000;
    if (game.timeLeap >= 1000)
    {
        secs += 1;
        game.timeLeap -= 1000;
    }
    else if (game.timeLeap < 0) // hackers...(applause)
        game.timeLeap = 0;
    var elementSecs = parseInt(timer.text().split(':')[1])+1;
    var elementMins = parseInt(timer.text().split(':')[0]);
    if (elementSecs > secs)
        secs = elementSecs;
    if (elementMins > mins)
        mins = elementMins;
    if (secs >= 60)
    {
        mins++;
        secs = 0;
    }
    timer.text(mins + ":" + ((secs < 10) ? "0" : "") + secs); 
    game.timerSecs = secs;
    game.timerMins = mins;
    game.lastTime = new Date().getTime();
}
TimeGame.prototype.gameWonMessage = function () {
    clearInterval(game.gameInterval);
    return "I won a #Fives \"" + game.fancyName + "\" game in " + ((game.timerMins == 0) ? "" : (game.timerMins + " " + (((game.timerMins == 1) ? "minute" : "minutes") + " and "))) + game.timerSecs + " " + ((game.timerSecs == 1) ? "second" : "seconds") + "! The word was " + beach(game.getWord()) + ".";    
};
TimeGame.prototype.saveGame = function () { // do nothing, no saving, that would be cheating time
};



function MultiGame(word) {// create more specific MultiGame class
    this.base = WordGame;
    this.base('multi');
};
MultiGame.prototype = new WordGame; // set the inheritance chain
MultiGame.prototype.pickWord = function() { // override the typical selecting of the word to setup word input
    var setup = makeElement("div", { id: game.gameName + "-setup-wrapper", class: "hidden-game" }, game.gameEl);
    
    var typewordMessage = makeElement("div", { class: "first-guess" }, setup);
    typewordMessage.innerHTML = 'Word to be guessed:<p class = "small-notice">(will not be shown again)</p>';
    
    var inputp = makeElement("p", { class: "bottom-guess-inputs" }, setup);
    var inputField = makeElement("input", { class: "text", id: game.gameName + "-word-input", maxlength: "5", type: "password" }, inputp);
    var inputSubmit = makeElement("input", { class: "button", id: "submit-multi-word", value: "Play!", type: "submit" }, inputp);
	
	$("#multi-word-input").on("keyup", {name: "submit-multi-word"}, submitForm);
    
    $("#submit-multi-word").on("click", function () {
		document.getElementById(game.gameName + '-word-input').removeAttribute('onkeyup');
		game.submitMultiWord()
	});
    
    $("#" + this.gameName + "-game").animate({ // animate the setup in
        'height': $("#" + this.gameName + "-setup-wrapper").actualHeight() + 'px',
        'padding-top': '20px',
        'padding-bottom': '20px'
    }, function() {
        $("#" + game.gameName + "-setup-wrapper").fadeIn().removeClass('hidden-game');
        $("#" + game.gameName + "-game").css("height", "auto");
        inputField.focus(); // focus the input
    });
};
MultiGame.prototype.submitMultiWord = function() { // submit the word to be played
    var elementID = "multi-word-input";
	var input = $("#" + elementID).val().toLowerCase(); // get the word
    var valid = game.isValidWord(input);
    if (valid == true) {
        game.setWord(input);
        $("#" + game.gameName + "-setup-wrapper").animate({
            'opacity': '0'
        }, function() {
            $("#" + game.gameName + "-game").animate({
                'height': '0px',
                'padding-top': '0px',
                'padding-bottom': '0px'
            }, function() {
                $("#" + game.gameName + "-setup-wrapper").remove();
                game.setupFirstGuess();
            });
        });
    }
    else { // word is invalid
        document.getElementById(game.gameName + '-word-input').setAttribute('onkeyup', "submitForm(event, 'submit-multi-word');");
        var close;
        $('#popup').popup({ // create a popup to tell them it's invalid
            content : function () { 
                    return buildPopup(
                                    "Word is invalid!",
                                    valid + "<br /><br />This closes automatically in 3 seconds",
                                    "Continue",
                                        "$('#popup').data('popup').close();"
            )},
            beforeOpen : function ()
            {
                $('#' + game.gameName + '-word-input').blur();
                $(document).on('keydown', function (event) {
                    if (event.keyCode == 13)
                        $('#popup').data('popup').close();
                });
            },
            afterOpen : function() {
                close = setTimeout("$('#popup').data('popup').close();", 3000);
               $(".popup_cont").draggable({
                    handle: ".popup-title"
                });
            },
            afterClose : function () {
                clearTimeout(close);
                $('#' + game.gameName + '-word-input').focus();
                $(document).off('keydown', null, null);
            }
        }); 
        $('#popup').data('popup').open();
    }
};

function startGame (name, continuation) { // start the game, grow the corresponding game container, initiate various other features
    scrollToTop(); // scroll to the top of the document

    /* Key bindings for clicking letters */
    $("#game-container").on('click', '.word-col', function(){game.highlightLetter(this);});
    
    Hash.go('gametime'); // track game
	
    if (name == 'multi' || name == 'multiplayer')
        game = new MultiGame();
    else if (name == 'easy' || name == 'practice')
        game = new EasyGame();
    else if (name == 'regular' || name == 'classic')
        game = new RegularGame();
    else if (name == 'time' || name == 'time trial')
        game = new TimeGame();
       
    var element = document.getElementById(game.gameName + '-start-button'); // get the element that was clicked
    
    if (typeof ga != "undefined" && typeof continuation == "undefined") // send a play event if ga is defined
        ga('send', 'event', 'game', 'play', game.gameName);
        
    $("#how-to-container").fadeOut(1000); // fade out the how-to
    
    $(element).css("z-index", "10"); // make the button that was pressed end up on top

    $(".new-game-buttons").each(function(index, el) { // animations
        if (element !== el) {
            $(el).off('click'); // remove the onclick
            $(el).animate({ // do some fancy animations!
                left: $(element).position().left - $(el).position().left + 'px',
                top: $(element).position().top - $(el).position().top + 'px'
            }, 1000, function() {
                if (index == $(".new-game-buttons").length-1 || ($(".new-game-buttons")[$(".new-game-buttons").length-1] == element && index == $(".new-game-buttons").length-2))
                {
                    $("#new-game").animate({
                        'height': '0px',
                        'padding': '0px',
                        'opacity': 0
                    }, 750, function()
                    {
                        $("#new-game").remove();
                            if (typeof continuation != "undefined") {
                                game.setup(continuation);
							}
                            else {
                                game.setup();
							}
                    });
                }
            });
        }
        
    });  
}

/* Helper functions */
String.prototype.repeatedLetters = function () { // is the word invalid because letters are duplicated?
   for (var i = 0; i < this.length; i++) {
       if (this.indexOf(this.substring(i, i+1)) != -1 && this.indexOf(this.substring(i, i+1)) != i) {
           return true;
       }
    }
    return false;
};
Array.prototype.binarySearch = function (find) { // binary search the array of words
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
$.fn.actualHeight = function(){ // determine the height of a hidden element
    // find the closest visible parent and get it's hidden children
    var visibleParent = this.closest(':visible').children(),
        thisHeight;
    
    // set a temporary class on the hidden parent of the element
    visibleParent.addClass('temp-show');
    
    // get the height
    thisHeight = this.height();
    
    // remove the temporary class
    visibleParent.removeClass('temp-show');
    
    return thisHeight;
};
function submitForm (event) {  // submit the form by hitting enter
	if (event.keyCode == 13)
		document.getElementById(event.data.name).click();
}
var confirmOnPageExit = function (e) { // a popup message that lets the user know why reloading/leaving is bad!
    e = e || window.event;
    var message = game.reloadMessage;
    if (e) 
    {
        e.returnValue = message;
    }
    return message;
};
function enableClickButtons() { // enable the big buttons to start a game (disabled at first because of cookie popup)
    $("#easy-start-button").click(function(){startGame('easy')});
    $("#regular-start-button").click(function(){startGame('regular')});
    $("#time-start-button").click(function(){startGame('time')});
    $("#multi-start-button").click(function(){startGame('multi')});
}
function buildPopup(title, body, button1, button1action, button2, button2action) { // build a generic popup, saves code
    var el = makeElement("div", { class: "center" });

    var h2 = makeElement("h2", { class: "popup-title" }, el);
    h2.innerHTML = title;

    var message = makeElement("div", { class: "popup-message" }, el);
    message.innerHTML = body;

    if (typeof button1 != "undefined") {
        var but1 = makeElement("span", { class: 'popup-button ' + ((typeof button2 == "undefined") ? 'one' : ''), onclick: button1action }, el);
        but1.innerHTML = button1;
    }
    
    if (typeof button2 != "undefined") {
        var but2 = makeElement("span", { class: "popup-button", onclick: button2action }, el);
        but2.innerHTML = button2;
    }   
    return el;
}
function makeElement (tag, attributes, appendTo) { // returns an element with the given characteristics
	//console.log("making a " + tag);
	var el = document.createElement(tag);
	$.each(attributes, function (key, value) {
		el.setAttribute(key, value);
	});
	if (typeof appendTo != "undefined")
		$(appendTo).append(el);
	return el;
};
function hashHandler(newHash, initial) { // handles the game state and makes a popup to confirm if the back button is pressed
	if (!initial) {
		if (newHash == "" && (typeof game !== "undefined")) {
			window.onbeforeunload = null;
			$('#popup').popup({
				content : function() {
						return buildPopup(
										"You sure?",
										"Are you sure you want to quit this game?<br />Progress will be lost.",
										"Yes, quit",
											"clearSave(); location.reload();",
										"No, save me!",
											"window.onbeforeunload = confirmOnPageExit; $('#popup').data('popup').close(); Hash.go('gametime');"
				)},
				afterOpen: function() {
					$(".popup_cont").draggable({
						handle: ".popup-title"
					});
				}
			}); 
			$('#popup').data('popup').open();
		}
	}
	else
		Hash.go('');
}
function scrollToTop() { // simple enough?
    $("html, body").animate({
        scrollTop: 0
    });
}   
function fontSizeChange(el) { // change the font size of the page based on the user clicking
    if (el.id == "increase")
        $("#" + game.gameName + "-game-wrapper").css('font-size', (parseInt($("#" + game.gameName + "-game-wrapper").css('font-size'))+5)+'px');
    else if (el.id == "decrease")/* TODO, rewrite inline */
        $("#" + game.gameName + "-game-wrapper").css('font-size', (parseInt($("#" + game.gameName + "-game-wrapper").css('font-size'))-5)+'px');
}

function canLocalStorage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
function GameLoader () {
	var previous = {};
	try {
		for (var i = 0; i < saveFields.length; i++) {
			if (localStorage.getItem(waves(saveFields[i])))
				previous[saveFields[i]] = beach(localStorage.getItem(waves(saveFields[i])));
			else
				return 0;
		}
		// sanitize
		if (WordGame.prototype.isValidWord(beach(previous.word)) != true)
			return;
		previous.guesses = JSON.parse(previous.guesses);
		for (var i = 0; i < previous.guesses.length; i++) {
			if (WordGame.prototype.isValidWord(previous.guesses[i]) != true)
				return;
		}
		previous.letterColors = JSON.parse(previous.letterColors);
		$.each(previous.letterColors, function (key, value) {
			if (value.length != 1 || value != "")
				$(this).remove();
		});
		previous.specialLetters = JSON.parse(previous.specialLetters);
		$.each(previous.specialLetters, function (key, value) {
			if (value.length != 1 || value != "")
				$(this).remove();
		});
		previous.gameSettings = JSON.parse(previous.gameSettings);
		previous.time = parseInt(beach(localStorage.getItem(waves("time"))));
		return previous; // made it this far, all checks out!
	}
	catch (e) {
		return;
	}
}

$(document).ready(function () { // when the document is ready, check if the browser allows cookies and if the user has a previous game...returns false if there is no previous game
	/*window.onerror = function(message, url, lineNumber) {
    alert("Please report this error!!: " + message + " on " + lineNumber);
		return true; // prevents browser error messages
	};*/
	
	window.applicationCache.addEventListener('updateready', function(e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY)
			window.location.reload();
	}, false);
	
	Hash.init(hashHandler, document.getElementById('hidden-iframe')); // setup the hash handler to do it's job

	if (canLocalStorage() != false) {
		var previous = GameLoader();
		//console.log(previous);
		if (previous != 0 && typeof previous != "undefined") {
			$('#popup').popup({ // create a popup to ask if they want to resume
                content : function () { 
                        return buildPopup(
                                        "Continue your last game?",
                                        "You have a saved " + previous.fancyName + " game from " + $.timeago(previous.time) + ".<br />You were on your " + (previous.guesses.length+1) + ((previous.guesses.length+1 == 1) ? "st" : (previous.guesses.length+1 == 2) ? "nd": (previous.guesses.length+1 == 3) ? "rd" : "th") + " guess.<br />Do you want to continue that game?",
                                        "Continue",
                                            "$('#popup').data('popup').close(); startGame('" + previous.fancyName + "', " + JSON.stringify(previous) + ");",
                                        "Discard Game",
                                            "clearSave(); $('#popup').data('popup').close();"
                )},
                beforeOpen: function() {
                    scrollToTop();
                },
                afterOpen: function() {
                    $(".popup_cont").draggable({
                        handle: ".popup-title"
                    });
                },
                afterClose : function () {
                    if (typeof game == "undefined") {
                        enableClickButtons();
						clearSave();
					}
                }
            }); 
            setTimeout("$('#popup').data('popup').open();", 500);
		}
		else {
			enableClickButtons();
			//clearSave();
		}
	}
	else {
		enableClickButtons();
	}
});
// Check if a new cache is available on page load.