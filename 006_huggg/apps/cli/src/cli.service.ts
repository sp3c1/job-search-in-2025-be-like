import { readFile } from 'fs/promises';
import { resolve } from 'path';
import {
  EntityManager,
  Repository,
} from 'typeorm';

import {
  Brand,
  BrandConsolidatedProduct,
  BrandProduct,
  BrandStore,
} from '@huggg/models/brand/brand.entity';
import {
  Product,
  ProductStore,
} from '@huggg/models/product/product.entity';
import { Store } from '@huggg/models/store/store.enitty';
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  IBrand,
  IProduct,
  IStore,
  PaginatedResponse,
} from './cli.types';

export interface EmbeddedData {
  products: IProduct[];
  stores: IStore[];
}

// And then your paginated response for brands becomes:
export type BrandsResponse = PaginatedResponse<IBrand, EmbeddedData>;

@Injectable()
export class CliService {
  private entityManager: EntityManager;
  private fakeTimer = `2025-01-01T00:00:00Z`;

  constructor(
    @InjectRepository(Brand)
    private repo: Repository<Brand>
  ) {
    this.entityManager = this.repo.manager;
  }

  async processProducts(products: IProduct[] = [], fakeTimers = false) {
    let productOk = 0;
    let productFail = 0;
    Logger.log(`[Inserting products] num: ${products?.length}`)
    for (const product of products) {
      // Logger.log(`[Inserting product] id: ${product.id}`);

      await this.entityManager.delete(Product, { id: product.id }).catch();

      await this.entityManager.save(Product, {
        id: product.id,
        createdAt: fakeTimers ? new Date(this.fakeTimer) : new Date(product.created_at),
        updatedAt: fakeTimers ? new Date(this.fakeTimer) : new Date(product.updated_at),
        description: product.description,
        campaign: product.campaign,
        label: product.label,
        internalName: product.internal_name,
        integration: product.integration,
        ...(product.price && { price: Number(product.price) }),
        over18Offer: product.over_18_offer,
        redemptionInstructions: product.redemption_instructions,
        image: product.image,
        subtitle: product.subtitle,
        weight: product.weight,
        recipientDescription: product.recipient_description,
        tagGroupId: product.tag_group_id,
        tag_id: product.tag_id,
        openGraphImage: product.open_graph_image,
        active: product.active,
        onApp: product.on_app,
        onImessage: product.on_imessage,
        handlingFee: product.handling_fee,
        salePrice: product.sale_price,
        hugggTag: product.huggg_tag,
        vatVoucherType: product.vat_voucher_type,
        vat: product.vat,
        imageUrl: product.image_url,
        claimImage: product.claim_image,
        claimImageUrl: product.claim_image_url,
        imessageImage: product.imessage_image,
        imessageImageUrl: product.imessage_image_url,
        openGraphImageUrl: product.open_graph_image_url,

      }).then(_ => {
        productOk++;
        // Logger.log(`[Inserting product] id: ${product.id} - ok`)
      }).catch(err => {
        productFail++;
        Logger.error(err);
        Logger.error(`[Inserting product] id: ${product.id} - fail`)
      })
    }
    Logger.log(`[Inserting products] ok: ${productOk} fail: ${productFail}`);
  }

  async processStores(stores: IStore[] = [], fakeTimers = false) {
    let storeOk = 0;
    let storeFail = 0;
    Logger.log(`[Inserting stores] num: ${stores?.length}`)
    for (const store of stores) {
      // Logger.log(`[Inserting store] id: ${store.id}`);

      await this.entityManager.delete(Store, { id: store.id }).catch()

      await this.entityManager.save(Store, {
        id: store.id,
        createdAt: fakeTimers ? new Date(this.fakeTimer) : new Date(),
        updatedAt: fakeTimers ? new Date(this.fakeTimer) : new Date(),

        name: store.name,
        visible: store.visible || 0,

        website: store.website,
        description: store.description,
        descriptionMarkdown: store.description_markdown,
        image: store.image,
        imageUrl: store.image_url,
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),


      }).then(_ => {
        storeOk++;
        // Logger.log(`[Inserting store] id: ${store.id} - ok`)
      }).catch(err => {
        storeFail++;
        Logger.error(err);
        Logger.error(`[Inserting store] id: ${store.id} - fail`)
      })
    }
    Logger.log(`[Inserting stores] ok: ${storeOk} fail: ${storeFail}`);
  }

  async processBrand(brands: IBrand[] = [], fakeTimers = false) {
    let brandOk = 0;
    let brandFail = 0;
    let pkFail = 0;
    let pkOk = 0;
    Logger.log(`[Inserting brands] num: ${brands.length}`)
    for (const brand of brands || []) {
      // Logger.log(`[Inserting brand] id: ${brand.id}`);


      await this.entityManager.delete(Brand, { id: brand.id }).catch();

      await this.entityManager.save(Brand, {
        id: brand.id,
        createdAt: fakeTimers ? new Date(this.fakeTimer) : new Date(brand.created_at),
        updatedAt: fakeTimers ? new Date(this.fakeTimer) : new Date(brand.updated_at),
        ...(brand.deleted_at && { deletedAt: new Date(brand.deleted_at) }),
        name: brand.name,
        consolidated: brand.consolidated || 0,
        integrationId: brand.integration_id,
        internalName: brand.internal_name,
        logo: brand.logo,
        colour: brand.colour,
        success: brand.success,
        share: brand.share,
        weight: brand.weight,
        expiry: brand.expiry,
        website: brand.website,
        userId: brand.user_id,
        email: brand.email,
        vat: brand.vat,
        faq: brand.faq,
        description: brand.description,
        redeem: brand.redeem,
        locationText: brand.location_text,
        mapPinUrl: brand.map_pin_url,
        defaultLocationDescriptionMarkdown: brand.default_location_description_markdown,
        logoUrl: brand.logo_url
      }).then(_ => {
        brandOk++;
        // Logger.log(`[Inserting brand] id: ${brand.id} - ok`)
      }).catch(err => {
        brandFail++;
        Logger.error(err);
        Logger.error(`[Inserting brand] id: ${brand.id} - fail`)
      })

      const brandId = brand.id;

      for (const productId of brand.products || []) {
        // Logger.log(`[Inserting brand-product] brandId: ${brandId} productId ${productId}`);
        await this.entityManager.save(BrandProduct, {
          brandId,
          productId
        }).then(() => {
          pkOk++
        }).catch(err => {
          pkFail++;
          console.error(`Error creating brand-product`, err);
        });
      }

      for (const productId of brand.consolidated_products || []) {
        // Logger.log(`[Inserting brand-consolidated-product] brandId: ${brandId} productId ${productId}`);
        await this.entityManager.save(BrandConsolidatedProduct, {
          brandId,
          productId
        }).then(() => {
          pkOk++
        }).catch(err => {
          pkFail++;
          console.error(`Error creating brand-consolidated-product`, err);
        });
      }

      for (const storeId of brand.stores || []) {
        // Logger.log(`[Inserting brand-store] brandId: ${brandId} productId ${storeId}`);
        await this.entityManager.save(BrandStore, {
          brandId,
          storeId
        }).then(() => {
          pkOk++
        }).catch(err => {
          pkFail++;
          console.error(`Error creating brand-store`, err);
        });
      }

      for (const storeId of brand.stores || []) {
        for (const productId of brand.consolidated_products || []) {
          await this.entityManager.save(ProductStore, {
            productId,
            storeId
          }).then(() => {
            pkOk++
          }).catch(err => {
            pkFail++;
            console.error(`Error creating product-store`, err);
          });
        }
        for (const productId of brand.products || []) {
          await this.entityManager.save(ProductStore, {
            productId,
            storeId
          }).then(() => {
            pkOk++
          }).catch(err => {
            pkFail++;
            console.error(`Error creating product-consolidated-store`, err);
          });
        }
      }
    }
    Logger.log(`[Inserting brands] ok: ${brandOk} fail: ${brandFail} pkOk: ${pkOk} pkfail: ${pkFail}`);
  }

  async loadBrandsStoresProducts(fakeTimers = false) {
    Logger.log(`---------------------- START`);

    Logger.log(`[Loading file] ./brands.json`);
    const file = './brands.json';

    const fullPath = resolve(file);
    const jsonData = <BrandsResponse>JSON.parse(await readFile(fullPath, 'utf8'));

    // ----------------------------------------- product
    await this.processProducts(jsonData?.embedded.products, fakeTimers)
    // ----------------------------------------- stores
    await this.processStores(jsonData?.embedded.stores, fakeTimers)
    // ----------------------------------------- product 
    await this.processBrand(jsonData?.data, fakeTimers);

    Logger.log(`---------------------- END`);
  }
}
