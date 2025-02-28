import {
  createWriteStream,
  promises,
} from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { join } from 'path';

import {
  QUEUE_QueueIngredientsPrice,
  QUEUE_QueueIngredientsPrice_TMPL,
  RmqPublish,
  RmqService,
  UploadScalar,
} from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Args,
  ArgsType,
  Context,
  Field,
  Float,
  InputType,
  Mutation,
} from '@nestjs/graphql';

import {
  AllowedRoles,
  Roles,
} from '../../auth';
import { IContext } from '../config/apollo.config';

@InputType()
class PriceChange {
  @Field((_) => Date)
  changed_at: Date;

  @Field((_) => Float)
  price: number;
}

@InputType()
class UpdatePrices {
  @Field((_) => String)
  ingredient_name: string;

  @Field((_) => [PriceChange])
  price_changes: PriceChange[];
}

@ArgsType()
class ArgsUpdatePrices {
  @Field((_) => [UpdatePrices])
  changes: UpdatePrices[];
}

@ArgsType()
class ArgsLocalDonwnload {
  @Field((_) => UploadScalar)
  file: Promise<FileUpload>;
}

@Injectable()
export class IngredientPriceResolver {
  constructor(
    private configService: ConfigService,
    private readonly publisher: RmqService,
  ) { }

  @RmqPublish({
    routingKey: QUEUE_QueueIngredientsPrice
  })
  @Roles([AllowedRoles.All])
  @Mutation((_) => Boolean)
  async updatePrices(@Args() { changes }: ArgsUpdatePrices, @Context() ctx: IContext) {
    for (const ingredient of changes) {
      for (const priceUpdate of ingredient.price_changes) {
        // await this.pubSub.publish(QueueIngredientsPrice, <QueueIngredientsPriceType>{
        //   requestId: ctx.id,
        // changedAt: new Date(priceUpdate.changed_at),
        // name: ingredient.ingredient_name,
        // price: priceUpdate.price,
        // });

        await this.publisher.send({ routingKey: QUEUE_QueueIngredientsPrice }, <QUEUE_QueueIngredientsPrice_TMPL>{
          requestId: ctx.id,
          changedAt: new Date(priceUpdate.changed_at),
          name: ingredient.ingredient_name,
          price: priceUpdate.price,
        }).catch();
      }
    }

    return true;
  }

  @RmqPublish({
    routingKey: QUEUE_QueueIngredientsPrice
  })
  @Roles([AllowedRoles.All])
  @Mutation(() => Boolean)
  async jsonPricesUpload(
    @Context() ctx: IContext,
    @Args() { file }: ArgsLocalDonwnload
  ): Promise<boolean> {
    const resolveFile = await file;

    // normally should go through presigned s3 links
    const uploadDir = join(process.cwd(), 'uploads');
    // const uploadDir = join('uploads');
    const filePath = join(uploadDir, resolveFile.filename);

    await new Promise((resolve, reject) =>
      resolveFile
        .createReadStream()
        .pipe(createWriteStream(filePath))
        .on('finish', () => resolve(true))
        .on('error', () => reject(false))
    );

    // not that safe - again would be better it was goings through s3
    // but i do not have more energy to go on this ;]
    const fileContents = await promises.readFile(filePath, 'utf8');
    const changes = <UpdatePrices[]>JSON.parse(fileContents);

    (async () => {
      for (const ingredient of changes) {
        for (const priceUpdate of ingredient.price_changes) {
          // await this.pubSub.publish(QueueIngredientsPrice, <QueueIngredientsPriceType>{
          //   requestId: ctx.id,
          //   changedAt: new Date(priceUpdate.changed_at),
          //   name: ingredient.ingredient_name,
          //   price: priceUpdate.price,
          // });

          // // simulate some better queuing mechanics, like rabbit
          // await sleep(50);

          await this.publisher.send({ routingKey: QUEUE_QueueIngredientsPrice }, <QUEUE_QueueIngredientsPrice_TMPL>{
            requestId: ctx.id,
            changedAt: new Date(priceUpdate.changed_at),
            name: ingredient.ingredient_name,
            price: priceUpdate.price,
          }).catch();

        }
      }
    })().catch();
    //return context while things are executing
    // normally should be done like csv scenario to offload from main server

    return true;
  }
}
