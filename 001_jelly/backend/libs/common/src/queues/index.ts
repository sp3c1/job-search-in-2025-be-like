import {
    Field,
    Float,
    Int,
    ObjectType,
} from '@nestjs/graphql';

export interface QueueTracking {
    requestId: string;
}

export const QUEUE_QueueIngredientsCsv = 'ingredients-csv';
export type QUEUE_QueueIngredientsCsv_TMPL = { filePath: string } & QueueTracking;

export const QUEUE_QueueIngredientsPrice = 'ingradients-price';
export type QUEUE_QueueIngredientsPrice_TMPL = {
    changedAt: string | Date,
    name: string,
    price: number,
} & QueueTracking;

export const QUEUE_QueueIngredientsCsvSingle = 'ingradients-price-single';
export type QUEUE_QueueIngredientsCsvSingle_TMPL = {
    ingredientName: string,
    supplierName: string,
} & QueueTracking;


export const PUBSUB_QueueIngredientsPriceChange = 'ingredient-price-change';
@ObjectType()
export class PUBSUB_QueueIngredientsPriceChange_TMPL {
    @Field(_ => Date)
    changedAt: Date | string;

    @Field(_ => Int)
    ingredientId: number;

    @Field(_ => Float)
    price: number;

    @Field()
    requestId: string;
}

export const PUBSUB_QueueAddedSupplier = 'added-suplier';
@ObjectType()
export class PUBSUB_QueueAddedSupplier_TMPL {
    @Field()
    requestId: string;

    @Field(_ => Int)
    id: number;

    @Field()
    name: string;
}


export const PUBSUB_QueueAddedIngredient = 'added-ingredient';
@ObjectType()
export class PUBSUB_QueueAddedIngredient_TMPL {
    @Field()
    requestId: string;

    @Field(_ => Int)
    id: number;

    @Field()
    name: string;
}

