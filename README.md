BBPlayer.JS
===========

Simple HTML5 Audio Player

About
-----

This script lets you add multiple audio tracks to the HTML5 <audio> element and set up your own 
control buttons and CSS styles. The focus is on keeping it simple & easy to set up and customize.
The main features it supports are:

1. Create a playlist of multiple tracks
1. Automatically choose MP3 / OGG sources
1. Multiple players on a page that don't all play at once

The player requires jQuery (for now). You need to create elements with the right CSS classes,
although it doesn't matter what kind of elements you use for the bbplayer controls. Also
include the HTML5 audio element, and whatever track sources you want. Roughly:

    <... class="bbplayer">
      <... class="bb-rewind"></...>
      <... class="bb-play"></...>
      <... class="bb-forward"></...>
      <... class="bb-trackTime"></...>
      <... class="bb-trackLength"></...>
      <... class="bb-trackTitle"></...>
      <audio>
        <source src="media/x.mp3"/>
        <source src="media/x.ogg"/>
        <source src="media/y.mp3"/>
        <source src="media/y.ogg"/>
      </audio>
    </...>
    
Then include **bbplayer.js**:

    <script src="js/jquery.js"></script>
    <script src="js/bbplayer.js"></script>

See bbplayer.html for an example.
