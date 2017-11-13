/*window.onresize = function(){
	window.requestAnimationFrame(function () {
	  var AvailableWidth = window.innerWidth;
	  var fontSize = (AvailableWidth/375)*10;
	  todaycrop = document.getElementById('todaycrop');
	  todaycrop.style.fontSize = fontSize+'px';
	});
}*/
(function(){ 
  	var fontSize = 10;
  	todaycrop = document.getElementById('todaycrop');
  	todaycrop.style.fontSize = fontSize+'px';
})();