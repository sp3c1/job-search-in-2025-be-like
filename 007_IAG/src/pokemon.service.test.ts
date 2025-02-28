import { PokemanApiService } from './pokemon.service';

const service = new PokemanApiService();

jest.setTimeout(100000);
 
describe("pokemon service", () => {
    describe('poke list', () => {
        it('first call', async () => {
            const results = await service.getPokemons();
            expect(results.data).toMatchSnapshot()
        })


        it('first call', async () => {
            const results = await service.getPokemons(20, 20);
            expect(results.data).toMatchSnapshot()
        });
    })

    describe('one poke test', () => {
        
        it('ivysaur', async () => {
            const result = await service.getPokemon(`ivysaur`);
            expect(result.data).toMatchSnapshot();
        });
        
    })

    it('findHeaviest', async () => {
        const result = await service.findHeaviest();
        expect(result).toMatchSnapshot();
    })
});

 