import { Product } from '@huggg/models/product/product.entity';
import {
    Static,
    Type,
} from '@sinclair/typebox';

export const ProductSchemaBase = Type.Object({
    id: Type.String({ format: 'uuid' }),
    createdAt: Type.Date(),
    updatedAt: Type.Date(),
    // ------------- optional
    description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    campaign: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    label: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    internalName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    integration: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    price: Type.Optional(Type.Union([Type.Number({
        format: 'float',
    }), Type.Null()])),
    over180offer: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    redemptionInstructions: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    image: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    subtitle: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    weight: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    recipientDescription: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    tagGroupId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    tagId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    openGraphImage: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    openGraphImageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    active: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    onApp: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    onImessage: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    handlingFee: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    salePrice: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    hugggTag: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    vatVoucherType: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    vat: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
    imageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    claimImage: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    claimImageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    imessageImage: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    imessageImageUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),

}, { $id: 'ProductSchemaBase', title: `Product` }
);

export type ProductSchema = Static<typeof ProductSchemaBase>;


export function deseliarizerProduct(product: Product | ProductSchema) {
    return <ProductSchema>{
        ...product,
        ...(product.createdAt && { createdAt: new Date(product.createdAt) }),
        ...(product.updatedAt && { updatedAt: new Date(product.updatedAt) }),
    }
}