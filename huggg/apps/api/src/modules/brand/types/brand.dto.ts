import { Brand } from '@huggg/models/brand/brand.entity';
import {
    Static,
    Type,
} from '@sinclair/typebox';

export const BrandSchemaBase = Type.Object({
    id: Type.String({ format: 'uuid' }),
    createdAt: Type.Date(),
    updatedAt: Type.Date(),
    name: Type.String(),
    consolidated: Type.Number(),
    // ---------- optionals
    integrationId: Type.Optional(Type.Number()),
    internalName: Type.Optional(Type.String()),
    logo: Type.Optional(Type.String()),
    colour: Type.Optional(Type.String()),
    success: Type.Optional(Type.String()),
    share: Type.Optional(Type.String()),
    weight: Type.Optional(Type.Number()),
    expiry: Type.Optional(Type.Number()),
    website: Type.Optional(Type.String()),
    userId: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    vat: Type.Optional(Type.Number()),
    faq: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    redeem: Type.Optional(Type.String()),
    locationText: Type.Optional(Type.String()),
    mapPinUrl: Type.Optional(Type.String()),
    logoUrl: Type.Optional(Type.String()),
    defaultLocationDescriptionMarkdown: Type.Optional(Type.String()),

}, { $id: 'BrandSchemaBase', title: `Brand` }
);

export type BrandSchema = Static<typeof BrandSchemaBase>;

export function deseliarizerBrand(brand: Brand | BrandSchema) {
    return <BrandSchema>{
        ...brand,
        ...(brand.createdAt && { createdAt: new Date(brand.createdAt) }),
        ...(brand.updatedAt && { updatedAt: new Date(brand.updatedAt) }),
    }
}