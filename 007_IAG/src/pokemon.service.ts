import { Axios } from 'axios';

interface PokemanApiV2PokemonList{
    count: number;
    next?: string; // cursor
    previous?: string; // cursor
    results: PokemanApiV2PokemonListResult[];
}

interface PokemanApiV2Pokemon{
    id: number;
    name: string;
    weight?: number
}

type PokeCandidate = {
    weight: number | null;
    name: string | null;
    id: number | null;
};

type PokemanApiV2PokemonListResult = { name: string, url: string };

export class PokemanApiService{
    private axios: Axios;
    constructor() {
        this.axios = new Axios({
            baseURL: `https://pokeapi.co/api/v2/`, 
            headers: { "Accept": "application/json", 'Content-Type': 'application/json' },
            responseType: 'json',
            transitional: {
                forcedJSONParsing: true
            }
        });
    }

    async getPokemons(offset: number = 1, limit: number = 20) {
        return this.axios.get<PokemanApiV2PokemonList>(`pokemon/?offset=${offset}&limit=${limit}`);
    }

    async getPokemon(name: string) {
        return this.axios.get<PokemanApiV2Pokemon>(`pokemon/${name}/`);
    }

    async processPokeList(candidate: PokeCandidate, results: PokemanApiV2PokemonListResult[]) {
        const promises = [];
        for (const result of results || []) {
            promises.push(this.processSinglePoke(candidate, result));
        }

        await Promise.allSettled(promises)
    }

    async processSinglePoke(candidate: PokeCandidate, result: PokemanApiV2PokemonListResult) {
        try {

            const pokeResulst = await this.getPokemon(result.name);
            const poke = this.safeJSONParse<PokemanApiV2Pokemon>(pokeResulst.data);

            if (!poke) {
                return;
            }

            if (Number(poke.weight || 0) > Number(candidate?.weight || 0)) {
                candidate.weight = poke?.weight!;
                candidate.name = poke?.name;
                candidate.id = poke?.id;
            }
        } catch (err) {
            console.error(err)
        }
    }

    async findHeaviest() {
        let offset = 1;
        const limit = 20;

        const candidate: PokeCandidate = {
            weight: null,
            id: null,
            name: null,
        };

        while (true) {
            let allPokeResponse = await this.getPokemons(offset, limit);
            const pokeList = this.safeJSONParse<PokemanApiV2PokemonList>(allPokeResponse?.data as any as string);
            if (!pokeList) {
                break;
            }

            await this.processPokeList(candidate, pokeList.results);
            offset += limit;

            const isOfffsetAboveCount = pokeList.count && offset + limit > pokeList.count;
            const noCount = !pokeList.count
            if (!pokeList.next || pokeList.results?.length == 0 || noCount || isOfffsetAboveCount) {
                break;
            }
        }

        return candidate;
    }

    safeJSONParse<T>(target: any) {
        try {
            return <T>JSON.parse(target)
        } catch (err) {
            return null;
        }
    }
}