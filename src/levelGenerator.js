export function generateSolvableLevel(level) {
  let phase = 1;
  if (level >= 36 && level <= 85) phase = 2;
  else if (level >= 86) phase = 3;

  let gridSize = 4;
  let obstacleCount = 1;

  if (phase === 1) {
    gridSize = level <= 15 ? 4 : 5;
    obstacleCount = level <= 15 ? 1 : 2;
  } else if (phase === 2) {
    gridSize = 6;
    obstacleCount = Math.floor(Math.random() * 2) + 2; // 2 to 3 obstacles
  } else {
    gridSize = 7;
    obstacleCount = Math.floor(Math.random() * 3) + 4; // 4 to 6 obstacles
  }

  function getValidDirections(r, c, size) {
    const dirs = [];
    if (r > 0) dirs.push('U');
    if (r < size - 1) dirs.push('D');
    if (c > 0) dirs.push('L');
    if (c < size - 1) dirs.push('R');
    return dirs.length > 0 ? dirs : ['U'];
  }

  // Find a safe outside direction that doesn't point into the solution path
  function getSafeOutsideDirection(r, c, size, pathSet) {
    const valids = getValidDirections(r, c, size);
    const safeDirs = [];
    for (const d of valids) {
      let nr = r, nc = c;
      if (d === 'U') nr--;
      else if (d === 'D') nr++;
      else if (d === 'L') nc--;
      else if (d === 'R') nc++;
      
      if (!pathSet.has(`${nr},${nc}`)) {
        safeDirs.push(d);
      }
    }
    if (safeDirs.length > 0) {
      return safeDirs[Math.floor(Math.random() * safeDirs.length)];
    }
    return valids[Math.floor(Math.random() * valids.length)];
  }

  function countPathTurns(p) {
    if (p.length < 3) return 0;
    let turns = 0;
    let lastDir = null;
    for (let i = 0; i < p.length - 1; i++) {
      const current = p[i];
      const next = p[i + 1];
      let dir = '';
      if (next.row < current.row) dir = 'U';
      else if (next.row > current.row) dir = 'D';
      else if (next.col < current.col) dir = 'L';
      else dir = 'R';
      
      if (lastDir !== null && dir !== lastDir) {
        turns++;
      }
      lastDir = dir;
    }
    return turns;
  }

  // BFS/Dijkstra solver to compute minimum clicks required
  function getClicks(r, c, startDir, targetDir, size) {
    if (startDir === targetDir) return 0;
    const allDirs = ['U', 'R', 'D', 'L'];
    let current = startDir;
    let clicks = 0;
    for (let step = 1; step <= 4; step++) {
      const currIndex = allDirs.indexOf(current);
      let nextDir = current;
      for (let i = 1; i <= 4; i++) {
        const checkDir = allDirs[(currIndex + i) % 4];
        const isValid = 
          !(checkDir === 'U' && r === 0) &&
          !(checkDir === 'D' && r === size - 1) &&
          !(checkDir === 'L' && c === 0) &&
          !(checkDir === 'R' && c === size - 1);
        if (isValid) {
          nextDir = checkDir;
          break;
        }
      }
      clicks++;
      if (nextDir === targetDir) {
        return clicks;
      }
      current = nextDir;
    }
    return Infinity;
  }

  function solvePerfectMoves(g, size, tRow, tCol) {
    const dist = Array(size).fill(null).map(() => Array(size).fill(Infinity));
    const visitedCells = Array(size).fill(null).map(() => Array(size).fill(false));

    dist[0][0] = 0;

    for (let step = 0; step < size * size; step++) {
      let minDist = Infinity;
      let uRow = -1, uCol = -1;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!visitedCells[r][c] && dist[r][c] < minDist) {
            minDist = dist[r][c];
            uRow = r;
            uCol = c;
          }
        }
      }

      if (uRow === -1) break;
      if (uRow === tRow && uCol === tCol) break;

      visitedCells[uRow][uCol] = true;

      const cell = g[uRow][uCol];
      const neighbors = [
        { r: uRow - 1, c: uCol, dir: 'U' },
        { r: uRow + 1, c: uCol, dir: 'D' },
        { r: uRow, c: uCol - 1, dir: 'L' },
        { r: uRow, c: uCol + 1, dir: 'R' }
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
          const nextCell = g[n.r][n.c];
          if (!nextCell.isObstacle) {
            const clicks = getClicks(uRow, uCol, cell.direction, n.dir, size);
            if (dist[uRow][uCol] + clicks < dist[n.r][n.c]) {
              dist[n.r][n.c] = dist[uRow][uCol] + clicks;
            }
          }
        }
      }
    }

    return dist[tRow][tCol];
  }

  function solvePerfectPath(g, size, tRow, tCol) {
    const dist = Array(size).fill(null).map(() => Array(size).fill(Infinity));
    const visitedCells = Array(size).fill(null).map(() => Array(size).fill(false));
    const parent = Array(size).fill(null).map(() => Array(size).fill(null));

    dist[0][0] = 0;

    for (let step = 0; step < size * size; step++) {
      let minDist = Infinity;
      let uRow = -1, uCol = -1;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!visitedCells[r][c] && dist[r][c] < minDist) {
            minDist = dist[r][c];
            uRow = r;
            uCol = c;
          }
        }
      }

      if (uRow === -1) break;
      if (uRow === tRow && uCol === tCol) break;

      visitedCells[uRow][uCol] = true;

      const cell = g[uRow][uCol];
      const neighbors = [
        { r: uRow - 1, c: uCol, dir: 'U' },
        { r: uRow + 1, c: uCol, dir: 'D' },
        { r: uRow, c: uCol - 1, dir: 'L' },
        { r: uRow, c: uCol + 1, dir: 'R' }
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
          const nextCell = g[n.r][n.c];
          if (!nextCell.isObstacle) {
            const clicks = getClicks(uRow, uCol, cell.direction, n.dir, size);
            if (dist[uRow][uCol] + clicks < dist[n.r][n.c]) {
              dist[n.r][n.c] = dist[uRow][uCol] + clicks;
              parent[n.r][n.c] = { r: uRow, c: uCol, dir: n.dir };
            }
          }
        }
      }
    }

    const perfectMoves = dist[tRow][tCol];
    const solutionPath = [];
    const solutionDirections = [];

    if (perfectMoves !== Infinity) {
      let currR = tRow;
      let currC = tCol;
      solutionPath.push({ row: currR, col: currC });

      while (currR !== 0 || currC !== 0) {
        const p = parent[currR][currC];
        if (!p) break;

        solutionDirections.push({
          row: p.r,
          col: p.c,
          direction: p.dir
        });

        currR = p.r;
        currC = p.c;
        solutionPath.push({ row: currR, col: currC });
      }

      solutionPath.reverse();
      solutionDirections.reverse();
    }

    return {
      perfectMoves,
      solutionPath,
      solutionDirections
    };
  }

  function injectFakeBranch(g, p, size) {
    const pathSet = new Set(p.map(x => `${x.row},${x.col}`));
    
    // Pick a starting path node (somewhere in the middle of the path, avoiding trigger and target)
    if (p.length < 4) return;
    const startIndex = Math.floor(p.length / 2);
    const startNode = p[startIndex];
    
    // Find empty neighbor N1 that is not on path and not obstacle
    const neighbors1 = [
      { r: startNode.row - 1, c: startNode.col, dir: 'U' },
      { r: startNode.row + 1, c: startNode.col, dir: 'D' },
      { r: startNode.row, c: startNode.col - 1, dir: 'L' },
      { r: startNode.row, c: startNode.col + 1, dir: 'R' }
    ].filter(n => n.r >= 0 && n.r < size && n.c >= 0 && n.c < size);
    
    let n1 = null;
    let dirToN1 = null;
    for (const n of neighbors1) {
      if (!pathSet.has(`${n.r},${n.c}`) && !g[n.r][n.c].isObstacle) {
        n1 = g[n.r][n.c];
        dirToN1 = n.dir;
        break;
      }
    }
    
    if (!n1) return;
    
    // Find N2 adjacent to N1, not on path, not obstacle, and different from startNode
    const neighbors2 = [
      { r: n1.row - 1, c: n1.col, dir: 'U' },
      { r: n1.row + 1, c: n1.col, dir: 'D' },
      { r: n1.row, c: n1.col - 1, dir: 'L' },
      { r: n1.row, c: n1.col + 1, dir: 'R' }
    ].filter(n => n.r >= 0 && n.r < size && n.c >= 0 && n.c < size);
    
    let n2 = null;
    let dirToN2 = null;
    for (const n of neighbors2) {
      if (!pathSet.has(`${n.r},${n.c}`) && !g[n.r][n.c].isObstacle && (n.r !== startNode.row || n.c !== startNode.col)) {
        n2 = g[n.r][n.c];
        dirToN2 = n.dir;
        break;
      }
    }
    
    if (!n2) return;
    
    // Now create a loop: N1 points to N2, N2 points back to N1!
    n1.direction = dirToN2;
    
    // Get direction from N2 back to N1
    let dirToN1FromN2 = 'U';
    if (n1.row < n2.row) dirToN1FromN2 = 'U';
    else if (n1.row > n2.row) dirToN1FromN2 = 'D';
    else if (n1.col < n2.col) dirToN1FromN2 = 'L';
    else dirToN1FromN2 = 'R';
    
    n2.direction = dirToN1FromN2;
    
    // Check for N3 to optionally create a 3-cell loop
    const neighbors3 = [
      { r: n2.row - 1, c: n2.col, dir: 'U' },
      { r: n2.row + 1, c: n2.col, dir: 'D' },
      { r: n2.row, c: n2.col - 1, dir: 'L' },
      { r: n2.row, c: n2.col + 1, dir: 'R' }
    ].filter(n => n.r >= 0 && n.r < size && n.c >= 0 && n.c < size);
    
    let n3 = null;
    let dirToN3 = null;
    for (const n of neighbors3) {
      const key = `${n.r},${n.c}`;
      if (!pathSet.has(key) && !g[n.r][n.c].isObstacle && (n.r !== n1.row || n.c !== n1.col) && (n.r !== startNode.row || n.c !== startNode.col)) {
        n3 = g[n.r][n.c];
        dirToN3 = n.dir;
        break;
      }
    }
    
    if (n3) {
      n1.direction = dirToN2;
      n2.direction = dirToN3;
      
      let dirToN1FromN3 = 'U';
      if (n1.row < n3.row) dirToN1FromN3 = 'U';
      else if (n1.row > n3.row) dirToN1FromN3 = 'D';
      else if (n1.col < n3.col) dirToN1FromN3 = 'L';
      else dirToN1FromN3 = 'R';
      
      n3.direction = dirToN1FromN3;
    }
  }

  let path = null;
  let gridBlueprint = null;
  let perfectMoves = 0;
  let solutionDirections = [];
  let finalGrid = null;
  let targetRow = 0;
  let targetCol = 0;

  // Attempt to generate path and placement up to 300 times
  for (let attempt = 0; attempt < 300; attempt++) {
    let tr = Math.floor(Math.random() * gridSize);
    let tc = Math.floor(Math.random() * gridSize);
    while (tr === 0 && tc === 0) {
      tr = Math.floor(Math.random() * gridSize);
      tc = Math.floor(Math.random() * gridSize);
    }

    const manhattan = tr + tc;
    let minManhattan = 2;
    if (phase === 1) minManhattan = gridSize - 1;
    else if (phase === 2) minManhattan = gridSize + 1;
    else if (phase === 3) minManhattan = gridSize + 2;

    if (manhattan < minManhattan && attempt < 100) continue;

    let phaseMinLength = 5;
    if (phase === 2) phaseMinLength = 10;
    else if (phase === 3) phaseMinLength = 16;

    if (attempt > 100) {
      phaseMinLength = Math.max(3, phaseMinLength - 2);
    }
    if (attempt > 200) {
      phaseMinLength = Math.max(3, phaseMinLength - 4);
    }

    const currentPath = [];
    const visited = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    let nodesVisited = 0;
    let dfsSuccess = false;

    function dfs(r, c) {
      nodesVisited++;
      if (nodesVisited > 3000) return false;

      currentPath.push({ row: r, col: c });
      visited[r][c] = true;

      if (r === tr && c === tc) {
        if (currentPath.length >= phaseMinLength) {
          if (phase < 3 || countPathTurns(currentPath) >= 3 || attempt > 150) {
            dfsSuccess = true;
            return true;
          }
        }
        currentPath.pop();
        visited[r][c] = false;
        return false;
      }

      const directions = ['U', 'D', 'L', 'R'].sort(() => Math.random() - 0.5);
      for (const dir of directions) {
        let nr = r, nc = c;
        if (dir === 'U') nr--;
        else if (dir === 'D') nr++;
        else if (dir === 'L') nc--;
        else if (dir === 'R') nc++;

        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr][nc]) {
          if (dfs(nr, nc)) return true;
        }
      }

      currentPath.pop();
      visited[r][c] = false;
      return false;
    }

    dfs(0, 0);

    if (dfsSuccess && currentPath.length >= phaseMinLength) {
      path = currentPath;
      targetRow = tr;
      targetCol = tc;
      gridBlueprint = Array(gridSize).fill(null).map(() => Array(gridSize).fill('EMPTY'));

      let placedObstacles = 0;
      let obstacleAttempts = 0;
      const pathKeys = new Set(path.map(p => `${p.row},${p.col}`));
      while (placedObstacles < obstacleCount && obstacleAttempts < 100) {
        obstacleAttempts++;
        const r = Math.floor(Math.random() * gridSize);
        const c = Math.floor(Math.random() * gridSize);
        const key = `${r},${c}`;
        if (!pathKeys.has(key) && gridBlueprint[r][c] === 'EMPTY') {
          gridBlueprint[r][c] = 'OBSTACLE';
          placedObstacles++;
        }
      }

      finalGrid = Array(gridSize).fill(null).map((_, r) =>
        Array(gridSize).fill(null).map((_, c) => {
          const valids = getValidDirections(r, c, gridSize);
          return {
            row: r,
            col: c,
            direction: valids[Math.floor(Math.random() * valids.length)],
            isObstacle: gridBlueprint[r][c] === 'OBSTACLE',
            isTrigger: r === 0 && c === 0,
            isTarget: false
          };
        })
      );

      finalGrid[targetRow][targetCol].isTarget = true;

      solutionDirections = [];
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        let solDir = 'U';
        if (next.row < current.row) solDir = 'U';
        else if (next.row > current.row) solDir = 'D';
        else if (next.col < current.col) solDir = 'L';
        else solDir = 'R';

        solutionDirections.push({
          row: current.row,
          col: current.col,
          direction: solDir
        });

        const cell = finalGrid[current.row][current.col];
        const valids = getValidDirections(current.row, current.col, gridSize);
        const otherValids = valids.filter(d => d !== solDir);
        if (otherValids.length > 0) {
          cell.direction = otherValids[Math.floor(Math.random() * otherValids.length)];
        } else {
          cell.direction = valids[Math.floor(Math.random() * valids.length)];
        }
      }

      const pathSet = new Set(path.map(p => `${p.row},${p.col}`));
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const key = `${r},${c}`;
          if (!pathSet.has(key)) {
            const cell = finalGrid[r][c];
            if (!cell.isObstacle) {
              cell.direction = getSafeOutsideDirection(r, c, gridSize, pathSet);
            }
          }
        }
      }

      if (phase === 2) {
        injectFakeBranch(finalGrid, path, gridSize);
      }

      perfectMoves = solvePerfectMoves(finalGrid, gridSize, targetRow, targetCol);

      let isValidPhaseLayout = false;
      if (phase === 1) {
        isValidPhaseLayout = (perfectMoves >= 4 && perfectMoves <= 8);
      } else if (phase === 2) {
        isValidPhaseLayout = (perfectMoves >= 9 && perfectMoves <= 15);
      } else if (phase === 3) {
        isValidPhaseLayout = (perfectMoves >= 16);
      }

      if (isValidPhaseLayout || attempt > 250) {
        break;
      }
    }
  }

  // Handcrafted fallback path to guarantee absolute safety
  if (!path) {
    gridBlueprint = Array(gridSize).fill(null).map(() => Array(gridSize).fill('EMPTY'));
    if (gridSize === 4) {
      path = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
        { row: 1, col: 3 },
        { row: 1, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
        { row: 3, col: 3 }
      ];
    } else if (gridSize === 5) {
      path = [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
        { row: 1, col: 4 }, { row: 1, col: 3 }, { row: 1, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 0 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
        { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
        { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }
      ];
    } else if (gridSize === 6) {
      path = [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 },
        { row: 1, col: 5 }, { row: 1, col: 4 }, { row: 1, col: 3 }, { row: 1, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 0 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 },
        { row: 3, col: 5 }, { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
        { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 },
        { row: 5, col: 5 }
      ];
    } else {
      path = [
        { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 },
        { row: 1, col: 6 }, { row: 1, col: 5 }, { row: 1, col: 4 }, { row: 1, col: 3 }, { row: 1, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 0 },
        { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
        { row: 3, col: 6 }, { row: 3, col: 5 }, { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 3, col: 0 },
        { row: 4, col: 0 }, { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 },
        { row: 5, col: 6 }, { row: 5, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 3 }, { row: 5, col: 2 }, { row: 5, col: 1 }, { row: 5, col: 0 },
        { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }
      ];
    }

    targetRow = gridSize - 1;
    targetCol = gridSize - 1;

    const pathSet = new Set(path.map(p => `${p.row},${p.col}`));
    finalGrid = Array(gridSize).fill(null).map((_, r) =>
      Array(gridSize).fill(null).map((_, c) => {
        const valids = getValidDirections(r, c, gridSize);
        return {
          row: r,
          col: c,
          direction: valids[Math.floor(Math.random() * valids.length)],
          isObstacle: false,
          isTrigger: r === 0 && c === 0,
          isTarget: r === targetRow && c === targetCol
        };
      })
    );

    solutionDirections = [];
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];
      let solDir = 'U';
      if (next.row < current.row) solDir = 'U';
      else if (next.row > current.row) solDir = 'D';
      else if (next.col < current.col) solDir = 'L';
      else solDir = 'R';

      solutionDirections.push({
        row: current.row,
        col: current.col,
        direction: solDir
      });

      const cell = finalGrid[current.row][current.col];
      const valids = getValidDirections(current.row, current.col, gridSize);
      const otherValids = valids.filter(d => d !== solDir);
      if (otherValids.length > 0) {
        cell.direction = otherValids[Math.floor(Math.random() * otherValids.length)];
      } else {
        cell.direction = valids[Math.floor(Math.random() * valids.length)];
      }
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const key = `${r},${c}`;
        if (!pathSet.has(key)) {
          const cell = finalGrid[r][c];
          cell.direction = getSafeOutsideDirection(r, c, gridSize, pathSet);
        }
      }
    }

    if (phase === 2) {
      injectFakeBranch(finalGrid, path, gridSize);
    }

    perfectMoves = solvePerfectMoves(finalGrid, gridSize, targetRow, targetCol);
  }

  // Calculate the absolute shortest path using the BFS solver
  const shortestResult = solvePerfectPath(finalGrid, gridSize, targetRow, targetCol);
  let finalPath = path;
  let finalSolutionDirections = solutionDirections;
  if (shortestResult.perfectMoves !== Infinity && shortestResult.solutionPath.length > 0) {
    finalPath = shortestResult.solutionPath;
    finalSolutionDirections = shortestResult.solutionDirections;
    perfectMoves = shortestResult.perfectMoves;
  }

  if (perfectMoves === Infinity || isNaN(perfectMoves)) {
    if (phase === 1) perfectMoves = 6;
    else if (phase === 2) perfectMoves = 11;
    else perfectMoves = 18;
  }

  const pathScrambleCount = finalPath.length - 1;

  return {
    levelNumber: level,
    gridSize,
    grid: finalGrid,
    movesAllowed: perfectMoves + 5,
    solutionPath: finalPath,
    solutionDirections: finalSolutionDirections,
    scrambleCount: pathScrambleCount,
    perfectMoves: perfectMoves
  };
}
