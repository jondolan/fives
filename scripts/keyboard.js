var inputs;
function submitWordForInclusion()
{
	var word = document.getElementById('multi-word-input').value;
	var xmlhttp;
	if (window.XMLHttpRequest)
		xmlhttp=new XMLHttpRequest();
	else
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xmlhttp.open("GET","submitWord.php?w=" + word,true);
	xmlhttp.send();
}
function onKeyUp(event, element)
{
	var x = parseInt(element.name);
	
	isElementEmpty(x);
	
	if (event.keyCode == 39)
	{
		if (inputs[x+1].value == null || inputs[x+1].value == '' || inputs[x+1].value == ' ')
		{
			inputs[x].focus();
			return;
		}
		inputs[x+1].focus();
		reset(inputs[x+1]);
	}
	else if (element.value != null && element.value != '' && element.value != ' ' && event.keyCode != 37)
		inputs[x+1].focus();
}
function onKeyDown(event, element)
{
	var x = parseInt(element.name);
	if (event.keyCode == 37)
	{
		inputs[x-1].focus();
		window.setTimeout(function() {reset(inputs[x-1])}, 1);
	}
	else if (event.keyCode == 8)
	{
		if (element.value == null || element.value == '' || element.value == ' ')
		{
			inputs[x-1].focus();
			inputs[x-1].value="";
		}
	}
	else if (element.value != null && element.value != '' && element.value != ' ')
	{
		inputs[x+1].value = String.fromCharCode(event.keyCode).toLowerCase();
		inputs[x+1].focus();
	}
}
function submitForm(event, name)
{
	if (event.keyCode == 13)
	{
		document.getElementById(name).click();
	}
}
function isElementEmpty(x)
{
	if (x > 0)
	{
		if (inputs[x-1].value == null || inputs[x-1].value == '' || inputs[x-1].value == ' ')
		{
			inputs[x].value = '';
			inputs[x-1].focus();
			isElementEmpty(x-1);
		}
	}
}