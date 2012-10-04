function supports_canvas() {
  return !!document.createElement('canvas').getContext;
}

window.onload = function() {
  var canvas = document.getElementById('invader');
  
  if (!supports_canvas()) {
    // fallback for older browsers that doesn't support canvas

    // replace hint
    var hint = 'get a browser that supports HTML5 canvas';
    
    var elem = document.getElementById('hint');
    elem.removeChild(elem.firstChild);
    elem.appendChild(document.createTextNode(hint));

    // replace canvas element with a static image
    canvas.parentElement.removeChild(canvas);
    
    var img = document.createElement('img');
    img.setAttribute('src', '/static/img/invader.png');
    elem.parentElement.insertBefore(img, elem);

    // show all things about me
    var things = document.getElementById('things');
    things.className = 'showall';
  } else {
    // play the game!
    
    GAME.init(canvas);
  }
};
