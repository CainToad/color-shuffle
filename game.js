/*
game.js for Perlenspiel 3.3.x
Last revision: 2020-03-24 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-20 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

let shuffle = (function() {
  let add_weight = (e) => [e, Math.random()];
  let strip_weight = (e) => e[0];
  let comp = (a, b) => (a[1] - b[1]);

  return function(arr) {
    return arr.map(add_weight).sort(comp).map(strip_weight);
  }
})();

function inBounds(x, y) {
  return (Math.min(x, y) >= 0) && (Math.max(x, y) < 8);
};

let dirs = [
  [0, -1, "top", (a, b) => (a[1] - b[1])],
  [1, 0, "right", (a, b) => (b[0] - a[0])],
  [0, 1, "bottom", (a, b) => (b[1] - a[1])],
  [-1, 0, "left", (a, b) => (a[0] - b[0])]
];

let selected = [];
function addSelected(x, y) {
  if (selected.includes((y * 8) + x)) {
    return;
  }
  selected.push((y * 8) + x);
  let border = {top: 5, left: 5, bottom: 5, right: 5};
  let color = PS.color(x, y);

  dirs.forEach(function(e) {
    if (inBounds(x+e[0], y+e[1]) && (PS.color(x+e[0], y+e[1]) === color)) {
      addSelected(x+e[0], y+e[1]);
      border[e[2]] = 0;
    }
  });

  PS.border(x, y, border);
}

function selectXY(x, y) {
  PS.border(PS.ALL, PS.ALL, 0);
  selected = [];
  addSelected(x, y);
  selected = selected.map((e) => [e % 8, Math.floor(e / 8)]);
}

function swapColor(x, y, dx, dy) {
  let color = PS.color(x, y);
  PS.color(x, y, PS.color(x + dx, y + dy));
  PS.color(x + dx, y + dy, color);
}

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.init = function( system, options ) {
	"use strict"; // Do not remove this directive!

	PS.gridSize( 8, 8 );
  PS.gridColor(PS.COLOR_BLACK);
  PS.border(PS.ALL, PS.ALL, 0);
  PS.borderColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);

  let colors = [
    PS.COLOR_RED,
    PS.COLOR_BLUE,
    PS.COLOR_GREEN,
    PS.COLOR_ORANGE
  ];
  for (let i = 0; i < 4; i++) {
    colors = colors.concat(colors);
  }
  shuffle(colors).forEach(function(e, i) {
    PS.color(i % 8, Math.floor(i / 8), e);
  });

  PS.statusColor(PS.COLOR_WHITE);
	PS.statusText( "Click then Arrow" );
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	"use strict"; // Do not remove this directive!
  selectXY(x, y);
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	"use strict"; // Do not remove this directive!

  let dir = null;

  switch (key) {
    case PS.KEY_ARROW_UP:
      dir = dirs[0];
      break;
    case PS.KEY_ARROW_RIGHT:
      dir = dirs[1];
      break;
    case PS.KEY_ARROW_DOWN:
      dir = dirs[2];
      break;
    case PS.KEY_ARROW_LEFT:
      dir = dirs[3];
      break;
  }

  if (selected.length && (dir !== null)) {
    selected.sort(dir[3]);
    if (inBounds(selected[0][0] + dir[0], selected[0][1] + dir[1])) {
      for (let i = 0, e; i < selected.length; i++) {
        e = selected[i];
        swapColor(e[0], e[1], dir[0], dir[1]);
      }
      selectXY(selected[0][0] + dir[0], selected[0][1] + dir[1]);
    }
  }
};
