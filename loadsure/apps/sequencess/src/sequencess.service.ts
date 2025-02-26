import { Injectable } from '@nestjs/common';

export const keyPads = 'ABCDEFGHIJKLMNO123' as const;

// 4 x 5 flattened
export const cords = [
  keyPads[0], // 'A',
  keyPads[1], // 'B',
  keyPads[2], // 'C',
  keyPads[3], // 'D',
  keyPads[4], // 'E',
  keyPads[5], // 'F',
  keyPads[6], // 'G',
  keyPads[7], // 'H',
  keyPads[8], // 'I',
  keyPads[9], // 'J',
  keyPads[10], // 'K',
  keyPads[11], // 'L',
  keyPads[12], // 'M',
  keyPads[13], // 'N',
  keyPads[14], // 'O',
  undefined,
  keyPads[15], // 1
  keyPads[16], // 2
  keyPads[17], // 3
  undefined,
];

export interface IKeyPad {
  keyPad: string;
  cords: ICords;
}

export interface ICords {
  x: number;
  y: number;
}

export const rows = 4; // x
export const cols = 5; // y

export const moveOffsets: { dx: number; dy: number }[] = [
  { dx: 2, dy: 1 },
  { dx: 1, dy: 2 },
  { dx: -1, dy: 2 },
  { dx: -2, dy: 1 },
  { dx: -2, dy: -1 },
  { dx: -1, dy: -2 },
  { dx: 1, dy: -2 },
  { dx: 2, dy: -1 },
];

@Injectable()
export class SequencessService {
  getKeyPadCords(keyPad: string): { cords: ICords } {
    const index = cords.findIndex((val) => val === keyPad);
    if (index === -1) {
      throw new Error(`KeyPad ${keyPad} not found.`);
    }

    const x = Math.floor(index / cols);
    const y = index % cols;
    return { cords: { x, y } };
  }

  getStartingLetter(): IKeyPad {
    const randomIndex = Math.floor(Math.random() * keyPads.length);
    const keyPad = keyPads[randomIndex];

    return { keyPad, ...this.getKeyPadCords(keyPad) };
  }

  generateNextCharacter(sequence: string[], currentKeyPad: IKeyPad): IKeyPad {
    const vowelCnt = this.vowelCnt(sequence);
    const validMoves = this.nextValidMoves(vowelCnt, currentKeyPad);

    if (validMoves.length === 0) {
      throw new Error('No valid moves available. Sequence generation halted.');
    }

    // Select a random valid move
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const nextKeyPad = validMoves[randomIndex];

    // Add the next keyPad to the sequence
    sequence.push(nextKeyPad.keyPad);

    return nextKeyPad;
  }

  nextValidMoves(vowelCnt: number, currentKeyPad: IKeyPad): IKeyPad[] {
    const { x, y } = currentKeyPad.cords;
    const potentialMoves: IKeyPad[] = [];

    // look for available knight moves pattern
    for (const offset of moveOffsets) {
      const newX = x + offset.dx;
      const newY = y + offset.dy;

      // Check if the new coordinates are within the grid boundaries
      if (newX < 0 || newX >= rows || newY < 0 || newY >= cols) {
        continue; // Skip invalid positions
      }

      const newIndex = newX * cols + newY;
      const newKey = cords[newIndex];

      // Ensure the keyPad exists at the new position
      if (newKey === undefined) {
        continue;
      }

      // Check vowel constraint - np more then 2
      if (this.isVowel(newKey)) {
        if (vowelCnt >= 2) {
          continue;
        }
      }

      potentialMoves.push({
        keyPad: newKey,
        cords: { x: newX, y: newY },
      });
    }

    return potentialMoves;
  }

  isVowel(keyPad) {
    return keyPad == 'A' || keyPad == 'E' || keyPad == 'I' || keyPad == 'O';
  }

  vowelCnt(sequence: string[]) {
    return sequence.filter((keyPad) => this.isVowel(keyPad)).length;
  }

  generateSequnece() {
    const firstKeyPad = this.getStartingLetter();
    const sequence = [firstKeyPad.keyPad];

    let currentKeypad = firstKeyPad;

    for (let i = 0; i < 9; i++) {
      currentKeypad = this.generateNextCharacter(sequence, currentKeypad);
    }

    return sequence;
  }

  generateSequences() {
    const sequences = [];
    for (let i = 0; i < 10; i++) {
      sequences.push(this.generateSequnece());
    }

    return sequences;
  }

  print(seq: string[]) {
    console.log(seq?.join(', '));
  }

  exec() {
    const seq = this.generateSequences() ?? [];
    this.print(seq);
  }
}
