import {
    TSchema,
    Type,
} from '@sinclair/typebox';

export function PaginatedResponse<T extends TSchema>(itemsSchema: T) {
    return Type.Object({
        page: Type.Number({ minimum: 1 }),
        size: Type.Number({ minimum: 1, maximum: 50 }),
        total: Type.Number(),
        data: Type.Array(itemsSchema)
    });
}

export interface PaginatedResponseType<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
}

export const defaultSizeInput = Type.Number({ default: 20, minimum: 1, maximum: 100 });
export const defualtPageInput = Type.Number({ default: 1, minimum: 1 });