1. Data Model & Interpretation

Your CSV contains weekly summaries, each row representing one week with metrics such as:

Week Start

Total Minutes Played

Avg Tempo (Weighted)

Avg Danceability (Weighted)

Lowest Tempo / Danceability values + corresponding songs

Highest Tempo / Danceability values + corresponding songs

Total Tracks / Tracks With Features

Graph-relevant Value Groups

Since the right-side panel must switch between Highest, Lowest, Average, the system should derive three time-series datasets per metric:

Tempo

Highest Tempo → from Highest Tempo

Lowest Tempo → from Lowest Tempo

Average Tempo → from Avg Tempo (Weighted)

Danceability

Highest Danceability → from Highest Danceability

Lowest Danceability → from Lowest Danceability

Average Danceability → from Avg Danceability (Weighted)

Thus, for each metric (Tempo or Danceability), you have a 3-way switch.

2. Page Structure
A. Navbar

A top fixed bar.

Left side: Website Title (click → scroll to landing section).

Right side: optional minimal icons (settings, info).

3. Hero Section: 3D Vinyl Record (Blender Model)

Centered on the screen:

A. Vinyl Record

Imported from Blender (GLTF or similar) into Svelte using Three.js via svelte-three.

Tilted at ~20° downward toward camera.

Resting in empty white space.

B. Interactive Behavior

Mouse drag → rotate record freely.

The camera is static; the rotation is applied to the model.

As the user scrolls:

The record rotates from ~20° tilt to exactly 90° (edge-on).

This transition is smooth and tied to scroll progress via a Svelte spring or tween.

C. Floating Data Circle

Above the tilted record: a circular “wrapped” line graph.

This circle represents the selected dataset for the chosen metric (Tempo/Danceability).

The data points are placed along the circumference in chronological order.

The points connect smoothly using a curved spline.

4. Right-Side Control Panel

Always visible in both the tilted and flat record states.

A. Top Switch: Metric Selector

Three radio-style buttons arranged vertically:

Highest

Lowest

Average

Only one can be active at a time.

Changing this updates which values are fed into the graph (Tempo or Danceability depending on the secondary selector).

B. Secondary Switch: Data Category

Two buttons (toggle group):

Tempo

Danceability

This determines which value family the buttons above refer to.

Combined Behavior Example

If you choose Tempo + Highest, you plot the Highest Tempo values over time.

If you choose Danceability + Average, you plot Avg Danceability (Weighted).

Everything updates smoothly via Svelte transitions.

5. Scroll-Down Transition to Flat Graph View

When the user scrolls:

Record Rotation

The vinyl rotates until viewed completely edge-on.

In this orientation, the circular graph above collapses into a normal 2D line graph.

Graph Transformation

The floating circle morphs into a left-aligned vertical Y-axis.

The data points reposition into a standard line chart.

Animation is continuous: each point interpolates from its circular polar coordinate to Cartesian coordinates.

Timeline Navigation

Dragging the side of the record (in this flat state) moves through time:

As you drag left/right, the visible time window shifts (like scrubbing a timeline).

Timeframe Buttons

Placed at the top left of the flat graph:

1W

1M

3M

6M

1Y

All

These filter how many weeks from the CSV are visible.

Buttons animate in/out but remain consistent with the right-side controls.

6. Svelte Architecture
A. File Structure
src/
  components/
    Navbar.svelte
    VinylScene.svelte
    CircleGraph.svelte
    LineGraph.svelte
    RightPanel.svelte
    TimeframeButtons.svelte
  stores/
    dataStore.js
    uiStore.js
  utils/
    parseCSV.js

B. Data Flow

CSV loaded → parsed into JSON → stored in dataStore.

Three derived arrays per metric are computed:

highestSeries

lowestSeries

avgSeries

UI state (selected metric / category / timeframe) is in uiStore.

The graph component reacts via subscriptions.

7. Animations & Transitions

Svelte transitions for UI elements.

Three.js tweening for record rotation and camera adjustments.

D3 or Svelte-Cubed for smooth circular ↔ linear graph transitions.

8. Accessibility & Responsiveness

Right panel collapses to bottom bar on mobile.

Graph transitions remain scroll-based but simplified.

Record rotation limited for mobile drag gestures.