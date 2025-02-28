import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Product } from '@huggg/models/product/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CacheService } from '../../internal/cache/service/cache.service';
import { deseliarizerProduct } from './types/product.dto';

@Injectable()
export class ProductService {
    private entityManager: EntityManager;

    constructor(
        @InjectRepository(Product)
        private repo: Repository<Product>,
        private cacheService: CacheService
    ) {
        this.entityManager = this.repo.manager;
    }


    async findPaginatedProductsForBrand(
        brandId: string,
        page?: number,
        size?: number
    ) {
        const take = size ? size : undefined;
        const skip = page && size ? (page - 1) * (size) : undefined;

        const cacheKey = this.cacheService.makeHashKey(
            `service`,
            `brand_products_${brandId}_size_${size}_page_${page}`,
            { brandId, page, size }
        );

        const cachedProducts = await this.cacheService.get(cacheKey) as Product[];
        if (cachedProducts) {
            return cachedProducts.map(product => deseliarizerProduct(product));
        }

        // Use positional parameter $1 in both subqueries.
        const regularProductsQuery = this.entityManager
            .createQueryBuilder(Product, 'p')
            .innerJoin('p.brandProducts', 'bp')
            .where('bp.brandId = $1')
            .select('p.*, 1 as main')
            .getQuery();

        const consolidatedProductsQuery = this.entityManager
            .createQueryBuilder(Product, 'p')
            .innerJoin('p.brandConsolidatedProducts', 'bcp')
            .where('bcp.brandId = $1')
            .select('p.*, 0 as main')
            .getQuery();

        // Combine the subqueries with a UNION. The same positional placeholder $1 appears in both parts.
        const unionQuery = `
          (${regularProductsQuery})
          UNION
          (${consolidatedProductsQuery})
          ORDER BY main ASC, id DESC
        ` + (page && size ? `LIMIT ${take} OFFSET ${skip};` : `;`);

        // Since $1 is used in both subqueries, we only need to pass one parameter.
        const products = await this.entityManager.query<Product[]>(unionQuery, [brandId]);
        this.cacheService.setex(cacheKey, products, 5).catch() // fire and forget

        return products;
    }

    async countProductsForBrand(brandId: string): Promise<number> {
        const cacheKey = this.cacheService.makeHashKey(
            `service`,
            `brand_products_count_${brandId}`,
            { brandId }
        );

        const cachedCount = await this.cacheService.get(cacheKey) as number;
        if (cachedCount) {
            return cachedCount;
        }

        const regularCountQuery = this.entityManager
            .createQueryBuilder(Product, 'p')
            .innerJoin('p.brandProducts', 'bp')
            .where('bp.brandId = :brandId', { brandId })
            .getCount();

        const consolidatedCountQuery = this.entityManager
            .createQueryBuilder(Product, 'p')
            .innerJoin('p.brandConsolidatedProducts', 'bcp')
            .where('bcp.brandId = :brandId', { brandId })
            .getCount();

        const [regularCount, consolidatedCount] = await Promise.all([
            regularCountQuery,
            consolidatedCountQuery
        ]);

        const total = regularCount + consolidatedCount;
        this.cacheService.setex(cacheKey, total, 5).catch(); // fire and forget

        return total;
    }
}
