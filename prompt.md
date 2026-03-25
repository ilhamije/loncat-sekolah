

# Context & Requirements: Browser-based Runner Game (Chrome Dino Workflow)

### Asset Reference
We have completed Stage 1 (Assets). Use the following conceptual descriptions for the pixel art (player_sprites.png, player_actions.png, environment_sprites.png) as the visual guide for all generated game elements:
* **Player Character (player_sprites.png):** A faceless Indonesian primary school kid wearing a sharp 'Seragam Merah Putih' (Red trousers/skirt, white shirt, small red tie, red cap). Must implement 'Standing/Ready', 2-frame 'Running', 'Jumping', and 'Game Over/Crash' (lying back, 'X' eyes) states.
* **Environment (environment_sprites.png):** A seamless, tileable background showing classroom exteriors with a sign that reads 'SD NEGERI 01' and a tiled walkway.
* **Obstacles (environment_sprites.png):** Pixelated wooden school chairs and school tables. These must appear as single items, a chair-on-table stack, or multiple table stacks.

* **Prompt to create character**
this is for a game assets

create a faceless character of primary school kid, with uniform of indonesian PS, which has red and white color. the faceless kid sprites should have continued lines to separate background color and the char. The char is pixelated. No shadow needed. 

- running 1, left leg in front
- running 2, right leg in front
- walking
- jumping
- parkour jumping
- parkour kong jumping
- sad, with purple line in the background
- happy, with gold line in the background
- crawling 1, right hand in front
- crawling 2, left hand in front

Cut in GIMP or similar image editor, to produce this:
crawling1.png
crawling2.png
happy.png
jumping1.png
jumping2.png
running1.png
running2.png
sad.png
walking1.png
walking2.png

### Game Mechanics & Workflow
We need to replicate the exact structure of the standard Chrome Dino (T-Rex) game workflow using a pixelated aesthetic.

1.  **Framework:** Please build this using vanilla JavaScript with HTML5 Canvas. A minimal `index.html`, `style.css`, and a well-commented `game.js` is preferred.
2.  **Game Area:** Create a defined `<canvas>` (e.g., 800x250 pixels). The background walkway and classroom scenery (environment_sprites.png) must loop seamlessly horizontally to create the illusion of forward motion. The speed of the loop must slowly increase as the score goes up.
3.  **Player Control:** The faceless character (player_sprites.png) is positioned on the left side, slightly above the walkway. Use `spacebar` or `touchstart` (for mobile support) to initiate a jump. Implement standard gravity logic so the character returns to the ground. Maintain collision detection based on the character's bounding box.
4.  **Obstacle Spawning:** Dynamically generate school chairs and tables (environment_sprites.png) at the right edge of the canvas. Their exact position (single, stacked) and the interval between spawns must be random, ensuring gameplay variety.
5.  **Scoring & Difficulty:** Implement a score that increments every game frame (e.g., 1 point per pixel scrolled). Increase the game speed gradually based on this score. When the player character collides with an obstacle, stop the game immediately, set the character to the 'Game Over' state (player_sprites.png), and display the final score.
6.  **Persistence:** Upon Game Over, display the current score and the Highest Score achieved. *Crucially, save the Highest Score locally in the browser's `localStorage` and retrieve it on page load.*

### Output Expected
Generate the complete HTML, CSS, and JavaScript required to run a working, playable prototype of this game loop.