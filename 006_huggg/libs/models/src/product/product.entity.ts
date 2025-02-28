import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import {
  BrandConsolidatedProduct,
  BrandProduct,
} from '../brand/brand.entity';
import { Store } from '../store/store.enitty';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  campaign?: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ nullable: true })
  internalName?: string;

  @Column({ nullable: true })
  integration?: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'int', nullable: true })
  over18Offer?: number;

  @Column({ nullable: true })
  redemptionInstructions?: string

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  subtitle?: string;

  @Column({ type: 'int', nullable: true })
  weight?: number;

  @Column({ nullable: true })
  recipientDescription?: string;

  @Column({ nullable: true })
  tagGroupId?: string;

  @Column({ nullable: true })
  tag_id?: string;

  @Column({ nullable: true })
  openGraphImage?: string;

  @Column({ type: 'int', nullable: true })
  active?: number;

  @Column({ type: 'int', nullable: true })
  onApp?: number;

  @Column({ type: 'int', nullable: true })
  onImessage?: number;

  @Column({ type: 'int', nullable: true })
  handlingFee?: number;

  @Column({ type: 'int', nullable: true })
  salePrice?: number

  @Column({ nullable: true })
  hugggTag?: string;

  @Column({ nullable: true })
  vatVoucherType?: string;

  @Column({ type: 'int', nullable: true })
  vat?: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  claimImage?: string;

  @Column({ nullable: true })
  claimImageUrl?: string;

  @Column({ nullable: true })
  imessageImage?: string;

  @Column({ nullable: true })
  imessageImageUrl?: string;

  @Column({ nullable: true })
  openGraphImageUrl?: string;

  // Inverse relation for the consolidated association to brands
  @OneToMany(() => BrandProduct, bp => bp.product, { cascade: true, nullable: true })
  brandProducts: BrandProduct[];

  @OneToMany(() => BrandConsolidatedProduct, bcp => bcp.product, { cascade: true, nullable: true })
  brandConsolidatedProducts: BrandConsolidatedProduct[];

  @OneToMany(() => ProductStore, productStore => productStore.product, { cascade: true, nullable: true })
  productStores: ProductStore[];
}

@Entity('product_stores')
@Unique(['product', 'store'])
export class ProductStore {
  @PrimaryColumn({ type: 'uuid' })
  productId: string;

  @PrimaryColumn({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Product, product => product.productStores, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => Store, store => store.productStores, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'storeId' })
  store: Store;
}
