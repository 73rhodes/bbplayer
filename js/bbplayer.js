/*global $, document, alert*/

(function () {

  // Track multiple players on the page
  var bbplayers = [];


  // Stop all other bbplayers on page when starting another
  function stopAllBBPlayers() {
    var i = 0;
    for (i = 0; i < bbplayers.length; i++) {
      bbplayers[i].bbaudio.pause();
      bbplayers[i].updateDisplay();
    }
  }

  // Pad a number with leading zeros
  function zeroPad(number, places) {
    var zeros = places - number.toString().length + 1;
    return new Array(+(zeros > 0 && zeros)).join("0") + number;
  }


  // Convert seconds to mm:ss format
  function toTimeString(seconds) {
    if (isNaN(seconds)) {
      return "--:--";
    }
    var minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    return zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2);
  }


  // Parse out file name from path, unescape
  function parseTitle(path) {
    path = decodeURI(path);
    return path.split('/').pop().split('.').shift();
  }

  // Object to represent bbplayer
  var BBPlayer = function (elem) {
    this.bbplayer  = elem;
    this.bbaudio   = elem.getElementsByTagName("audio").item(0);
    this.bbdebug   = elem.getElementsByClassName("bb-debug").item(0);
    this.bbaudio.setAttribute("preload", "auto");
    this.state     = this.bbaudio.autoplay ? "playing" : "paused";
    this.repeat    = this.bbaudio.loop ? true : false;
    this.bbaudio.removeAttribute('loop'); // hijack the loop directive
    this.trackList = [];
    this.init();
  }


  // Debug logger
  BBPlayer.prototype.log = function (msg) {
    if (this.bbdebug) {
      this.bbdebug.appendChild(document.createTextNode(msg));
      this.bbdebug.appendChild(document.createElement('br'));
      this.bbdebug.scrollTop = (this.bbdebug.scrollHeight - this.bbdebug.clientHeight);
    }
  };


  // say if audio element can play file type
  BBPlayer.prototype.canPlay = function (extension) {
    if ((/mp3/i).test(extension) && this.bbaudio.canPlayType('audio/mpeg')) {
      return true;
    }
    if ((/ogg/i).test(extension) && this.bbaudio.canPlayType('audio/ogg')) {
      return true;
    }
    return false;
  };


  // Set up multiple sources as track list,
  // Remove duplicate and unplayable sources
  BBPlayer.prototype.loadSources = function () {
    var self = this;
    var unused = [];
    self.log('func: loadSources');
    var sources = self.bbaudio.getElementsByTagName("source");
    [].forEach.call(
      self.bbaudio.getElementsByTagName("source"),
      function (elem) {
        var fileName  = elem.getAttribute('src').split('/').pop();
        var extension = fileName.split('.').pop();
        var trackName = fileName.split('.').shift();
        var playable  = self.canPlay(extension);
        if (self.trackList.indexOf(trackName) === -1 && playable === true) {
          self.trackList.push(trackName);
        } else {
          unused.push(elem);
        }
      }
    );
    [].forEach.call(
      unused,
      function (elem) {
        elem.parentNode.removeChild(elem);
      }
    );
  };


  // Update display
  BBPlayer.prototype.updateDisplay = function () {
    var audioElem = this.bbaudio;
    var duration  = toTimeString(Math.ceil(audioElem.duration));
    var elapsed   = toTimeString(Math.ceil(audioElem.currentTime));
    var title     = parseTitle(audioElem.currentSrc);
    this.bbplayer.getElementsByClassName('bb-trackLength').item(0).innerHTML = duration;
    this.bbplayer.getElementsByClassName('bb-trackTime').item(0).innerHTML = elapsed;
    this.bbplayer.getElementsByClassName('bb-trackTitle').item(0).innerHTML = title;
    var playButton = this.bbplayer.getElementsByClassName("bb-play").item(0);
    if (this.bbaudio.paused) {
      playButton.classList.remove("bb-playing");
      playButton.classList.add("bb-paused");
    } else {
      playButton.classList.remove("bb-paused");
      playButton.classList.add("bb-playing");
    }
  };


  // Set current source for audio to given track number
  BBPlayer.prototype.loadTrack = function (trackNumber) {
    var source = this.bbaudio.getElementsByTagName("source").item(trackNumber).getAttribute('src');
    this.bbaudio.src = source;
    // don't autoplay if bbplayer state is paused
    if (this.state === 'paused') {
      this.bbaudio.pause();
    } 
    this.currentTrack = trackNumber;
    this.log('func: loadTrack: loaded ' + source);
  };


  // Load next track in playlist
  BBPlayer.prototype.loadNext = function () {
    this.log('func: loadNext');
    var trackCount = this.bbaudio.getElementsByTagName("source").length;
    var newTrack   = ((1 + this.currentTrack) % trackCount);
    if (newTrack <= this.currentTrack && !this.repeat) {
      this.state = "paused";
    }
    this.loadTrack(newTrack);
  };


  // Load previous track in playlist
  BBPlayer.prototype.loadPrevious = function () {
    this.log('func: loadPrevious');
    var trackCount = this.bbaudio.getElementsByTagName('source').length;
    var newTrack = (this.currentTrack + (trackCount - 1)) % trackCount;
    this.loadTrack(newTrack);
  };


  // Set up event handlers for audio element events
  BBPlayer.prototype.setAudioEventHandlers = function () {

    var self = this;
    self.log('func: setAudioEventHandlers');

    self.bbaudio.addEventListener('abort', function () {
      self.log('event: audio abort');
    });

    // Update display and continue play when song has loaded
    self.bbaudio.addEventListener('canplay', function () {
      self.log('event: audio canplay');
      if (self.state === 'playing' && this.paused) {
        this.play();
      }
      self.updateDisplay();
    });

    self.bbaudio.addEventListener('canplaythrough', function () {
      self.log('event: audio canplaythrough');
    });

    self.bbaudio.addEventListener('durationchange', function () {
      self.log('event: audio durationchange');
    });

    self.bbaudio.addEventListener('emptied', function () {
      self.log('event: audio emptied');
    });

    // Load next track when current one ends
    self.bbaudio.addEventListener('ended', function () {
      self.log('event: audio ended');
      self.loadNext();
    });

    self.bbaudio.addEventListener('error', function () {
      self.log('event: audio error');
    });

    self.bbaudio.addEventListener('loadeddata', function () {
      self.log('event: audio loadeddata');
    });

    self.bbaudio.addEventListener('loadedmetadata', function () {
      self.log('event: audio loadedmetadata');
    });

    self.bbaudio.addEventListener('loadstart', function () {
      self.log('event: audio loadstart');
    });

    self.bbaudio.addEventListener('pause', function () {
      self.log('event: audio pause');
    });

    self.bbaudio.addEventListener('play', function () {
      self.log('event: audio play');
    });

    self.bbaudio.addEventListener('playing', function () {
      self.log('event: audio playing');
    });

    self.bbaudio.addEventListener('progress', function () {
      self.log('event: audio progress');
    });

    self.bbaudio.addEventListener('ratechange', function () {
      self.log('event: audio ratechange');
    });

    self.bbaudio.addEventListener('seeked', function () {
      self.log('event: audio seeked');
    });

    self.bbaudio.addEventListener('seeking', function () {
      self.log('event: audio seeking');
    });

    self.bbaudio.addEventListener('stalled', function () {
      self.log('event: audio stalled');
    });

    self.bbaudio.addEventListener('suspend', function () {
      self.log('event: audio suspend');
    });

    self.bbaudio.addEventListener('timeupdate', function () {
      // self.log('event: audio timeupdate');
      self.updateDisplay();
    });

    self.bbaudio.addEventListener('volumechange', function () {
      self.log('event: audio volumechange');
    });

    self.bbaudio.addEventListener('waiting', function () {
      self.log('event: audio waiting');
    });

  };


  // Set up button click handlers
  BBPlayer.prototype.setClickHandlers = function () {

    var self = this;
    self.log('func: setClickHandlers');
    var audioElem = self.bbaudio;

    // Activate fast-forward
    [].forEach.call(
      self.bbplayer.getElementsByClassName('bb-forward'),
      function (el) {
        el.addEventListener('click', function () {
          self.log('event: click .bb-forward');
          self.loadNext();          
        });
      }
    );

    // Toggle play / pause
    [].forEach.call(
      self.bbplayer.getElementsByClassName('bb-play'),
      function (el) {
        el.addEventListener('click', function () {
          self.log('event: click .bb-play');
          if (self.bbaudio.paused) { //(audioElem.paused) {
            stopAllBBPlayers();
            self.bbaudio.play();
            self.state = "playing";
          } else {
            self.bbaudio.pause();
            self.state = "paused";
          }
          self.updateDisplay();
        });
      }
    );

    // Activate rewind
    [].forEach.call(
      self.bbplayer.getElementsByClassName('bb-rewind'),
      function (el) {
        el.addEventListener('click', function () {
          self.log('event: click .bb-rewind');
          var time = audioElem.currentTime;
          if (time > 1.5) {
            audioElem.currentTime = 0;
          } else {
            self.loadPrevious();
          }
        });
      }
    );


    // TODO make debug more "pluggy".
    if (self.bbdebug) {
      self.bbdebug.click(function () {
        $(this).empty();
      });
    }

  };


  // BBPlayer initialisation
  BBPlayer.prototype.init = function () {
    var self = this;
    self.setAudioEventHandlers();
    self.loadSources();
    self.currentTrack = 0;
    self.setClickHandlers();
    self.updateDisplay();
  };


  // Create BBPlayer Object for each element of .bbplayer class
  document.addEventListener('DOMContentLoaded', function() {
    [].forEach.call(
      document.getElementsByClassName("bbplayer"),
      function (el) {
        bbplayers.push(new BBPlayer(el));
      }
    );
  });

}());
