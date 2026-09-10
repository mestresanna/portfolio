export function generateSquareSpiralPath(turns = 6, step = 16) {
  let x = 0, y = 0;
  let dx = 1, dy = 0; // start moving right
  const points: [number, number][] = [[x, y]];
  let sideLength = step;
  let sidesCompleted = 0;

  for (let i = 0; i < turns * 4; i++) {
    x += dx * sideLength;
    y += dy * sideLength;
    points.push([x, y]);

    // rotate 90° clockwise
    [dx, dy] = [dy, -dx];

    sidesCompleted++;
    if (sidesCompleted % 2 === 0) sideLength += step;
  }

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  return d;
}
