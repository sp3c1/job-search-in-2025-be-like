import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { Product } from '../product/product.entity';
import { Store } from '../store/store.enitty';

@Entity('brands')
export class Brand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @Column()
    name: string;

    // The "consolidated" flag in the JSON is numeric (0/1).
    @Column({ type: 'int2', default: 0 })
    consolidated: number;

    @Column({ type: 'int', nullable: true })
    integrationId: number;

    @Column({ nullable: true })
    internalName?: string;

    @Column({ nullable: true })
    logo?: string;

    @Column({ nullable: true })
    colour?: string;

    @Column({ nullable: true })
    success?: string;

    @Column({ nullable: true })
    share?: string;

    @Column({ type: 'int', nullable: true })
    weight?: number;

    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: 'deleted_at' })
    deletedAt?: Date;

    @Column({ type: 'int', nullable: true })
    expiry?: number;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true, })
    userId?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ type: 'int', nullable: true })
    vat?: number;

    @Column({ nullable: true })
    faq?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    redeem?: string;

    @Column({ nullable: true, })
    locationText?: string;

    @Column({ nullable: true })
    mapPinUrl?: string;

    @Column({ nullable: true })
    defaultLocationDescriptionMarkdown?: string;

    @Column({ nullable: true })
    logoUrl?: string;

    // Relations using explicit join entities:
    @OneToMany(() => BrandProduct, brandProduct => brandProduct.brand, { cascade: true, nullable: true })
    brandProducts: BrandProduct[];

    @OneToMany(() => BrandConsolidatedProduct, bcp => bcp.brand, { cascade: true, nullable: true })
    brandConsolidatedProducts: BrandConsolidatedProduct[];

    @OneToMany(() => BrandStore, brandStore => brandStore.brand, { cascade: true, nullable: true })
    brandStores: BrandStore[];
}

@Entity('brand_stores')
@Unique(['brand', 'store'])
export class BrandStore {
    @PrimaryColumn({ type: 'uuid' })
    brandId: string;

    @PrimaryColumn({ type: 'uuid' })
    storeId: string;

    @ManyToOne(() => Brand, brand => brand.brandStores, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @ManyToOne(() => Store, store => store.brandStores, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'storeId' })
    store: Store;
}

@Entity('brand_consolidated_products')
@Unique(['brand', 'product'])
export class BrandConsolidatedProduct {
    @PrimaryColumn({ type: 'uuid', })
    brandId: string;

    @PrimaryColumn({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Brand, brand => brand.brandProducts, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @ManyToOne(() => Product, product => product.brandConsolidatedProducts, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'productId' })
    product: Product;
}

@Entity('brand_products')
@Unique(['brand', 'product'])
export class BrandProduct {
    @PrimaryColumn({ type: 'uuid' })
    brandId: string;

    @PrimaryColumn({ type: 'uuid' })
    productId: string;

    @ManyToOne(() => Brand, brand => brand.brandProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'brandId' })
    brand: Brand;

    @ManyToOne(() => Product, product => product.brandProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;
}
