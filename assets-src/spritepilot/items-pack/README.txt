SpritePilot RPG Items Pack — 12 animated pixel-art assets
https://spritepilot.com/free-game-assets

Twelve animated inventory icons: weapons, armor, jewelry, a spell scroll, a spell book and bread, with subtle glints and steam.

LICENSE
CC0 1.0 (public domain): use these in any project, commercial or not,
change them and share them. No credit needed (a link to spritepilot.com is
always appreciated). See LICENSE.txt.

HOW THEY WERE MADE
Drawn pixel by pixel by code written for SpritePilot. Not AI-generated, and
not traced or adapted from anyone else's art.

WHAT'S INSIDE
  16px/ and 32px/    one PNG per asset: the frames side by side, left to right
  previews/          an animated GIF of each one at 4x size, plus a still PNG
  items-pack.json    the frame size, frame count and speed of every file

  Sword            8 frames   6 fps  loops       sword-16px_strip8.png, sword-32px_strip8.png
  Axe              8 frames   6 fps  loops       axe-16px_strip8.png, axe-32px_strip8.png
  Bow              8 frames   6 fps  loops       bow-16px_strip8.png, bow-32px_strip8.png
  Magic staff      8 frames   6 fps  loops       magic-staff-16px_strip8.png, magic-staff-32px_strip8.png
  Helmet           8 frames   6 fps  loops       helmet-16px_strip8.png, helmet-32px_strip8.png
  Chest armor      8 frames   6 fps  loops       chest-armor-16px_strip8.png, chest-armor-32px_strip8.png
  Boots            8 frames   6 fps  loops       boots-16px_strip8.png, boots-32px_strip8.png
  Ring             8 frames   6 fps  loops       ring-16px_strip8.png, ring-32px_strip8.png
  Amulet           8 frames   6 fps  loops       amulet-16px_strip8.png, amulet-32px_strip8.png
  Spell scroll     8 frames   6 fps  loops       spell-scroll-16px_strip8.png, spell-scroll-32px_strip8.png
  Spell book       8 frames   6 fps  loops       spell-book-16px_strip8.png, spell-book-32px_strip8.png
  Bread            8 frames   6 fps  loops       bread-16px_strip8.png, bread-32px_strip8.png

The speeds are what each one was timed for; change them to taste.
Pixels are either fully opaque or fully transparent, so the art stays crisp
and never picks up dark fringes from blending.

USING A STRIP
The file name says how to slice it: sword-32px_strip8.png is 8 frames
of 32 x 32 pixels in one row. GameMaker reads the "_strip8" by itself.
  Godot 4   AnimatedSprite2D > SpriteFrames > Add Frames from Sprite Sheet,
            Horizontal = the frame count, Vertical = 1.
  Unity     Sprite Mode Multiple, Filter Mode Point (no filter), Compression
            None; Sprite Editor > Slice > Grid By Cell Size, 32 x 32.
  Phaser    this.load.spritesheet('sword', 'sword-32px_strip8.png',
              { frameWidth: 32, frameHeight: 32 })
  Anywhere  use nearest-neighbor ("point") filtering and scale by whole
            numbers (2x, 3x, 4x) so the pixels stay sharp.

Step-by-step guides:
  https://spritepilot.com/blog/godot-4-sprite-animation
  https://spritepilot.com/blog/unity-sprite-sheet-animation
  https://spritepilot.com/blog/phaser-sprite-sheets-and-atlases
Preview, re-time or convert any strip in your browser:
  https://spritepilot.com/sprite-player
