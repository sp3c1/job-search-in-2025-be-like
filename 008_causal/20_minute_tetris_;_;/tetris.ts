

interface Shape {
    x: number;
    y: number;
    t: number;
}

function shapeX(x: number, y: number): { x: number; y0: number; y1: number }[] {
    return [
        {
            x,
            y0: y + 1,
            y1: y + 2,
        },
        {
            x: x + 1,
            y0: y,
            y1: y + 1,
        },
        {
            x: x + 2,
            y0: y,
            y1: y + 2,
        },
    ];
}

function line(y0: number, y1: number, currentLine: number[]) {
    for (let i = y0; i <= y1; i++) {
        if (currentLine[i] == 1) {
            return -1;
        }
    }
    return 1;
}

function addShape(obj: Shape, lines: number[][]) {
    const box = boundingBox(obj, obj.x, obj.y);
    for (const boxLine of box) {
        lineFill(boxLine.y0, boxLine.y1, lines[boxLine.x]);
    }
}

function lineFill(y0: number, y1: number, currentLine: number[]) {
    for (let i = y0; i <= y1; i++) {
        currentLine[i] = 1;
    }
}
interface Board {
    lines: number[][];
    maxX: number;
    maxY: number;
}

function boundingBox(obj: Shape, x: number, y: number) {
    switch (obj.t) {
        default:
            return shapeX(x, y);
    }
}

/**
 *
 * @param dX
 * @param dY
 * @param object
 * @param localBoard
 * @returns -1 out of bounds, 0 - collision with line 1 - collision with end of board. 2 - moving to empty space
 */
function collision(dX: number, dY: number, object: Shape, localBoard: Board) {
    const box = boundingBox(object, object.x + dX, object.y + dY);
    const topRow = box[0].x;
    const bottomRow = box[box.length].x;
    // is bottom out of bounds

    if (topRow < 0) {
        return -1;
    }

    if (bottomRow >= localBoard.maxX) {
        return -1; // somehow you are already bellow ?
    }

    for (const rowBox of box) {
        if (rowBox.y0 < 0 || rowBox.y1 > localBoard.maxY) {
            return -1; // invalid
        }
    }

    // for bound rows check if there is intersection in lines
    for (const lineBox of box) {
        if (line(lineBox.y0, lineBox.y1, localBoard.lines[lineBox.x]) === -1) {
            return 0;
        }
    }

    return bottomRow + 1 == localBoard.maxX ? 1 : 2;
}

function moveShape(dX: number, dY: number, object: Shape, localBoard: Board) {
    const collisionResults = collision(dX, dY, object, localBoard);

    if (collisionResults === -1) {
        return -1; // trying to move out of bound
    }

    if (collisionResults === 0) {
        return 0; // collided with line, should stop on previous line and fill in the board line
    }

    object.x += dX;
    object.y += dY;
    return collisionResults;
}

function gameRound(dX: number, dY: number, object: Shape, localBoard: Board) {
    const canMove = moveShape(dX, dY, object, localBoard);
    if (canMove === -1) {
        return canMove; // can not move like that
    }

    if (canMove === 0 || canMove === 1) {
        // if 0 object was not moved. it will add to lines at current position
        // if 1 object was moved and reached last line
        addShape(object, localBoard.lines);
        return canMove;
    }

    // just moved
    return canMove;
}

function scoreLines(board: Board) {

    const lines = board.lines;

    const linesToRemove = <number[]>[];

    board.lines = lines.filter((_, index) => {
        const sum = lines[index].reduce((previous, current) => {
            return current + previous;
        });
        return sum >= board.maxY;
    });

    // fill missing lines
    let score = Math.abs(board.maxX - board.lines.length);
    for (let i = 0; i < score; i++) {
        board.lines.unshift(Array(board.maxY + 1).fill(0));
    }

    return score;
}

function generateShape() {
    return <Shape>{ x: 0, y: 0, t: 0 };
}

function outlineOfGameLoop() {
    const board = <Board>{
        lines: <number[][]>[],
        maxX: 22, // rows
        maxY: 12, // cols
    };
    let score = 0;

    let currentBlock = generateShape();
    // while (1) {

    const dX = 1; // input the move
    const dY = 1;

    const mv = gameRound(dX, dY, currentBlock, board);

    if (mv === -1) {
        // nothing happens, can move again
    }

    if (mv === 0 || mv === 1) {
        currentBlock = generateShape();
        // shape was merged in
        score += scoreLines(board);
        // continue;
    }

    // else 2 allow for another loop run

    // }
}
