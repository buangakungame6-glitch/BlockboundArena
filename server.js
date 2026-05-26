// ============================================================
// Blockbound Arena — Standalone Game Server
// Self-contained Node.js server with Express + Socket.IO
// ============================================================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const crypto = require("crypto");

// ============================================================
// UUID helper (replaces uuid v4 import)
// ============================================================

function uuidv4() {
  return crypto.randomUUID();
}

// ============================================================
// Block Shapes
// ============================================================

const BLOCK_SHAPES = [
  { id: "single", cells: [{ row: 0, col: 0 }], color: 1 },
  { id: "domino_h", cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }], color: 2 },
  { id: "domino_v", cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }], color: 2 },
  {
    id: "l_small",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    color: 3,
  },
  {
    id: "l_small_rev",
    cells: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    color: 3,
  },
  {
    id: "l_big",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
    color: 4,
  },
  {
    id: "l_big_rev",
    cells: [
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
    color: 4,
  },
  {
    id: "t_shape",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
    ],
    color: 5,
  },
  {
    id: "square_2",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    color: 6,
  },
  {
    id: "square_3",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
    color: 7,
  },
  {
    id: "line_3_h",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ],
    color: 1,
  },
  {
    id: "line_3_v",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ],
    color: 1,
  },
  {
    id: "line_4_h",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
    ],
    color: 2,
  },
  {
    id: "line_4_v",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
    ],
    color: 2,
  },
  {
    id: "line_5_h",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ],
    color: 3,
  },
  {
    id: "line_5_v",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 4, col: 0 },
    ],
    color: 3,
  },
  {
    id: "s_shape",
    cells: [
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    color: 4,
  },
  {
    id: "z_shape",
    cells: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ],
    color: 5,
  },
  {
    id: "big_l",
    cells: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
    color: 6,
  },
  {
    id: "big_l_rev",
    cells: [
      { row: 0, col: 2 },
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
    color: 6,
  },
  {
    id: "plus",
    cells: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 1 },
    ],
    color: 7,
  },
];

// ============================================================
// Character / Skill Definitions
// ============================================================

const CHARACTERS = [
  {
    id: "arcane_hacker",
    name: "Arcane Hacker",
    skillName: "Corrupt",
    skillDesc: "Add 3 random blocks to target's board",
    energyCost: 30,
    cooldown: 3,
  },
  {
    id: "time_keeper",
    name: "Time Keeper",
    skillName: "Slow Motion",
    skillDesc: "Slow down target for a few seconds",
    energyCost: 25,
    cooldown: 4,
  },
  {
    id: "bomber_dwarf",
    name: "Bomber Dwarf",
    skillName: "Boom Burst",
    skillDesc: "Clear a 3x3 area on your own board",
    energyCost: 35,
    cooldown: 3,
  },
  {
    id: "trickster",
    name: "Trickster",
    skillName: "Dizzy Board",
    skillDesc: "Rotate target's board visually for confusion",
    energyCost: 25,
    cooldown: 4,
  },
  {
    id: "architect",
    name: "Architect",
    skillName: "Perfect Piece",
    skillDesc: "Get a perfect line-clearing block",
    energyCost: 40,
    cooldown: 5,
  },
  {
    id: "vampire_lord",
    name: "Vampire Lord",
    skillName: "Blood Drain",
    skillDesc: "Line clears also add garbage to opponents",
    energyCost: 30,
    cooldown: 4,
  },
  {
    id: "magnet_mage",
    name: "Magnet Mage",
    skillName: "Magnetic Pull",
    skillDesc: "Merge 2 isolated blocks on your board",
    energyCost: 20,
    cooldown: 3,
  },
  {
    id: "joker",
    name: "Joker",
    skillName: "Lucky Spin",
    skillDesc: "Random effect: buff, nerf opponent, or self-disaster",
    energyCost: 15,
    cooldown: 2,
  },
  {
    id: "samurai",
    name: "Samurai",
    skillName: "Phantom Slash",
    skillDesc: "Clear the most-filled horizontal line",
    energyCost: 35,
    cooldown: 3,
  },
];

// ============================================================
// Constants
// ============================================================

const BOARD_SIZE = 10;
const MAX_PLAYERS = 5;
const ROOM_INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const AI_MOVE_INTERVAL_MIN = 3000;
const AI_MOVE_INTERVAL_MAX = 5000;
const GAME_TICK_INTERVAL = 1000;

// ============================================================
// State (module-scoped singleton)
// ============================================================

const rooms = new Map();
const socketToRoom = new Map();
const socketToPlayerId = new Map();
let ioInstance = null;
let cleanupInterval = null;

// ============================================================
// Utility Functions
// ============================================================

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createEmptyBoard() {
  const board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    board.push(new Array(BOARD_SIZE).fill(0));
  }
  return board;
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function getPlayersArray(room) {
  return Array.from(room.players.values());
}

function getAlivePlayers(room) {
  return getPlayersArray(room).filter((p) => p.isAlive);
}

let _blockIdCounter = 0;

function getRandomBlock() {
  const template = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
  _blockIdCounter++;
  return {
    id: `blk_${Date.now()}_${_blockIdCounter}`,
    cells: template.cells.map(c => ({ ...c })),
    color: template.color,
  };
}

function generateAvailableBlocks() {
  // Pick 3 DIFFERENT shape templates (no duplicates)
  const shuffled = [...BLOCK_SHAPES].sort(() => Math.random() - 0.5);
  const picked = [];
  _blockIdCounter++;
  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    const template = shuffled[i];
    _blockIdCounter++;
    picked.push({
      id: `blk_${Date.now()}_${_blockIdCounter}`,
      cells: template.cells.map(c => ({ ...c })),
      color: template.color,
    });
  }
  return picked;
}

function canPlaceAnyBlock(board, blocks) {
  for (const block of blocks) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (validateBlockPlacement(board, block, { row, col })) {
          return true;
        }
      }
    }
  }
  return false;
}

function countOccupiedCells(board) {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) count++;
    }
  }
  return count;
}

// ============================================================
// Room Cleanup
// ============================================================

function cleanupEmptyRooms() {
  const now = Date.now();
  for (const [roomId, room] of rooms) {
    if (room.players.size === 0 && now - room.lastActivityAt > ROOM_INACTIVITY_TIMEOUT) {
      if (room.gameTickInterval) clearInterval(room.gameTickInterval);
      if (room.aiInterval) clearInterval(room.aiInterval);
      rooms.delete(roomId);
      console.log(`[Room Cleanup] Deleted inactive room: ${roomId}`);
    }
  }
}

// ============================================================
// Validation
// ============================================================

function validateBlockPlacement(board, block, position) {
  for (const cell of block.cells) {
    const r = position.row + cell.row;
    const c = position.col + cell.col;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] !== 0) return false;
  }
  return true;
}

// ============================================================
// Line Clear Logic
// ============================================================

function checkAndClearLines(board, combo, playerHasBloodDrain) {
  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) fullRows.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  if (fullRows.length === 0 && fullCols.length === 0) {
    return { rowsCleared: [], colsCleared: [], score: 0, energyGained: 0, combo: 0, events: [] };
  }

  const events = [];

  for (const r of fullRows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      board[r][c] = 0;
    }
  }

  for (const c of fullCols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][c] = 0;
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    const nonEmpty = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (board[r][c] !== 0) {
        nonEmpty.push(board[r][c]);
      }
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][c] = 0;
    }
    for (let i = 0; i < nonEmpty.length; i++) {
      board[BOARD_SIZE - 1 - i][c] = nonEmpty[i];
    }
  }

  const totalLines = fullRows.length + fullCols.length;
  const newCombo = combo + 1;

  const lineScoreMap = { 1: 100, 2: 300, 3: 600, 4: 1000, 5: 1500 };
  const baseScore = lineScoreMap[Math.min(totalLines, 5)] ?? totalLines * 300;
  const comboMultiplier = 1 + (newCombo - 1) * 0.5;
  const score = Math.floor(baseScore * comboMultiplier);
  const energyGained = Math.min(10 + totalLines * 5 + newCombo * 2, 50);

  if (totalLines > 0) {
    events.push({
      type: "lines_cleared",
      data: { rows: fullRows.length, cols: fullCols.length, total: totalLines, combo: newCombo },
    });
  }

  if (playerHasBloodDrain) {
    events.push({ type: "blood_drain_trigger", data: { lines: totalLines } });
  }

  return { rowsCleared: fullRows, colsCleared: fullCols, score, energyGained, combo: newCombo, events };
}

// ============================================================
// Skill Implementations
// ============================================================

function applyCorrupt(target) {
  const events = [];
  let placed = 0;
  let attempts = 0;
  while (placed < 3 && attempts < 50) {
    attempts++;
    const r = Math.floor(Math.random() * BOARD_SIZE);
    const c = Math.floor(Math.random() * BOARD_SIZE);
    if (target.board[r][c] === 0) {
      target.board[r][c] = Math.floor(Math.random() * 7) + 1;
      placed++;
    }
  }
  events.push({
    type: "skill_effect",
    playerId: target.id,
    targetId: target.id,
    data: { skill: "corrupt", blocksPlaced: placed },
  });
  return events;
}

function applySlowMotion(target) {
  target.statusEffects.slowMotion = true;
  setTimeout(() => {
    target.statusEffects.slowMotion = false;
  }, 8000);
  return [
    {
      type: "skill_effect",
      playerId: target.id,
      targetId: target.id,
      data: { skill: "slow_motion", duration: 8 },
    },
  ];
}

function applyBoomBurst(player) {
  const events = [];
  let bestR = 4,
    bestC = 4,
    bestDensity = 0;

  for (let r = 1; r < BOARD_SIZE - 1; r++) {
    for (let c = 1; c < BOARD_SIZE - 1; c++) {
      let density = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (player.board[r + dr][c + dc] !== 0) density++;
        }
      }
      if (density > bestDensity) {
        bestDensity = density;
        bestR = r;
        bestC = c;
      }
    }
  }

  let cleared = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = bestR + dr;
      const c = bestC + dc;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && player.board[r][c] !== 0) {
        player.board[r][c] = 0;
        cleared++;
      }
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    const nonEmpty = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (player.board[r][c] !== 0) nonEmpty.push(player.board[r][c]);
    }
    for (let r = 0; r < BOARD_SIZE; r++) player.board[r][c] = 0;
    for (let i = 0; i < nonEmpty.length; i++) {
      player.board[BOARD_SIZE - 1 - i][c] = nonEmpty[i];
    }
  }

  events.push({
    type: "skill_effect",
    playerId: player.id,
    data: { skill: "boom_burst", center: { row: bestR, col: bestC }, cleared },
  });
  return events;
}

function applyDizzyBoard(target) {
  target.statusEffects.dizzyBoard = true;
  setTimeout(() => {
    target.statusEffects.dizzyBoard = false;
  }, 6000);
  return [
    {
      type: "skill_effect",
      playerId: target.id,
      targetId: target.id,
      data: { skill: "dizzy_board", duration: 6 },
    },
  ];
}

function applyPerfectPiece(player) {
  player.statusEffects.perfectPiece = true;
  return [
    {
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "perfect_piece" },
    },
  ];
}

function applyBloodDrain(player) {
  player.statusEffects.bloodDrain = true;
  return [
    {
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "blood_drain" },
    },
  ];
}

function applyMagneticPull(player) {
  const events = [];
  const isolatedCells = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (player.board[r][c] !== 0) {
        let hasNeighbor = false;
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && player.board[nr][nc] !== 0) {
            hasNeighbor = true;
            break;
          }
        }
        if (!hasNeighbor) {
          isolatedCells.push({ r, c, color: player.board[r][c] });
        }
      }
    }
  }

  if (isolatedCells.length >= 2) {
    for (let i = 0; i < Math.min(2, isolatedCells.length); i++) {
      const cell = isolatedCells[i];
      player.board[cell.r][cell.c] = 0;
    }

    let placed = 0;
    for (let c = 0; c < BOARD_SIZE && placed < 2; c++) {
      for (let r = BOARD_SIZE - 1; r >= 0 && placed < 2; r--) {
        if (player.board[r][c] === 0) {
          player.board[r][c] = isolatedCells[placed].color;
          placed++;
          break;
        }
      }
    }

    events.push({
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "magnetic_pull", merged: placed },
    });
  } else {
    events.push({
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "magnetic_pull", merged: 0 },
    });
  }
  return events;
}

function applyLuckySpin(player, allPlayers) {
  const roll = Math.random();
  const events = [];

  if (roll < 0.5) {
    player.energy = Math.min(player.energy + 20, player.maxEnergy);
    player.score += 50;
    events.push({
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "lucky_spin", result: "buff", energyGained: 20, scoreGained: 50 },
    });
  } else if (roll < 0.8) {
    const opponents = allPlayers.filter((p) => p.id !== player.id && p.isAlive);
    if (opponents.length > 0) {
      const target = opponents[Math.floor(Math.random() * opponents.length)];
      const corruptEvents = applyCorrupt(target);
      events.push(...corruptEvents);
      events.push({
        type: "skill_effect",
        playerId: player.id,
        targetId: target.id,
        data: { skill: "lucky_spin", result: "nerf_opponent", targetName: target.name },
      });
    } else {
      player.energy = Math.min(player.energy + 10, player.maxEnergy);
      events.push({
        type: "skill_effect",
        playerId: player.id,
        data: { skill: "lucky_spin", result: "buff", energyGained: 10 },
      });
    }
  } else {
    const corruptEvents = applyCorrupt(player);
    events.push(...corruptEvents);
    events.push({
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "lucky_spin", result: "self_disaster" },
    });
  }

  return events;
}

function applyPhantomSlash(player) {
  const events = [];
  for (let r = BOARD_SIZE - 1; r >= 0; r--) {
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (player.board[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        player.board[r][c] = 0;
      }
      for (let c = 0; c < BOARD_SIZE; c++) {
        const nonEmpty = [];
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
          if (player.board[row][c] !== 0) nonEmpty.push(player.board[row][c]);
        }
        for (let row = 0; row < BOARD_SIZE; row++) player.board[row][c] = 0;
        for (let i = 0; i < nonEmpty.length; i++) {
          player.board[BOARD_SIZE - 1 - i][c] = nonEmpty[i];
        }
      }
      events.push({
        type: "skill_effect",
        playerId: player.id,
        data: { skill: "phantom_slash", rowCleared: r },
      });
      break;
    }
  }

  if (events.length === 0) {
    events.push({
      type: "skill_effect",
      playerId: player.id,
      data: { skill: "phantom_slash", rowCleared: -1 },
    });
  }

  return events;
}

function executeSkill(player, characterId, targetId, allPlayers) {
  switch (characterId) {
    case "arcane_hacker": {
      const target = allPlayers.find((p) => p.id === targetId && p.id !== player.id && p.isAlive);
      if (!target) return [{ type: "skill_failed", playerId: player.id, data: { reason: "invalid_target" } }];
      player.energy -= 30;
      player.skillCooldown = 3;
      return applyCorrupt(target);
    }
    case "time_keeper": {
      const target = allPlayers.find((p) => p.id === targetId && p.id !== player.id && p.isAlive);
      if (!target) return [{ type: "skill_failed", playerId: player.id, data: { reason: "invalid_target" } }];
      player.energy -= 25;
      player.skillCooldown = 4;
      return applySlowMotion(target);
    }
    case "bomber_dwarf": {
      player.energy -= 35;
      player.skillCooldown = 3;
      return applyBoomBurst(player);
    }
    case "trickster": {
      const target = allPlayers.find((p) => p.id === targetId && p.id !== player.id && p.isAlive);
      if (!target) return [{ type: "skill_failed", playerId: player.id, data: { reason: "invalid_target" } }];
      player.energy -= 25;
      player.skillCooldown = 4;
      return applyDizzyBoard(target);
    }
    case "architect": {
      player.energy -= 40;
      player.skillCooldown = 5;
      return applyPerfectPiece(player);
    }
    case "vampire_lord": {
      player.energy -= 30;
      player.skillCooldown = 4;
      return applyBloodDrain(player);
    }
    case "magnet_mage": {
      player.energy -= 20;
      player.skillCooldown = 3;
      return applyMagneticPull(player);
    }
    case "joker": {
      player.energy -= 15;
      player.skillCooldown = 2;
      return applyLuckySpin(player, allPlayers);
    }
    case "samurai": {
      player.energy -= 35;
      player.skillCooldown = 3;
      return applyPhantomSlash(player);
    }
    default:
      return [{ type: "skill_failed", playerId: player.id, data: { reason: "unknown_character" } }];
  }
}

function getCharacterDef(characterId) {
  return CHARACTERS.find((c) => c.id === characterId);
}

// ============================================================
// Game Over Check
// ============================================================

function checkGameOver(room) {
  const alivePlayers = getAlivePlayers(room);
  if (alivePlayers.length <= 1) {
    room.status = "finished";
    room.winner = alivePlayers.length === 1 ? alivePlayers[0].id : room.hostId;

    const allPlayers = getPlayersArray(room);
    allPlayers.sort((a, b) => {
      if (a.isAlive && !b.isAlive) return -1;
      if (!a.isAlive && b.isAlive) return 1;
      return b.score - a.score;
    });

    const rankings = allPlayers.map((p, idx) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      characterId: p.characterId,
      isAlive: p.isAlive,
      rank: idx + 1,
    }));

    ioInstance.to(room.id).emit("game-over", {
      winnerId: room.winner,
      rankings,
    });

    if (room.gameTickInterval) {
      clearInterval(room.gameTickInterval);
      room.gameTickInterval = undefined;
    }
    if (room.aiInterval) {
      clearInterval(room.aiInterval);
      room.aiInterval = undefined;
    }

    return true;
  }
  return false;
}

// ============================================================
// Check if board is full (for elimination)
// ============================================================

function isBoardFull(board) {
  return countOccupiedCells(board) >= BOARD_SIZE * BOARD_SIZE * 0.85;
}

// ============================================================
// Broadcast Game State
// ============================================================

function broadcastGameState(room, events = []) {
  const players = getPlayersArray(room);
  const gameState = {
    players: players.map((p) => ({
      ...p,
      board: cloneBoard(p.board),
      // Strip availableBlocks from broadcast to prevent
      // race condition with optimistic client removal.
      // Blocks are sent via dedicated per-player events instead.
      availableBlocks: undefined,
    })),
    events,
  };

  ioInstance.to(room.id).emit("game-state-update", {
    players: gameState.players,
  });
}

// ============================================================
// AI Player Logic
// ============================================================

function aiMakeMove(room) {
  if (room.status !== "playing") return;

  for (const player of room.players.values()) {
    if (!player.isAI || !player.isAlive) continue;

    const block = player.availableBlocks[Math.floor(Math.random() * player.availableBlocks.length)];
    if (!block) continue;

    let placed = false;
    for (let row = BOARD_SIZE - 1; row >= 0 && !placed; row--) {
      for (let col = 0; col < BOARD_SIZE && !placed; col++) {
        if (validateBlockPlacement(player.board, block, { row, col })) {
          for (const cell of block.cells) {
            const r = row + cell.row;
            const c = col + cell.col;
            player.board[r][c] = block.color;
          }

          const clearResult = checkAndClearLines(
            player.board,
            player.combo,
            player.statusEffects.bloodDrain
          );

          player.score += clearResult.score;
          player.energy = Math.min(player.energy + clearResult.energyGained, player.maxEnergy);
          if (clearResult.combo > player.combo) {
            player.combo = clearResult.combo;
          } else if (clearResult.combo === 0) {
            player.combo = 0;
          }

          if (player.statusEffects.bloodDrain && clearResult.rowsCleared.length + clearResult.colsCleared.length > 0) {
            const opponents = getAlivePlayers(room).filter((p) => p.id !== player.id);
            if (opponents.length > 0) {
              const target = opponents[Math.floor(Math.random() * opponents.length)];
              applyCorrupt(target);
            }
          }

          player.energy = Math.min(player.energy + 3, player.maxEnergy);

          if (isBoardFull(player.board)) {
            player.isAlive = false;
            ioInstance.to(room.id).emit("player-eliminated", { playerId: player.id });
            checkGameOver(room);
          }

          // Remove placed block from AI's available blocks
          const aiBlockIdx = player.availableBlocks.findIndex(b => b.id === block.id);
          if (aiBlockIdx !== -1) {
            player.availableBlocks.splice(aiBlockIdx, 1);
          }
          // Only give new blocks when ALL 3 are used
          if (player.availableBlocks.length === 0) {
            player.availableBlocks = generateAvailableBlocks();
          } else if (!canPlaceAnyBlock(player.board, player.availableBlocks)) {
            // No remaining block can fit → AI is stuck → eliminated
            player.isAlive = false;
            ioInstance.to(room.id).emit("player-eliminated", { playerId: player.id });
            checkGameOver(room);
          }

          placed = true;
        }
      }
    }

    if (player.energy >= 25 && Math.random() < 0.3) {
      const charDef = getCharacterDef(player.characterId);
      if (charDef && player.skillCooldown <= 0) {
        const opponents = getAlivePlayers(room).filter((p) => p.id !== player.id);
        const targetId = opponents.length > 0 ? opponents[Math.floor(Math.random() * opponents.length)].id : undefined;
        const allPlayers = getAlivePlayers(room);
        executeSkill(player, player.characterId, targetId, allPlayers);
      }
    }

    if (player.skillCooldown > 0) {
      player.skillCooldown--;
    }
  }

  broadcastGameState(room);
}

function startAIInterval(room) {
  if (room.aiInterval) clearInterval(room.aiInterval);

  room.aiInterval = setInterval(() => {
    aiMakeMove(room);
  }, AI_MOVE_INTERVAL_MIN + Math.random() * (AI_MOVE_INTERVAL_MAX - AI_MOVE_INTERVAL_MIN));
}

// ============================================================
// Game Tick
// ============================================================

function startGameTick(room) {
  if (room.gameTickInterval) clearInterval(room.gameTickInterval);

  room.gameTickInterval = setInterval(() => {
    if (room.status !== "playing") return;
    room.lastActivityAt = Date.now();
    broadcastGameState(room);
  }, GAME_TICK_INTERVAL);
}

// ============================================================
// Helpers
// ============================================================

function getPlayerRoom(socketId) {
  const roomId = socketToRoom.get(socketId);
  if (!roomId) return undefined;
  return rooms.get(roomId);
}

function createPlayerState(id, name, socketId, isAI = false) {
  return {
    id,
    name,
    characterId: "",
    board: createEmptyBoard(),
    energy: 0,
    maxEnergy: 100,
    score: 0,
    combo: 0,
    isAlive: true,
    isReady: false,
    skillCooldown: 0,
    maxSkillCooldown: 5,
    socketId,
    isAI,
    statusEffects: {
      slowMotion: false,
      dizzyBoard: false,
      bloodDrain: false,
      perfectPiece: false,
    },
    lastMoveTime: Date.now(),
    availableBlocks: generateAvailableBlocks(),
  };
}

function createAIPlayer(room) {
  const aiId = `ai_${uuidv4().slice(0, 8)}`;
  const aiNames = ["Bot Alpha", "Bot Beta", "Bot Gamma", "Bot Delta", "Bot Omega"];
  const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
  const ai = createPlayerState(aiId, aiName, "", true);

  const character = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  ai.characterId = character.id;
  ai.isReady = true;

  room.players.set(aiId, ai);
  return ai;
}

// ============================================================
// Socket.IO Connection Handler (all game event wiring)
// ============================================================

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[Game] Socket connected: ${socket.id}`);

    // ---- Create Room ----
    socket.on("create-room", (data) => {
      const { playerName, mode } = data;
      const roomId = generateRoomId();
      const playerId = uuidv4();

      const player = createPlayerState(playerId, playerName, socket.id);
      const room = {
        id: roomId,
        hostId: playerId,
        players: new Map([[playerId, player]]),
        status: "waiting",
        mode,
        maxPlayers: mode === "duel" ? 2 : MAX_PLAYERS,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        availableBlocks: generateAvailableBlocks(),
      };

      rooms.set(roomId, room);
      socketToRoom.set(socket.id, roomId);
      socketToPlayerId.set(socket.id, playerId);
      socket.join(roomId);

      if (mode === "duel") {
        createAIPlayer(room);
      }

      socket.emit("room-created", { roomId, mode, playerId });
      io.to(roomId).emit("room-update", { players: getPlayersArray(room) });
      console.log(`[Room] ${playerName} created room ${roomId} (${mode})`);
    });

    // ---- Join Room ----
    socket.on("join-room", (data) => {
      const { roomId, playerName } = data;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.status !== "waiting") {
        socket.emit("error", { message: "Game already in progress" });
        return;
      }

      if (room.players.size >= room.maxPlayers) {
        socket.emit("error", { message: "Room is full" });
        return;
      }

      const playerId = uuidv4();
      const player = createPlayerState(playerId, playerName, socket.id);

      room.players.set(playerId, player);
      room.lastActivityAt = Date.now();

      socketToRoom.set(socket.id, roomId);
      socketToPlayerId.set(socket.id, playerId);
      socket.join(roomId);

      socket.emit("room-joined", { roomId, mode: room.mode, playerId, players: getPlayersArray(room) });
      io.to(roomId).emit("room-update", { players: getPlayersArray(room) });
      console.log(`[Room] ${playerName} joined room ${roomId}`);
    });

    // ---- Leave Room ----
    socket.on("leave-room", () => {
      const roomId = socketToRoom.get(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!roomId || !playerId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      room.players.delete(playerId);
      socketToRoom.delete(socket.id);
      socketToPlayerId.delete(socket.id);
      socket.leave(roomId);

      room.lastActivityAt = Date.now();

      if (room.players.size === 0) {
        if (room.gameTickInterval) clearInterval(room.gameTickInterval);
        if (room.aiInterval) clearInterval(room.aiInterval);
        rooms.delete(roomId);
        console.log(`[Room] Room ${roomId} deleted (empty)`);
      } else {
        if (room.hostId === playerId) {
          const newHost = getPlayersArray(room)[0];
          room.hostId = newHost.id;
        }
        io.to(roomId).emit("room-update", { players: getPlayersArray(room) });

        if (room.status === "playing") {
          checkGameOver(room);
        }
      }

      console.log(`[Room] Player ${playerId} left room ${roomId}`);
    });

    // ---- Get Rooms ----
    socket.on("get-rooms", (callback) => {
      const roomList = Array.from(rooms.values())
        .filter((r) => r.status === "waiting")
        .map((r) => ({
          id: r.id,
          mode: r.mode,
          playerCount: r.players.size,
          maxPlayers: r.maxPlayers,
          status: r.status,
        }));
      callback(roomList);
    });

    // ---- Room Info ----
    socket.on("room-info", (data, callback) => {
      const room = rooms.get(data.roomId);
      if (!room) {
        callback(undefined);
        return;
      }
      callback({
        id: room.id,
        mode: room.mode,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        status: room.status,
        players: getPlayersArray(room),
      });
    });

    // ---- Select Character ----
    socket.on("select-character", (data) => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      const player = room.players.get(playerId);
      if (!player) return;

      if (room.status !== "waiting") {
        socket.emit("error", { message: "Cannot change character during game" });
        return;
      }

      const charDef = getCharacterDef(data.characterId);
      if (!charDef) {
        socket.emit("error", { message: "Invalid character" });
        return;
      }

      player.characterId = data.characterId;
      player.isReady = false;

      io.to(room.id).emit("room-update", { players: getPlayersArray(room) });
    });

    // ---- Player Ready ----
    socket.on("player-ready", (data) => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      const player = room.players.get(playerId);
      if (!player) return;

      if (room.status !== "waiting") {
        socket.emit("error", { message: "Cannot toggle ready during game" });
        return;
      }

      if (!player.characterId) {
        socket.emit("error", { message: "Select a character first" });
        return;
      }

      player.isReady = data.ready;
      room.lastActivityAt = Date.now();

      io.to(room.id).emit("room-update", { players: getPlayersArray(room) });
    });

    // ---- Start Game ----
    socket.on("start-game", () => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      if (room.hostId !== playerId) {
        socket.emit("error", { message: "Only the host can start the game" });
        return;
      }

      if (room.status !== "waiting") {
        socket.emit("error", { message: "Game already in progress" });
        return;
      }

      const players = getPlayersArray(room);
      const unreadyPlayers = players.filter((p) => !p.isReady || !p.characterId);
      if (unreadyPlayers.length > 0) {
        socket.emit("error", { message: "All players must be ready and have a character selected" });
        return;
      }

      if (room.players.size < 2) {
        socket.emit("error", { message: "Need at least 2 players to start" });
        return;
      }

      for (const player of room.players.values()) {
        player.board = createEmptyBoard();
        player.energy = 0;
        player.score = 0;
        player.combo = 0;
        player.isAlive = true;
        player.isReady = false;
        player.skillCooldown = 0;
        player.statusEffects = {
          slowMotion: false,
          dizzyBoard: false,
          bloodDrain: false,
          perfectPiece: false,
        };
        player.lastMoveTime = Date.now();

        const charDef = getCharacterDef(player.characterId);
        if (charDef) {
          player.maxSkillCooldown = charDef.cooldown;
        }
        player.availableBlocks = generateAvailableBlocks();
      }

      room.status = "playing";
      room.availableBlocks = generateAvailableBlocks();
      room.lastActivityAt = Date.now();

      startGameTick(room);
      startAIInterval(room);

      const gameState = {
        players: getPlayersArray(room).map((p) => ({
          ...p,
          board: cloneBoard(p.board),
        })),
        events: [],
      };

      io.to(room.id).emit("game-started", {
        players: gameState.players,
        startTime: Date.now(),
      });
      console.log(`[Game] Game started in room ${room.id} with ${room.players.size} players`);
    });

    // ---- Place Block ----
    socket.on("place-block", (data) => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      if (room.status !== "playing") {
        socket.emit("error", { message: "Game is not in progress" });
        return;
      }

      const player = room.players.get(playerId);
      if (!player || !player.isAlive) {
        socket.emit("error", { message: "Cannot place block" });
        return;
      }

      const { block, position } = data;

      if (!validateBlockPlacement(player.board, block, position)) {
        socket.emit("error", { message: "Invalid block placement" });
        return;
      }

      for (const cell of block.cells) {
        const r = position.row + cell.row;
        const c = position.col + cell.col;
        player.board[r][c] = block.color;
      }

      const clearResult = checkAndClearLines(player.board, player.combo, player.statusEffects.bloodDrain);

      player.score += clearResult.score + 10;
      player.energy = Math.min(player.energy + clearResult.energyGained + 3, player.maxEnergy);
      if (clearResult.combo > player.combo) {
        player.combo = clearResult.combo;
      } else if (clearResult.combo === 0) {
        player.combo = 0;
      }

      const events = [...clearResult.events];

      if (
        player.statusEffects.bloodDrain &&
        clearResult.rowsCleared.length + clearResult.colsCleared.length > 0
      ) {
        const opponents = getAlivePlayers(room).filter((p) => p.id !== player.id);
        if (opponents.length > 0) {
          const target = opponents[Math.floor(Math.random() * opponents.length)];
          const corruptEvents = applyCorrupt(target);
          events.push(...corruptEvents);

          if (isBoardFull(target.board)) {
            target.isAlive = false;
            events.push({ type: "player_eliminated", playerId: target.id });
            io.to(room.id).emit("player-eliminated", { playerId: target.id });
          }
        }
      }

      // Queue Perfect Piece for next block set (don't override current blocks)
      let pendingPerfectPiece = false;
      if (player.statusEffects.perfectPiece) {
        pendingPerfectPiece = true;
        player.statusEffects.perfectPiece = false;
        events.push({ type: "perfect_piece_generated", playerId: player.id });
      }

      // Remove the placed block from player's available blocks
      const blockIdx = player.availableBlocks.findIndex(b => b.id === block.id);
      if (blockIdx !== -1) {
        player.availableBlocks.splice(blockIdx, 1);
      }
      // Only give new blocks when ALL 3 are used
      if (player.availableBlocks.length === 0) {
        if (pendingPerfectPiece) {
          _blockIdCounter++;
          const perfectBlock = {
            id: `blk_${Date.now()}_${_blockIdCounter}`,
            cells: [
              { row: 0, col: 0 },
              { row: 0, col: 1 },
              { row: 0, col: 2 },
              { row: 0, col: 3 },
              { row: 0, col: 4 },
              { row: 0, col: 5 },
              { row: 0, col: 6 },
              { row: 0, col: 7 },
              { row: 0, col: 8 },
              { row: 0, col: 9 },
            ],
            color: 7,
          };
          player.availableBlocks = [perfectBlock, getRandomBlock(), getRandomBlock()];
        } else {
          player.availableBlocks = generateAvailableBlocks();
        }
      } else if (!canPlaceAnyBlock(player.board, player.availableBlocks)) {
        // No remaining block can fit → player is stuck → eliminated
        player.isAlive = false;
        events.push({ type: "player_eliminated", playerId: player.id });
        io.to(room.id).emit("player-eliminated", { playerId: player.id });
      }

      if (isBoardFull(player.board)) {
        player.isAlive = false;
        events.push({ type: "player_eliminated", playerId: player.id });
        io.to(room.id).emit("player-eliminated", { playerId: player.id });
      }

      player.lastMoveTime = Date.now();
      room.lastActivityAt = Date.now();

      // Send updated blocks directly to this player ONLY
      // (avoids race condition with 1-second tick broadcast)
      socket.emit("blocks-update", {
        availableBlocks: player.availableBlocks,
      });

      broadcastGameState(room, events);
      checkGameOver(room);
    });

    // ---- Use Skill ----
    socket.on("use-skill", (data) => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      if (room.status !== "playing") {
        socket.emit("error", { message: "Game is not in progress" });
        return;
      }

      const player = room.players.get(playerId);
      if (!player || !player.isAlive) {
        socket.emit("error", { message: "Cannot use skill" });
        return;
      }

      if (!player.characterId) {
        socket.emit("error", { message: "No character selected" });
        return;
      }

      const charDef = getCharacterDef(player.characterId);
      if (!charDef) {
        socket.emit("error", { message: "Invalid character" });
        return;
      }

      if (player.energy < charDef.energyCost) {
        socket.emit("error", { message: "Not enough energy" });
        return;
      }

      if (player.skillCooldown > 0) {
        socket.emit("error", { message: `Skill on cooldown (${player.skillCooldown} turns)` });
        return;
      }

      const allPlayers = getAlivePlayers(room);
      const events = executeSkill(player, player.characterId, data.targetId, allPlayers);

      const skillEvent = events.find((e) => e.type === "skill_effect");
      if (skillEvent) {
        io.to(room.id).emit("skill-used", {
          sourceId: player.id,
          targetId: skillEvent.targetId,
          characterId: player.characterId,
          skillName: charDef.skillName,
        });
      }

      for (const p of room.players.values()) {
        if (p.isAlive && isBoardFull(p.board)) {
          p.isAlive = false;
          io.to(room.id).emit("player-eliminated", { playerId: p.id });
        }
      }

      player.lastMoveTime = Date.now();
      room.lastActivityAt = Date.now();

      broadcastGameState(room, events);
      checkGameOver(room);
    });

    // ---- Play Again ----
    socket.on("play-again", () => {
      const room = getPlayerRoom(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!room || !playerId) return;

      if (room.status !== "finished") {
        socket.emit("error", { message: "Game is not finished" });
        return;
      }

      if (room.hostId !== playerId) {
        socket.emit("error", { message: "Only the host can restart the game" });
        return;
      }

      for (const player of room.players.values()) {
        player.board = createEmptyBoard();
        player.energy = 0;
        player.score = 0;
        player.combo = 0;
        player.isAlive = true;
        player.isReady = false;
        player.skillCooldown = 0;
        player.statusEffects = {
          slowMotion: false,
          dizzyBoard: false,
          bloodDrain: false,
          perfectPiece: false,
        };
        player.lastMoveTime = Date.now();
        player.availableBlocks = generateAvailableBlocks();
      }

      const aiPlayers = getPlayersArray(room).filter((p) => p.isAI);
      for (const ai of aiPlayers) {
        room.players.delete(ai.id);
      }

      if (room.mode === "duel" && room.players.size < 2) {
        createAIPlayer(room);
      }

      room.status = "waiting";
      room.winner = undefined;
      room.availableBlocks = generateAvailableBlocks();
      room.lastActivityAt = Date.now();

      if (room.gameTickInterval) {
        clearInterval(room.gameTickInterval);
        room.gameTickInterval = undefined;
      }
      if (room.aiInterval) {
        clearInterval(room.aiInterval);
        room.aiInterval = undefined;
      }

      io.to(room.id).emit("room-update", { players: getPlayersArray(room) });
      console.log(`[Game] Room ${room.id} reset for new game`);
    });

    // ---- Disconnect ----
    socket.on("disconnect", () => {
      console.log(`[Game] Socket disconnected: ${socket.id}`);

      const roomId = socketToRoom.get(socket.id);
      const playerId = socketToPlayerId.get(socket.id);
      if (!roomId || !playerId) return;

      const room = rooms.get(roomId);
      if (!room) return;

      room.players.delete(playerId);
      socketToRoom.delete(socket.id);
      socketToPlayerId.delete(socket.id);

      room.lastActivityAt = Date.now();

      if (room.players.size === 0) {
        if (room.gameTickInterval) clearInterval(room.gameTickInterval);
        if (room.aiInterval) clearInterval(room.aiInterval);
        rooms.delete(roomId);
        console.log(`[Room] Room ${roomId} deleted (empty)`);
      } else {
        if (room.hostId === playerId) {
          const newHost = getPlayersArray(room)[0];
          room.hostId = newHost.id;
        }

        io.to(room.id).emit("room-update", { players: getPlayersArray(room) });

        if (room.status === "playing") {
          checkGameOver(room);
        }
      }
    });
  });
}

// ============================================================
// Server Bootstrap
// ============================================================

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Serve index.html and any static files from the same directory
app.use(express.static(path.join(__dirname)));

// SPA fallback: serve index.html for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const io = new Server(server, {
  path: "/socket.io/",
  cors: { origin: "*" },
  pingTimeout: 60000,
  pingInterval: 25000,
});

ioInstance = io;

// Register all socket event handlers
registerSocketHandlers(io);

// Start periodic room cleanup
cleanupInterval = setInterval(cleanupEmptyRooms, 60 * 1000);

server.listen(PORT, () => {
  console.log(`[Blockbound Arena] Server running on http://localhost:${PORT}`);
  console.log(`[Blockbound Arena] Socket.IO path: /socket.io/`);
});
