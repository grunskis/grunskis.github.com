/*
                         #                #
 ## ###  ## ### ###         ##  # #  ## ### ### ###  ##
 #  # # # # #   ##       #  # # # # # # # # ##  #    #
##  ### ### ### ###      ## # #  #  ### ### ### #   ##
    #
*/

var Invader = function(screen, params) {
    var invader = [
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0]
    ];

    var direction;
    var posx, posy;

    var RIGHT = 1;
    var LEFT = 0;

    (function () {
         posx = 9 * params.blocksize;
         posy = 0;

         direction = RIGHT;
     }());

    function getx() {
        return posx;
    }

    function gety() {
        return posy;
    }

    function at(row, col) {
        return invader[row][col] != 0;
    }

    function hit(row, col) {
        invader[row][col] = 0;
    }

    function draw() {
        screen.ctx.fillStyle = '#000';

        for (var row = 0; row < 8; row++) {
            var y = screen.offsety(row) + posy;

            for (var col = 0; col < 11; col++) {
                if (invader[row][col] != 0) {
                    var x = screen.offsetx(col) + posx;

                    screen.ctx.fillRect(x, y,
                                        params.blocksize, params.blocksize);
                }
            }
        }
    };

    function step() {
        if (posx > 18 * params.blocksize) {
            direction = LEFT;
        }

        if (direction == RIGHT) {
            posx += params.blocksize;
        } else {
            posx -= params.blocksize;

            if (posx <= 0) {
                direction = RIGHT;
            }
        }

    };

    return {
        'draw': draw,
        'step': step,
        'getx': getx,
        'gety': gety,
        'at': at,
        'hit': hit
    };
};

var Bullet = function(screen, params) {
    var width;
    var posx, posy;
    var offset;

    (function () {
         width = params.blocksize;
         offset = width + width / 2;

         posx = screen.width / 2 - width / 2;
         posy = 18 * params.blocksize;
     }());

    function draw() {
        screen.ctx.fillRect(posx, posy, width, width);
    }

    function step() {
        posy -= params.blocksize;
    }

    function setx(x) {
        posx = x + offset;
    }

    function gety() {
        return posy;
    }

    function getx() {
        return posx;
    }

    return {
        'draw': draw,
        'setx': setx,
        'step': step,
        'gety': gety, 
        'getx': getx
    };
};

function constrain(n, min, max) {
    return n > max ? max : n < min ? min : n;
}

var Ship = function(screen, params) {

    var width = null, height = null;
    var size, posx, posy, isfiring;
    var bullet;

    (function () {
         width = params.blocksize * 4;
         height = params.blocksize;

         posx = screen.width / 2 - width / 2;
         posy = 19 * params.blocksize;

         bullet = new Bullet(screen, params);

         isfiring = false;
     })();

    function setx(x) {
        posx = x - width / 2;
        posx = constrain(posx, 0, screen.width - width);

        if (!isfiring) {
            bullet.setx(posx);
        }
    };

    function draw() {
        screen.ctx.fillStyle = '#000';

        screen.ctx.fillRect(posx, posy, width, height);

        bullet.draw();
    };

    function step() {
        if (isfiring) {
            bullet.step();
        }
    };

    function fire() {
        isfiring = true;
    };

    function holdfire() {
        isfiring = false;

        bullet = new Bullet(screen, params);
        bullet.setx(posx);
    };

    function step() {
        if (isfiring) {
            bullet.step();

            if (bullet.gety() < 0) {
                holdfire();
            }
        }
    };

    function getbullet() {
        return bullet;
    }

    return {
        'draw': draw,
        'step': step,
        'holdfire': holdfire,
        'setx': setx,
        'fire': fire,
        'getbullet': getbullet
    };
};

var Screen = function(canvas, params) {

    var ctx = null;

    var width = null;
    var height = null;

    (function () {
         ctx = canvas.getContext('2d');

         width = canvas.width;
         height = canvas.height;
     }());

    function addHandler(event, fn) {
        if (document.addEventListener) {
            canvas.addEventListener(event, fn, true);
        } else {
            canvas.attachEvent('on' + event, fn);
        }
    }

    function offsetx(col) {
        return col * params.blocksize;
    };

    function offsety(row) {
        return row * params.blocksize;
    };

    function hit(bullet, x, y) {
        var hit = false;
        if (bullet.getx() >= x && bullet.getx() <= (x + params.blocksize) &&
            bullet.gety() >= y && bullet.gety() <= (y + params.blocksize)) {

            hit = true;
        }

        return hit;
    }

    function isahit(invader, ship) {
        var bullet = ship.getbullet();

        if (bullet.gety() > 8 * params.blocksize) {
            return false;
        }

        for (var row = 7; row >= 0; row--) {
            var y = offsety(row) + invader.gety();

            for (var col = 0; col < 11; col++) {
                if (invader.at(row, col)) {
                    var x = offsetx(col) + invader.getx();

                    // check if bullets upper left corner has hit a block
                    var hit_upper_left = hit(bullet, x, y);

                    // same for upper right corner
                    var hit_upper_right = hit(bullet, x-params.blocksize, y);

                    if (hit_upper_left || hit_upper_right) {
                        invader.hit(row, col);

                        return true;
                    }
                }
            }
        }

        return false;
    };

    function reset() {
        ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, width, height);
        ctx.fill();
    };

    return {
      'reset': reset,
      'isahit': isahit,
      'offsetx': offsetx,
      'offsety': offsety,
      'ctx': ctx,
      'addHandler': addHandler,
      'width': width,
      'height': height
    };
};

var GAME = (function () {

   var winpic = [
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1],
        [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1]
    ];

    var screen = null;

    var invader = null;
    var ship = null;

    var start, before;
    var loopInterval;

    var score = 0;
    var win = false;

    var level = 0;
    var magic_numbers = [1, 2, 5, 8, 13, 21, 34, 46];

    var params = {};

    function init(canvas) {
        params.blocksize = 10;

        screen = new Screen(canvas, params);

        ship = new Ship(screen, params);
        invader = new Invader(screen, params);

        screen.addHandler("mousedown", function (e) {
                              ship.fire();
                          });

        screen.addHandler("mousemove", function (e) {
                              ship.setx(e.layerX);
                          });

        start = new Date().getTime();
        before = 0;

        loopInterval = setInterval(loop, 20);

        stats_init();

        mpmetrics.track('level 0');
    };

    function stats_init() {
      try {
        mpmetrics = new MixpanelLib("f45250434003c5bfb38d76cd3ad85869");
      } catch(err) {
        var null_fn = function () {};

        mpmetrics = {
          track: null_fn,
          track_funnel: null_fn,
          register: null_fn,
          register_once: null_fn,
          register_funnel: null_fn,
          identify: null_fn
        };
      }
    };

    function millis() {
        return (new Date().getTime()) - start;
    };

    function step() {
        var now = millis();

        if (now - before > 900) {
            before = now;

            return true;
        }

        return false;
    };

    function show_things(score) {
        if (magic_numbers[level] <= score) {
            show_thing_nr(level);
            level++;

            mpmetrics.track('level ' + level);
        }

        if (level >= 8) {
            win = true;
        }
    };

    function el(id) {
        return document.getElementById(id);
    };

    function show_thing_nr(nr) {
        var things = el('things');

        var thing = things.getElementsByTagName('li')[nr];
        if (thing != null) {
            thing.className = 'show';
        }
    };

    function show_win_screen() {
        screen.ctx.fillStyle = '#000';

        var offsetx = 8 * params.blocksize;
        var offsety = 4 * params.blocksize;

        for (var row = 0; row < 6; row++) {
            var y = offsety + row * params.blocksize;

            for (var col = 0; col < 14; col++) {
                if (winpic[row][col] != 0) {
                    var x = offsetx + col * params.blocksize;

                    screen.ctx.fillRect(x, y,
                                        params.blocksize, params.blocksize);
                }
            }
        }
    };

    function hide_hint() {
        el('hint').style.cssText = 'display: none';
    };

    function loop() {
        screen.reset();

        if (win) {
            clearInterval(loopInterval);

            hide_hint();
            show_win_screen();
            return;
        }

        invader.draw();

        if (step()) {
            invader.step();
        }

        ship.step();

        if (screen.isahit(invader, ship)) {
            ship.holdfire();

            score++;
            show_things(score);
        }

        ship.draw();
    };

    return {
        'init' : init
    };
}());
