bbplayer
========

A Simple HTML5 Audio Player

About
-----

bbplayer is a simple HTML5 Audio player. With bbplayer you can:
  * add multiple source tracks to the HTML5 audio element
  * use your own HTML elements as control buttons, and style them however you want.
  * put multiple players on a page but only have one play at a time.
  * provide both MP3 and OGG formats but automatically avoid duplicate playlist entries

bbplayer uses CSS classes to work. Start with a *bbplayer* class containing controls like
*bb-rewind*, *bb-play*, *bb-forward*, etc. and the HTML5 *audio* element. Style with CSS
however you like, and bbplayer.js takes care of the rest.

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
    
Then include **jquery** and **bbplayer.js**:

    <script src="js/jquery.js"></script>
    <script src="js/bbplayer.js"></script>

See **bbplayer.html** for an example.
