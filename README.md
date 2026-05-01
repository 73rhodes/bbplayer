[![DeepScan grade](https://deepscan.io/api/projects/3278/branches/27825/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=3278&bid=27825)
<a href="https://codeclimate.com/github/73rhodes/bbplayer/maintainability"><img src="https://api.codeclimate.com/v1/badges/1defc0bcbbf553e0a88b/maintainability" /></a>

bbplayer
============

A Modern, Minimalist HTML Audio Player

[![bbplayer](https://lh3.ggpht.com/-tC8Zj6Bpg04/UcMquJhtiLI/AAAAAAAABgI/cXg6RtQrgMc/s1600/bbplayer.png)](http://73rhodes.github.io/bbplayer)

About
-----

bbplayer is a minimalist HTML5 Audio player. With bbplayer you can:
  * make a playlist of tracks
  * design your own buttons or use the ones included
  * put several bbplayers on a page that play one at a time
  * support all browsers with MP3 and OGG formats

bbplayer uses CSS classes. Start with a `bbplayer` class containing controls
like `bb-rewind`, `bb-play`, `bb-forward` and `bb-trackTime`. Inlude the 
HTML5 `audio` element; bbplayer takes care of the rest.

Include your choice of stylesheet.

```html
<link rel="stylesheet" href="css/bbplayer.css">
```

Add HTML elements for bbplayer.

```html
<div class="bbplayer">
  <span class="bb-rewind"></span>
  <span class="bb-play"></span>
  <span class="bb-forward"></span>
  <span class="bb-trackTime"></span>
  <span class="bb-trackLength"></span>
  <span class="bb-trackTitle"></span>
  <audio>
    <source src="media/x.mp3"/>
    <source src="media/x.ogg"/>
    <source src="media/y.mp3"/>
    <source src="media/y.ogg"/>
  </audio>
</div>
```

Then include **bbplayer.js**:

```html
<script src="js/bbplayer.js"></script>
```

See **bbplayer.html** or visit http://73rhodes.github.io/bbplayer for an example.

To automatically start playing on load, use `<audio autoplay>`.

To enable continual looping, use `<audio loop>`.
