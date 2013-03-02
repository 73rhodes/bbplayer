/*global $, document, alert*/

(function () {

  //Pad a number with leading zeros
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
  var BBPlayer = function (bbplayer) {
    this.bbplayer  = bbplayer;
    this.bbaudio   = bbplayer.find("audio");
    this.bbdebug   = bbplayer.find(".bb-debug");
    this.bbaudio.get(0).preload="auto";
    this.state     = "paused"; // TODO enum states
    this.trackList = [];
    this.init();
  };

  // Debug logger
  BBPlayer.prototype.log = function (msg) {
    if (this.bbdebug) {
      this.bbdebug.append(msg + "<br>");
      this.bbdebug.scrollTop(this.bbdebug.prop('scrollHeight') - this.bbdebug.height());
    }
  };

  // say if audio element can play file type
  BBPlayer.prototype.canPlay = function (extension) {
    var audioElem = this.bbaudio.get(0);
    if ((/mp3/i).test(extension) && audioElem.canPlayType('audio/mpeg')) {
      return true;
    }
    if ((/ogg/i).test(extension) && audioElem.canPlayType('audio/ogg')) {
      return true;
    }
    return false;
  };


  // Set up multiple sources as track list,
  // Remove duplicate and unplayable sources
  BBPlayer.prototype.loadSources = function () {
    var self = this;
    self.log('func: loadSources');
    self.bbaudio.find("source").each(function (x) {
      var fileName  = $(this).attr('src').split('/').pop();
      var extension = fileName.split('.').pop();
      var trackName = fileName.split('.').shift();
      var playable  = self.canPlay(extension);
      var audioElem = self.bbaudio.get(0);
      if ($.inArray(trackName, self.trackList) === -1 && playable === true) {
        self.trackList.push(trackName);
      } else {
        $(this).remove();
      }
    });
  };


  // Update display
  BBPlayer.prototype.updateDisplay = function () {
    var audioElem = this.bbaudio.get(0);
    var duration  = toTimeString(Math.ceil(audioElem.duration));
    var elapsed   = toTimeString(Math.ceil(audioElem.currentTime));
    var title     = parseTitle(audioElem.currentSrc);
    this.bbplayer.find('.bb-trackLength').html(duration);
    this.bbplayer.find('.bb-trackTime').html(elapsed);
    this.bbplayer.find('.bb-trackTitle').html(title);
  };


  // Set current source for audio to given track number
  BBPlayer.prototype.loadTrack = function (trackNumber) {
    var source  = this.bbaudio.find("source").eq(trackNumber).attr('src');
    this.bbaudio.get(0).src = source;
    this.currentTrack = trackNumber;
    this.log('func: loadTrack: loaded ' + source);
  };


  // Load next track in playlist
  BBPlayer.prototype.loadNext = function () {
    this.log('func: loadNext');
    var trackCount = this.bbaudio.find("source").length;
    var newTrack   = ((1 + this.currentTrack) % trackCount);
    this.loadTrack(newTrack);
  };


  // Load previous track in playlist
  BBPlayer.prototype.loadPrevious = function () {
    this.log('func: loadPrevious');
    var trackCount = this.bbaudio.find('source').length;
    var newTrack = (this.currentTrack + (trackCount - 1)) % trackCount;
    this.loadTrack(newTrack);
  };


  // Set up event handlers for audio element events
  BBPlayer.prototype.setAudioEventHandlers = function () {

    var self = this;
    self.log('func: setAudioEventHandlers');

    // Update display and continue play when song has loaded
    self.bbaudio.on('canplay', function () {
      self.log('event: audio canplay');
      if (self.state === 'playing' && $(this).get(0).paused) {
        $(this).get(0).play();
       }
      self.updateDisplay();
    });

    // Load next track when current one ends
    self.bbaudio.on('ended', function () {
      self.log('event: audio ended');
      self.loadNext();
    });

  };


  BBPlayer.prototype.play = function () {
    this.bbaudio.get(0).play();
    this.state = "playing";
    var playButton = this.bbplayer.find(".bb-play");
    playButton.removeClass("bb-paused");
    playButton.addClass("bb-playing");
  };

  BBPlayer.prototype.pause = function () {
    this.bbaudio.get(0).pause();
    this.state = "paused";
    var playButton = this.bbplayer.find(".bb-play");
    playButton.removeClass("bb-playing");
    playButton.addClass("bb-paused");
  };

  // Set up button click handlers
  BBPlayer.prototype.setClickHandlers = function () {

    var self = this;
    self.log('func: setClickHandlers');
    var audioElem = self.bbaudio.get(0);

    // Activate fast-forward
    self.bbplayer.find('.bb-forward').click(function () {
      self.log('event: click .bb-forward');
      self.loadNext();
    });

    // Toggle play / pause
    self.bbplayer.find('.bb-play').click(function () {
      self.log('event: click .bb-play');
      if (self.state === "paused") { //(audioElem.paused) {
        stopAllBBPlayers();
        self.state = "playing";
        self.play();
      } else {
        self.state = "paused";
        self.pause();
      }
      self.updateDisplay();
    });

    // Activate rewind
    self.bbplayer.find('.bb-rewind').click(function () {
      self.log('event: click .bb-rewind');
      var time = audioElem.currentTime;
      if (time > 1.5) {
        audioElem.currentTime = 0;
      } else {
        self.loadPrevious();
      }
    });

    if (self.bbdebug) {
      self.bbdebug.click( function () {
        $(this).empty();
      });
    }

  };


  BBPlayer.prototype.init = function () {
    var self = this;
    self.setAudioEventHandlers();
    self.loadSources();
    // self.loadTrack (0);
    self.currentTrack = 0;
    self.setClickHandlers();
    self.displayTimer = setInterval(function () { self.updateDisplay(); }, 1000);
  };

  var bbplayers = [];

  function stopAllBBPlayers() {
    var i = 0;
    for (i = 0; i < bbplayers.length; i++) {
      bbplayers[i].pause();
      bbplayers[i].updateDisplay();
    }
  }

  $(document).ready(function () {
    $(".bbplayer").each(function (x) {
      bbplayers[x] = new BBPlayer($(this));
    });
  });

}());
