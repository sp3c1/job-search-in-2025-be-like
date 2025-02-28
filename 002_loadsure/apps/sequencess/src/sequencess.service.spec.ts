import { Test, TestingModule } from '@nestjs/testing';

import { IKeyPad, keyPads, SequencessService } from './sequencess.service';

describe('SequencessServiceTest', () => {
  let service: SequencessService;

  const keyPadLenght = keyPads.length;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SequencessService],
    }).compile();

    service = module.get<SequencessService>(SequencessService);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStartingLetter', () => {
    it('should return "A" when Math.random is 0', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0);

      const startingLetter = service.getStartingLetter();

      expect(startingLetter.keyPad).toBe('A');
      expect(startingLetter.cords).toEqual({ x: 0, y: 0 });
    });

    it('should return "O" when Math.random selects index 14', () => {
      const index = 14;
      const randomValue = index / keyPadLenght;

      jest.spyOn(Math, 'random').mockReturnValue(randomValue);

      const startingLetter = service.getStartingLetter();

      expect(startingLetter.keyPad).toBe('O');
      expect(startingLetter.cords).toEqual({ x: 2, y: 4 });
    });

    it('should return "2" when Math.random selects index 16', () => {
      const index = 16;
      const randomValue = index / keyPadLenght;

      jest.spyOn(Math, 'random').mockReturnValue(randomValue);

      const startingLetter = service.getStartingLetter();

      expect(startingLetter.keyPad).toBe('2');
      expect(startingLetter.cords).toEqual({ x: 3, y: 2 });
    });

    it('should return "3" when Math.random selects index 17', () => {
      const index = 17;
      const randomValue = index / keyPadLenght;

      jest.spyOn(Math, 'random').mockReturnValue(randomValue);

      const startingLetter = service.getStartingLetter();

      expect(startingLetter.keyPad).toBe('3');
      expect(startingLetter.cords).toEqual({ x: 3, y: 3 });
    });
  });

  describe('nextValidMoves', () => {
    describe('keyPad A', () => {
      it('should return valid moves for "A" (0,0) with vowelCnt=0', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'A', cords: { x: 0, y: 0 } };
        const vowelCnt = 1;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['L', 'H'];

        expect(validMoves.length).toBe(2);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "A" (0,0) with vowelCnt=1', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'A', cords: { x: 0, y: 0 } };
        const vowelCnt = 1;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['L', 'H'];

        expect(validMoves.length).toBe(2);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "A" (0,0) with vowelCnt=2', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'A', cords: { x: 0, y: 0 } };
        const vowelCnt = 2;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['L', 'H'];

        expect(validMoves.length).toBe(2);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });
    });

    describe('keyPad H', () => {
      it('should return valid moves for "H" (1,2) with vowelCnt=0', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'H', cords: { x: 1, y: 2 } };
        const vowelCnt = 0;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['3', 'O', 'E', 'A', 'K', '1'];

        expect(validMoves.length).toBe(6);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "H" (1,2) with vowelCnt=1', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'H', cords: { x: 1, y: 2 } };
        const vowelCnt = 1;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['3', 'O', 'E', 'A', 'K', '1'];

        expect(validMoves.length).toBe(6);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "H" (1,2) with vowelCnt=2', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'H', cords: { x: 1, y: 2 } };
        const vowelCnt = 2;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['3', 'K', '1'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });
    });

    describe('keyPad O', () => {
      it('should return valid moves for "O" (2,4) with vowelCnt=0', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'O', cords: { x: 2, y: 4 } };
        const vowelCnt = 0;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['D', 'H', '2'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "O" (2,4) with vowelCnt=1', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'O', cords: { x: 2, y: 4 } };
        const vowelCnt = 1;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['D', 'H', '2'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "O" (2,4) with vowelCnt=2', () => {
        const currentKeyPad: IKeyPad = { keyPad: 'O', cords: { x: 2, y: 4 } };
        const vowelCnt = 2;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['D', 'H', '2'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });
    });

    describe('keyPad 3', () => {
      it('should return valid moves for "3" (3,3) with vowelCnt=0', () => {
        const currentKeyPad: IKeyPad = { keyPad: '3', cords: { x: 3, y: 3 } };
        const vowelCnt = 0;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['J', 'H', 'L'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });

      it('should return valid moves for "3" (3,3) with vowelCnt=2', () => {
        const currentKeyPad: IKeyPad = { keyPad: '3', cords: { x: 3, y: 3 } };
        const vowelCnt = 2;

        const validMoves = service.nextValidMoves(vowelCnt, currentKeyPad);

        const expectedKeys = ['J', 'H', 'L'];

        expect(validMoves.length).toBe(3);
        expect(validMoves.map((kp) => kp.keyPad)).toEqual(expect.arrayContaining(expectedKeys));
      });
    });
  });

  describe('vowelCnt', () => {
    it('should get all keypad vowels (excluding U)', () => {
      const vowelCnt = service.vowelCnt(['A', 'E', 'I', 'O', 'U']);
      expect(vowelCnt).toBe(4);
    });

    describe('should get 2 vowels A', () => {
      it('should get 1 vowels A', () => {
        const vowelCnt = service.vowelCnt(['1', '2', '3', 'A']);
        expect(vowelCnt).toBe(1);
      });

      it('begining and end', () => {
        const vowelCnt = service.vowelCnt(['A', '1', '2', '3', 'A']);
        expect(vowelCnt).toBe(2);
      });

      it('next to each other', () => {
        const vowelCnt = service.vowelCnt(['A', 'A', '1', '2']);
        expect(vowelCnt).toBe(2);
      });

      it('only vowels', () => {
        const vowelCnt = service.vowelCnt(['A', 'A']);
        expect(vowelCnt).toBe(2);
      });

      it('U ignored as vowel as not present on keypad', () => {
        const vowelCnt = service.vowelCnt(['A', 'U', 'A']);
        expect(vowelCnt).toBe(2);
      });
    });
  });

  describe('generateSequnece', () => {
    it('should generate a valid sequence of 10 keyPads with max 2 vowels', () => {
      const sequnces = service.generateSequences();

      expect(sequnces.length).toBe(10);

      for (const sequnce of sequnces) {
        const vowelCnt = service.vowelCnt(sequnce);
        expect(vowelCnt).toBeLessThanOrEqual(2);
        expect(sequnce.length).toBe(10);
        for (const letter of sequnce) {
          expect(keyPads.includes(letter)).toBeTruthy();
        }
      }
    });
  });
});
