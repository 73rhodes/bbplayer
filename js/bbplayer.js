/*global $, document, alert*/

(function () {

  if (!console || !console.log) {
    console = {
      log: function (msg) {
        $(document).append(msg+"<br>\n");
      }
    }
  }

  //Pad a number with leading zeros
  function zeroPad(number, places) {
    var zeros = places - number.toString().length + 1;
    return new Array(+(zeros > 0 && zeros)).join("0") + number;
  }


  // Convert seconds to mm:ss format
  function toTimeString(seconds) {
    if (typeof seconds !== "number") {
      console.log('toTimeString: seconds = ' + seconds);
      return "xx:xx";
    }
    var minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    return zeroPad(minutes, 2) + ":" + zeroPad(seconds, 2);
  }


  // Parse out file name from path, unescape %20
  function parseTitle(path) {
    //console.log('parseTitle: path = ' + path);
    path = path.replace(/%20/g, " ");
    return path.split('/').pop().split('.').shift();
  }


  // Object to represent bbplayer
  var BBPlayer = function (bbplayer) {
    this.bbplayer  = bbplayer;
    this.bbaudio   = bbplayer.find("audio");
    this.state     = "paused"; // TODO enum states
    this.trackList = [];
    this.init();
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
    console.log('BBPlayer::loadTrack: loading track ' + trackNumber);
    var source  = this.bbaudio.find("source").eq(trackNumber).attr('src');
    this.bbaudio.get(0).src = source;
    this.currentTrack = trackNumber;
  };


  // Load next track in playlist
  BBPlayer.prototype.loadNext = function () {
    console.log('BBPlayer::loadNext: entering');
    var trackCount   = this.bbaudio.find("source").length;
    this.loadTrack((1 + this.currentTrack) % trackCount);
  };


  // Load previous track in playlist
  BBPlayer.prototype.loadPrevious = function () {
    console.log('BBPlayer::loadPrevious: entering');
    var trackCount = this.bbaudio.find('source').length;
    var newTrack = (this.currentTrack + (trackCount - 1)) % trackCount;
    this.loadTrack(newTrack);
  };


  // Set up event handlers for audio element events
  BBPlayer.prototype.setAudioEventHandlers = function () {

    console.log('BBPlayer::setAudioEventHandlers: entering');
    // Update display and continue play when song has loaded
    var self = this;
    self.bbaudio.on('canplay', function () {
      console.log('BBPlayer: event canplay');
      if (self.state === 'playing') {
        console.log('BBPlayer: canplay event continuing play');
        $(this).get(0).play();
       }
      self.updateDisplay();
    });

    // Load next track when current one ends
    self.bbaudio.on('ended', function () {
      console.log('BBPlayer: event audio ended, loading next');
      self.loadNext();
    });
  };


  BBPlayer.prototype.play = function () {
    console.log('BBPlayer::play: entering');
    this.bbaudio.get(0).play();
    this.state = "playing";
    var playButton = this.bbplayer.find(".bb-play");
    playButton.removeClass("bb-paused");
    playButton.addClass("bb-playing");
  };

  BBPlayer.prototype.pause = function () {
    console.log('BBPlayer::pause: entering');
    this.bbaudio.get(0).pause();
    this.state = "paused";
    var playButton = this.bbplayer.find(".bb-play");
    playButton.removeClass("bb-playing");
    playButton.addClass("bb-paused");
  };

  // Set up button click handlers
  BBPlayer.prototype.setClickHandlers = function () {

    console.log('BBPlayer::setClickHandlers: entering');
    var self = this;
    var audioElem = self.bbaudio.get(0);

    // Activate fast-forward
    self.bbplayer.find('.bb-forward').click(function () {
      console.log('BBPlayer: forward button clicked, loading next');
      self.loadNext();
    });

    // Toggle play / pause
    self.bbplayer.find('.bb-play').click(function () {
      console.log('BBPlayer: play button clicked');
      if (self.state === "paused") { //(audioElem.paused) {
        stopAllBBPlayers();
        self.state = "playing";
        console.log('BBPlayer: play button starting play');
        self.play();
      } else {
        console.log('BBPlayer: play button pausing');
        self.state = "paused";
        self.pause();
      }
      self.updateDisplay();
    });

    // Activate rewind
    self.bbplayer.find('.bb-rewind').click(function () {
      console.log('BBPlayer: rewind button clicked');
      var time = audioElem.currentTime;
      if (time > 1.5) {
        console.log('BBPlayer: rewind to beginning');
        audioElem.currentTime = 0;
      } else {
        console.log('BBPlayer: rewind loading previous track');
        self.loadPrevious();
      }
    });
  };


  BBPlayer.prototype.init = function () {
    console.log('BBPlayer::init: setting event handlers');
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
    console.log('stopAllBBPlayers: entering');
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
