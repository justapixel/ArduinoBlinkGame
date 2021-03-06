import { io } from 'socket.io-client';
import { Board } from 'johnny-five';
import pixel from "node-pixel";

var board = new Board({ repl: false });
const socket = io(process.env.APP_URL + '/arduino' || 'http://localhost:3000/arduino');

const stripPixels = Number(process.env.STRIP_PIXELS) || 25; // number of pixels in the strip.
const dataPin = process.env.DATA_PIN || 6; // data pin of the strip.
const maxScore = Number(process.env.MAXIMUM_SCORE) || 250; // maximum score value.
const rainbowDelay = Number(process.env.RAINBOW_DELAY) || 20; // delay to change pixel rainbow color (higher value == faster change).

board.on("ready", function () {

  console.log("Board ready");

  // setup the node-pixel strip.
  const strip = new pixel.Strip({
    data: dataPin,
    length: stripPixels,
    board: this,
    controller: "FIRMATA",
    gamma: 2.8
  });

  strip.on("ready", function () {
    strip.off();
    console.log("Strip ready, let's go");
    socket.on('update-score', (score) => {
      if (score < 250) {
        staticRainbow(score);
      } else {
        dynamicRainbow(rainbowDelay)
      }
    })
  });

  function staticRainbow(score: number) {
    for (var i = 0; i < strip.length; i++) {
      const showColor = colorWheel((i * 256 / strip.length) & 255);
      strip.pixel(i).color(showColor);
      if (i === Math.floor(((score * (stripPixels-1)) / maxScore))) {
        break;
      }
    }
    strip.show();
  }

  function dynamicRainbow(delay: number) {
    var cwi = 0; // colour wheel index (current position on colour wheel)
    setInterval(function () {
      if (++cwi > 255) {
        cwi = 0;
      }

      for (var i = 0; i < strip.length; i++) {
        const showColor = colorWheel((cwi + i) & 255);
        strip.pixel(i).color(showColor);
      }
      strip.show();
    }, 1000 / delay);
  }

  // Input a value 0 to 255 to get a color value.
  // The colours are a transition r - g - b - back to r.
  function colorWheel(WheelPos: number) : string {
    var r, g, b;
    WheelPos = 255 - WheelPos;

    if (WheelPos < 85) {
      r = 255 - WheelPos * 3;
      g = 0;
      b = WheelPos * 3;
    } else if (WheelPos < 170) {
      WheelPos -= 85;
      r = 0;
      g = WheelPos * 3;
      b = 255 - WheelPos * 3;
    } else {
      WheelPos -= 170;
      r = WheelPos * 3;
      g = 255 - WheelPos * 3;
      b = 0;
    }
    // returns a string with the rgb value to be used as the parameter
    return "rgb(" + r + "," + g + "," + b + ")";
  }

});