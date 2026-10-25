Wakebound (working title Nebula) is a dark-fantasy, souls-like action RPG with drop-in online co-op, built solo in Unity 6 and C#. You explore, fight, die at a checkpoint, spend what you earned on stats, and push toward boss fights, with a friend joining your world as host or client.

## By the numbers
- 329 first-party C# scripts, about 58,000 lines
- 4 starting classes, 7 stats, melee, bow and spell combat
- 17 AI behavior states, from patrol and pursuit to evading, kiting and guarding
- Up to 10 save slots, each storing character, inventory, equipment and world state

## Key decisions
**Who decides what, over the network.** Each player's client is authoritative for its own character and syncs health, stamina and position through networked variables. The host runs every enemy, so all players see the same AI. Damage and animation triggers go through RPCs. Remote characters ease toward the owner's latest position with frame-rate-independent smoothing instead of snapping.

**Data-driven AI.** Enemy behavior is a finite state machine whose states are ScriptableObject assets. A new enemy is assembled from existing states in the editor, not written from scratch. A perception layer (unaware, suspicious, aware, searching) decides when states may change.

**One place to set what a character may do.** Six flags control whether a character can move, rotate, run or roll during an animation. Writing them in scattered places caused ordering bugs, so every action now applies a single read-only action profile through one method.

## What was hard
**Saves that survive changes to the game.** Unity's JSON serializer can't store references to item assets, so equipment and inventory are saved as item IDs and resolved against a central item database on load. Item IDs and serialized enum values became permanent keys: changing or reordering one would break every existing save.

**Keeping co-op in sync.** Most networked values can only be written by their owner. Every new feature has to respect that, or a client silently writes a value the host throws away.

## Built with
Unity 6 (URP), C#, Netcode for GameObjects, Unity Multiplayer Services, Input System, Cinemachine, UI Toolkit / UGUI, TextMeshPro, Steamworks.
