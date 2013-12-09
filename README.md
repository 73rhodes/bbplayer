bbplayer
============

A Modern, Minimalist HTML5 Audio Player

About
-----

bbplayer is a minimalist HTML5 Audio player. With Minio you can:
  * make a playlist of tracks inside the HTML5 audio element
  * design your own control buttons, or use the ones included
  * put more than one player on a page, but make them play one at a time
  * support all browsers with MP3 and OGG formats

bbplayer uses CSS classes. Start with a *bbplayer* class containing controls like
*bb-rewind*, *bb-play*, *bb-forward*, etc. and the HTML5 *audio* element; bbplayer.js
takes care of the rest.

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

See **bbplayer.html** or visit http://darrenderidder.github.com/minio for an example.

FAQ
---

_Why is it called bbplayer?_

I made it for my piano teacher's web site, brianbrowne.com.
