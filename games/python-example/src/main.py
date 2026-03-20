"""
Bouncing Ball — Example Pyodide game.

Demonstrates:
- Canvas rendering via the JS bridge
- Animation loop using requestAnimationFrame
- Mouse click interaction
"""

import math
import random
from pyodide.ffi import create_proxy
from js import document, window

# --- Game State ---

balls = []
WIDTH = 800
HEIGHT = 500


class Ball:
    def __init__(self, x, y, radius=None, color=None):
        self.x = x
        self.y = y
        self.radius = radius or random.randint(8, 25)
        self.dx = random.uniform(-4, 4)
        self.dy = random.uniform(-4, 4)
        if self.dx == 0:
            self.dx = 2
        if self.dy == 0:
            self.dy = 2
        self.color = color or f"hsl({random.randint(0, 360)}, 70%, 60%)"

    def update(self):
        self.x += self.dx
        self.y += self.dy

        # Bounce off walls
        if self.x - self.radius <= 0 or self.x + self.radius >= WIDTH:
            self.dx = -self.dx
            self.x = max(self.radius, min(WIDTH - self.radius, self.x))
        if self.y - self.radius <= 0 or self.y + self.radius >= HEIGHT:
            self.dy = -self.dy
            self.y = max(self.radius, min(HEIGHT - self.radius, self.y))

    def draw(self, ctx):
        ctx.beginPath()
        ctx.arc(self.x, self.y, self.radius, 0, math.pi * 2)
        ctx.fillStyle = self.color
        ctx.fill()
        ctx.strokeStyle = "rgba(255,255,255,0.3)"
        ctx.lineWidth = 1
        ctx.stroke()


# --- Rendering ---

def draw_frame(ctx):
    # Clear
    ctx.fillStyle = "#111111"
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    # Draw grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)"
    ctx.lineWidth = 1
    for x in range(0, WIDTH, 40):
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, HEIGHT)
        ctx.stroke()
    for y in range(0, HEIGHT, 40):
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(WIDTH, y)
        ctx.stroke()

    # Update and draw balls
    for ball in balls:
        ball.update()
        ball.draw(ctx)

    # HUD
    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.font = "14px monospace"
    ctx.fillText(f"Balls: {len(balls)}  |  Click to add more", 12, 24)


# --- Main ---

def main(canvas_el, ctx):
    global WIDTH, HEIGHT

    if canvas_el is None or ctx is None:
        print("Error: no canvas available")
        return

    WIDTH = canvas_el.width
    HEIGHT = canvas_el.height

    # Spawn initial balls
    for _ in range(5):
        balls.append(Ball(
            random.uniform(50, WIDTH - 50),
            random.uniform(50, HEIGHT - 50),
        ))

    # Click handler: add a ball at click position
    def on_click(event):
        rect = canvas_el.getBoundingClientRect()
        # Scale from CSS size to canvas pixel size
        scale_x = WIDTH / rect.width
        scale_y = HEIGHT / rect.height
        x = (event.clientX - rect.left) * scale_x
        y = (event.clientY - rect.top) * scale_y
        balls.append(Ball(x, y))

    canvas_el.addEventListener("click", create_proxy(on_click))

    # Animation loop
    def animate(*args):
        draw_frame(ctx)
        window.requestAnimationFrame(animate_proxy)

    animate_proxy = create_proxy(animate)
    window.requestAnimationFrame(animate_proxy)

    print(f"Game started with {len(balls)} balls. Click the canvas to add more!")
