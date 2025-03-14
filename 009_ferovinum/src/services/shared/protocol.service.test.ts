import { ProtocolService } from './protocol.service';

describe('ProtocolService', () => {
  let service: ProtocolService;

  beforeEach(() => {
    service = new ProtocolService();
  });

  describe('getCommand', () => {
    it('should split message into parts', () => {
      const result = service.getCommand('buy wine 100');
      expect(result).toEqual(['buy', 'wine', '100']);
    });

    it('should handle empty message', () => {
      const result = service.getCommand('');
      expect(result).toEqual(['']);
    });

    it('should handle messages with extra spaces', () => {
      const result = service.getCommand('  sell  whisky  200  ');
      expect(result).toEqual(['sell', 'whisky', '200',]);
    });
  });

  describe('validateCommand', () => {
    it('should validate buy command', () => {
      const result = service.validateCommand('buy', 'wine', '100');
      expect(result).toBe('buy wine 100');
    });

    it('should validate sell command', () => {
      const result = service.validateCommand('sell', 'whisky', 200);
      expect(result).toBe('sell whisky 200');
    });

    it('should return undefined for invalid command', () => {
      const result = service.validateCommand('brew' as any, 'beer' as any, 300);
      expect(result).toBeUndefined();
    });

    it('should handle optional status parameter', () => {
      const result = service.validateCommand('buy', 'wine', 150, 'pending');
      expect(result).toBe('buy wine 150 pending');
    });
  });

  describe('getCommandWithValidate', () => {
    it('should return valid command structure', () => {
      const result = service.getCommandWithValidate('sell whisky 50');
      expect(result).toEqual(['sell', 'whisky', '50']);
    });

    it('should return undefined for invalid command', () => {
      const result = service.getCommandWithValidate('invalid beer 100');
      expect(result).toBeUndefined();
    });

    it('should handle partial commands', () => {
      const result = service.getCommandWithValidate('buy');
      expect(result).toEqual(['buy'])
    });
  });

  describe('parseString', () => {
    it('should process valid command', () => {
      const spy = jest.spyOn(service, 'validateCommand');
      service.parseString('buy wine 75');
      expect(spy).toHaveBeenCalledWith('buy', 'wine', '75');
    });

    it('should handle empty string', () => {
      expect(() => service.parseString('')).not.toThrow();
    });
  });

  describe('parseBuffer', () => {
    it('should process valid buffer', () => {
      const buffer = Buffer.from('sell whisky 300');
      const spy = jest.spyOn(service, 'parseString');
      service.parseBuffer(buffer);
      expect(spy).toHaveBeenCalledWith('sell whisky 300');
    });

    it('should handle empty buffer', () => {
      expect(() => service.parseBuffer(Buffer.from(''))).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle numeric amount values', () => {
      const result = service.validateCommand('buy', 'wine', 500);
      expect(result).toBe('buy wine 500');
    });

    it('should handle mixed case commands', () => {
      const result = service.getCommandWithValidate('BuY wine 100');
      expect(result).toBeUndefined();
    });

    it('should handle invalid SKU types', () => {
      const result = service.validateCommand('buy', 'beer' as any, 200);
      expect(result).toBe('buy beer 200');
    });
  });
});