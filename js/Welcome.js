var oForm = document.getElementsByTagName('form')[0];
var oEnter = oForm.Enter;
var oSelect = oForm.Select;
var oMode = oForm.Mode;
var sValue = '正常';

oEnter.onclick = function(){
	window.location.href = encodeURI('Snake.html?value='+sValue);

}
oSelect.onclick= function(){
	oMode.style.display = 'block';
}
oMode.onchange = function(){
	sValue = this.value;
}