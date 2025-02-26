import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { BrandStore } from '../brand/brand.entity';
import { ProductStore } from '../product/product.entity';

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @Column()
    name: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ type: 'int2', default: 0 })
    visible: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    descriptionMarkdown: string;

    // Next step: put geom index
    @Column({ type: 'float', nullable: true })
    longitude?: number;

    // Next step: put geom index
    @Column({ type: 'float', nullable: true })
    latitude?: number;

    @Column({ nullable: true })
    image?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @OneToMany(() => BrandStore, bs => bs.store, { cascade: true, nullable: true })
    brandStores: BrandStore[];

    @OneToMany(() => ProductStore, productStore => productStore.store, { cascade: true, nullable: true })
    productStores: ProductStore[];

}
