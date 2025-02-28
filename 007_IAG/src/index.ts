import { PokemanApiService } from './pokemon.service';

const service = new PokemanApiService();

service.findHeaviest().then(pokemon => {
    console.log(pokemon);
}).catch(err => {
    console.error(err);
 })