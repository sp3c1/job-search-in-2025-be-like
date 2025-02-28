import { readFile } from 'fs/promises';
import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Brand } from '@huggg/models/brand/brand.entity';
import { Product } from '@huggg/models/product/product.entity';
import { Store } from '@huggg/models/store/store.enitty';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
    BrandsResponse,
    CliService,
} from '../cli.service';
import {
    IBrand,
    IProduct,
} from '../cli.types';

// Mock fs/promises.readFile
jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
}));

describe('CliService', () => {
    let service: CliService;
    let repoMock: jest.Mocked<Repository<Brand>>;
    let entityManagerMock: jest.Mocked<EntityManager>;

    beforeEach(async () => {
        // Create mocks for the entity manager methods used in the service.
        entityManagerMock = {
            delete: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<EntityManager>;

        // The repository mock only needs to provide the manager.
        repoMock = {
            manager: entityManagerMock,
        } as unknown as jest.Mocked<Repository<Brand>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CliService,
                {
                    provide: getRepositoryToken(Brand),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<CliService>(CliService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('processProducts', () => {
        it('should delete then save each product', async () => {
            const sampleProduct: IProduct = {
                id: 'prod-1',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z',
                description: 'desc',
                campaign: 'camp',
                label: 'label',
                internal_name: 'internal',
                integration: 'integration',
                price: '10',
                over_18_offer: 0,
                redemption_instructions: 'redeem',
                image: 'img.png',
                subtitle: 'sub',
                weight: 1,
                recipient_description: 'rec',
                tag_group_id: 'tg1',
                tag_id: 't1',
                open_graph_image: 'og.png',
                active: 0,
                on_app: 1,
                on_imessage: 3,
                handling_fee: 2,
                sale_price: 8,
                huggg_tag: 'tag',
                vat_voucher_type: 'type',
                vat: 0.2,
                image_url: 'url',
                claim_image: 'ci.png',
                claim_image_url: 'ci-url',
                imessage_image: 'ii.png',
                imessage_image_url: 'ii-url',
                open_graph_image_url: 'oig.png',
            };

            await service.processProducts([sampleProduct]);

            // Expect deletion and saving for the product.
            expect(entityManagerMock.delete).toHaveBeenCalledWith(Product, { id: sampleProduct.id });
            expect(entityManagerMock.save).toHaveBeenCalledWith(
                Product,
                expect.objectContaining({
                    id: sampleProduct.id,
                    description: sampleProduct.description,
                    // Other fields are mapped accordingly.
                })
            );
        });
    });

    describe('processStores', () => {
        it('should delete then save each store', async () => {
            const sampleStore = {
                id: 'store-1',
                name: 'Store 1',
                visible: 1,
                website: 'https://example.com',
                description: 'desc',
                description_markdown: 'desc md',
                image: 'img.png',
                image_url: 'url',
                latitude: '45.0',
                longitude: '90.0',
            };

            await service.processStores([sampleStore]);

            expect(entityManagerMock.delete).toHaveBeenCalledWith(Store, { id: sampleStore.id });
            expect(entityManagerMock.save).toHaveBeenCalledWith(
                Store,
                expect.objectContaining({
                    id: sampleStore.id,
                    name: sampleStore.name,
                    website: sampleStore.website,
                })
            );
        });
    });

    describe('processBrand', () => {
        it('should delete then save brand and its associations', async () => {
            const sampleBrand: IBrand = {
                id: 'brand-1',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z',
                deleted_at: null,
                name: 'Brand 1',
                consolidated: 0,
                integration_id: 1,
                internal_name: 'internal',
                logo: 'logo.png',
                colour: 'blue',
                success: "msg",
                share: "share",
                weight: 1,
                expiry: 220,
                website: 'https://brand.com',
                user_id: 'user-1',
                email: 'brand@example.com',
                vat: 0.2,
                faq: 'faq',
                description: 'desc',
                redeem: 'redeem',
                location_text: 'location',
                map_pin_url: 'map.png',
                default_location_description_markdown: 'desc md',
                logo_url: 'logo-url.png',
                products: ['prod-1'],
                consolidated_products: ['prod-2'],
                stores: ['store-1'],
            };

            await service.processBrand([sampleBrand]);

            // Verify that the brand deletion and saving was attempted.
            expect(entityManagerMock.delete).toHaveBeenCalledWith(Brand, { id: sampleBrand.id });
            expect(entityManagerMock.save).toHaveBeenCalledWith(
                Brand,
                expect.objectContaining({
                    id: sampleBrand.id,
                    name: sampleBrand.name,
                })
            );
            // For associated records, you can verify that save was called multiple times.
            // For example, BrandProduct, BrandConsolidatedProduct, BrandStore, and ProductStore calls.
            // Since they use the same entityManager.save call, you may count the number of calls:
            // One for the brand, then one for each product, consolidated product, store, etc.
            // Here we expect at least one call for each association.
            expect(entityManagerMock.save).toHaveBeenCalledTimes(
                1 + // saving Brand
                sampleBrand.products.length +
                sampleBrand.consolidated_products.length +
                sampleBrand.stores.length +
                sampleBrand.stores.length * (sampleBrand.consolidated_products.length + sampleBrand.products.length)
            );
        });
    });

    describe('loadBrandsStoresProducts', () => {
        it('should load JSON file and call process methods', async () => {
            const sampleData: BrandsResponse = {
                data: [
                    {
                        id: 'brand-1',
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2023-01-02T00:00:00Z',
                        deleted_at: null,
                        name: 'Brand 1',
                        consolidated: 0,
                        integration_id: 1,
                        internal_name: 'internal',
                        logo: 'logo.png',
                        colour: 'blue',
                        success: "success",
                        share: 'share',
                        weight: 1,
                        expiry: 220,
                        website: 'https://brand.com',
                        user_id: 'user-1',
                        email: 'brand@example.com',
                        vat: 0.2,
                        faq: 'faq',
                        description: 'desc',
                        redeem: 'redeem',
                        location_text: 'location',
                        map_pin_url: 'map.png',
                        default_location_description_markdown: 'desc md',
                        logo_url: 'logo-url.png',
                        products: ['prod-1'],
                        consolidated_products: ['prod-2'],
                        stores: ['store-1'],
                    }
                ],
                embedded: {
                    products: [
                        {
                            id: 'prod-1',
                            created_at: '2023-01-01T00:00:00Z',
                            updated_at: '2023-01-02T00:00:00Z',
                            description: 'desc',
                            campaign: 'camp',
                            label: 'label',
                            internal_name: 'internal',
                            integration: 'integration',
                            price: '10',
                            over_18_offer: 18,
                            redemption_instructions: 'redeem',
                            image: 'img.png',
                            subtitle: 'sub',
                            weight: 1,
                            recipient_description: 'rec',
                            tag_group_id: 'tg1',
                            tag_id: 't1',
                            open_graph_image: 'og.png',
                            active: 1,
                            on_app: 3,
                            on_imessage: 4,
                            handling_fee: 2,
                            sale_price: 8,
                            huggg_tag: 'tag',
                            vat_voucher_type: 'type',
                            vat: 0.2,
                            image_url: 'url',
                            claim_image: 'ci.png',
                            claim_image_url: 'ci-url',
                            imessage_image: 'ii.png',
                            imessage_image_url: 'ii-url',
                            open_graph_image_url: 'oig.png',
                        }
                    ],
                    stores: [
                        {
                            id: 'store-1',
                            name: 'Store 1',
                            visible: 1,
                            website: 'https://example.com',
                            description: 'desc',
                            description_markdown: 'desc md',
                            image: 'img.png',
                            image_url: 'url',
                            latitude: '45.0',
                            longitude: '90.0',
                        }
                    ]
                },
                current_page: 1,
                from: 1,
                last_page: 1,
                next_page_url: "next_page_url",
                path: "path",
                per_page: 10,
                prev_page_url: "prev_page_url",
                to: 1,
                total: 10
            };

            const readFileMock = readFile as jest.Mock;
            readFileMock.mockResolvedValue(JSON.stringify(sampleData));

            // Spy on process methods so we can verify they are called with correct data.
            const processProductsSpy = jest.spyOn(service, 'processProducts').mockResolvedValue();
            const processStoresSpy = jest.spyOn(service, 'processStores').mockResolvedValue();
            const processBrandSpy = jest.spyOn(service, 'processBrand').mockResolvedValue();

            await service.loadBrandsStoresProducts();

            expect(readFileMock).toHaveBeenCalled();
            expect(processProductsSpy).toHaveBeenCalledWith(sampleData.embedded.products, false);
            expect(processStoresSpy).toHaveBeenCalledWith(sampleData.embedded.stores, false);
            expect(processBrandSpy).toHaveBeenCalledWith(sampleData.data, false);
        });
    });
});
