import { Store } from '@huggg/models/store/store.enitty';
import {
    Static,
    Type,
} from '@sinclair/typebox';

export const StoreSchemaBase = Type.Object({
    id: Type.String({ format: 'uuid' }),
    createdAt: Type.Date(),
    updatedAt: Type.Date(),
    name: Type.String(),
    visible: Type.Number(),
    // ------------- optionals
    website: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    descriptionMarkdown: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    longitude: Type.Optional(Type.Union([Type.Number({
        format: 'float',
    }), Type.Null()])),
    latitude: Type.Optional(Type.Union([Type.Number({
        format: 'float',
    }), Type.Null()])),
    image: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    imageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),


}, { $id: 'StoreSchemaBase', title: `Store` }
);

export type StoreSchema = Static<typeof StoreSchemaBase>;

export function deseliarizerStore(store: Store | StoreSchema) {
    return <StoreSchema>{
        ...store,
        ...(store.createdAt && { createdAt: new Date(store.createdAt) }),
        ...(store.updatedAt && { updatedAt: new Date(store.updatedAt) }),
    }
}