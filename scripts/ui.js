var ANIMATIONSPEED = 2;
var OPACITYSPEED = .02;
function showAlert(name) // simple alert with given info
{
	if (name == "ack") // specific alert...
	{
		alert(
		"Font - http://www.dafont.com/forced-square.font"
		+ "\n\nWidth: "  + window.innerWidth + "px"
		+ "\nCheck changelog link for latest updates"
		+ "\nNext update: scratch pads"
		);
	}
}
function showPopup(element, event) // fancy popup
{
	hideDialog(); // hide other dialogs if applicable
	var newdiv = document.createElement('div'); // create a new element for our dialog
	newdiv.setAttribute('class','popup');	// yes, it's a popup so we want to apply the popup CSS
	newdiv.setAttribute('onclick','hideDialog()');	// hide it if it's clicked
	newdiv.style.left=event.clientX-58+"px";	// set the location relative to left of window
	newdiv.style.top=event.clientY-154+"px";	// top
	if (element.id == "multiplayer") // set text depending
		newdiv.innerHTML = 'This mode lets one player choose the word and the rest try to guess it. For each guess, the number of right letters in the right place and right letters in the wrong place are displayed.';
	if (element.id == "regular")
		newdiv.innerHTML = 'This mode lets the computer choose the word and players try to guess it. For each guess, the number of right letters in the right place and right letters in the wrong place are displayed.';
	if (element.id == "easy")
		newdiv.innerHTML = 'This mode lets the computer choose the word and players try to guess it. For each guess, letters in the correct place are highlighted green. Letters in the word, but in the wrong place, are highlighted yellow.';
	
	var hideme = document.createElement('div');	// create a sub div to be positioned on bottom
	hideme.setAttribute('class','hideme');	// get the CSS
	hideme.innerHTML = "Click in popup to hide";	// set the text
	
	document.getElementsByTagName('body')[0].appendChild(newdiv);	// add popup to body
	newdiv.appendChild(hideme);	// append the hide text
}
function hideDialog()	// hide any open dialogs
{
	var list = getElementsByClass('popup');	// get popups (if there are any)
	if (list.length > 0) // remove previous popups
	{
		for (var i = 0; i < list.length; i++)
		{
			list[i].parentNode.removeChild(list[i]);	// remove the popup from parent (body...probably)
		}
	}
}
function getElementsByClass(searchClass, domNode, tagName) // function adapted from the internet
{
    if (domNode == null) domNode = document;
    if (tagName == null) tagName = '*';
    var el = new Array();
    var tags = domNode.getElementsByTagName(tagName);
    var tcl = " "+searchClass+" ";
    for(i=0,j=0; i<tags.length; i++) { 
        var test = " " + tags[i].className + " ";
        if (test.indexOf(tcl) != -1) 
            el[j++] = tags[i];
    } 
    return el;
}
function shrinkAnimation(element, finalSize, paddingTop, paddingBottom, whenDone)
{
	if (element.style.height == '' || element.style.height == 'auto')	// element does not have any inline style for height and it wasn't passed to us
		element.style.height = (parseInt(element.clientHeight)-(paddingTop+paddingBottom))+"px";	// so we can determine it
	if (element.style.paddingTop == '' && paddingTop != false)
		element.style.paddingTop = paddingTop+'px';
	if (element.style.paddingBottom == '' && paddingBottom != false)
		element.style.paddingBottom = paddingBottom+'px';
	if (parseInt(element.style.height) <= finalSize+ANIMATIONSPEED)	// if it's close to being gone
	{
		element.style.height = finalSize;
		if (parseInt(element.style.paddingTop) > 0)
			element.style.paddingTop = (parseInt(element.style.paddingTop)-ANIMATIONSPEED)+'px';
		else if (parseInt(element.style.paddingBottom) > 0)
			element.style.paddingBottom = (parseInt(element.style.paddingBottom)-ANIMATIONSPEED)+'px';
		else
		{
			if (finalSize == 0)
				element.style.display = "none";
			whenDone();
			return;
		}
	}
	var list = element.childNodes;	// hide child nodes as they get swallowed
	for (i = 0; i < list.length; i++)	// for each child node
	{
		if (typeof list[i].tagName !== 'undefined' && list[i].getAttribute('class') !== 'do-not-hide')	// if it's actually an element (?)
		{
			// basically, if the bottom of the element hits the bottom of the box as it moves up
			if ((element.getBoundingClientRect().top + parseInt(element.style.height)) - (list[i].getBoundingClientRect().top + (list[i].clientHeight-10)) <= ANIMATIONSPEED)
			{
				list[i].style.display = "none";	// hide it
				delete list[i];	// remove from list
			}
		}
	}
	element.style.height = (parseInt(element.style.height)-ANIMATIONSPEED)+'px';	// decrease the size
	setTimeout(function(){ shrinkAnimation(element, finalSize, paddingTop, paddingBottom, whenDone)}, 10);	// recursion!
}

function growAnimation(element, initialSize, finalSize, paddingTop, paddingBottom, whenDone)	// grow a box
{
	var add = true;
	if (element.style.height == '' || element.style.height == 'auto' || parseInt(element.style.height) == 0)
	{
		if (initialSize == false)
			element.style.height = 0+'px';
		else 
			element.style.height = initialSize+'px';
		element.style.display="block";
	}
	if (element.style.paddingTop == '' && paddingTop != false)
		element.style.paddingTop = '0px';
	if (element.style.paddingBottom == '' && paddingBottom != false)
		element.style.paddingBottom = '0px';
	if (parseInt(element.style.height)+ANIMATIONSPEED >= finalSize)	// if it's done
	{
		add = false;
		element.style.height = finalSize + 'px';
		if (parseInt(element.style.paddingTop) < paddingTop)
			element.style.paddingTop = (parseInt(element.style.paddingTop)+ANIMATIONSPEED)+'px';
		else if (parseInt(element.style.paddingBottom) < paddingBottom)
			element.style.paddingBottom = (parseInt(element.style.paddingBottom)+ANIMATIONSPEED)+'px';
		else
		{
			if (paddingTop != 0 && paddingBottom != 0)
			{
				element.style.paddingTop = paddingTop + 'px';
				element.style.paddingBottom = paddingBottom + 'px';
			}
			element.style.height = 'auto';
			whenDone();
			return;
		}
	}
	if (add == true)
		element.style.height = (parseInt(element.style.height)+ANIMATIONSPEED)+'px';	// add the height
	setTimeout(function(){ growAnimation(element, initialSize, finalSize, paddingTop, paddingBottom, whenDone)}, 10);	// recursion!
}

function fadeIn(list)
{
	for (i = 0; i < list.length; i++)
	{
		if (list[i].tagName !== undefined && list[i].getAttribute('class') !== 'hidden-wrapper') // if it's actually a tag, and the class isn't set to hide it (doesn't show up at beginning for multi maybe?)
		{
			fadeInAnimation(list[i], function(){});	// fade in the elements!
			list[i].removeAttribute('class');
		}
	}
}
function fadeInAnimation(element, whenDone)	// fade in animation
{		
	if (element.style.opacity == '' || element.style.opacity == 0 || element.style.opacity == 0.0 || element.style.opacity == 1 || element.style.opacity == 1.0) // if inline opacity is not set
	{
		element.style.opacity = 0; // set it to 0 so we can work with it
		if (element.tagName == 'INPUT')
			element.style.display = "inline";
		else
			element.style.display = "block"; // it needs to be displayed
	}
	else if (parseFloat(element.style.opacity) >= 1-(5*OPACITYSPEED)) // if the opacity is close to 1, make it 1
	{
		element.style.opacity = 1.0; // make it 1
		whenDone();
		return;
	}
	element.style.opacity = parseFloat(element.style.opacity) + OPACITYSPEED; // increment opacity
	setTimeout(function(){fadeInAnimation(element, whenDone)}, 10); // recursion!
}
function fadeOutAnimation(element, whenDone)
{
	if (element.style.opacity == '') // if inline opacity is not set
		element.style.opacity = 1; // set it to 0 so we can work with it
	else if (parseFloat(element.style.opacity) <= 2*OPACITYSPEED) // if the opacity is close to 1, make it 1
	{
		element.style.opacity = 0; // make it 0
		element.style.display = 'none';
		whenDone();
		return;
	}
	element.style.opacity = parseFloat(element.style.opacity) - OPACITYSPEED; // increment opacity
	setTimeout(function(){fadeOutAnimation(element, whenDone)}, 10); // recursion!
}