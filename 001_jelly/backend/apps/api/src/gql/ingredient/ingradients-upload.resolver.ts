import { createWriteStream } from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { join } from 'path';

import {
  QUEUE_QueueIngredientsCsv,
  QUEUE_QueueIngredientsCsv_TMPL,
  RmqPublish,
  RmqService,
  UploadScalar,
} from '@app/common';
import { Logger } from '@nestjs/common';
import {
  Args,
  ArgsType,
  Context,
  Field,
  Mutation,
  Resolver,
} from '@nestjs/graphql';

import { IContext } from '../config/apollo.config';

@ArgsType()
class ArgsLocalDonwnload {
  @Field((_) => UploadScalar)
  file: Promise<FileUpload>;
}

// v1 with local uploac
// v2 with s3
@Resolver()
export class FileUploadResolver {

  constructor(private readonly publisher: RmqService) { }


  @RmqPublish({
    exchange: 'main',
    routingKey: QUEUE_QueueIngredientsCsv
  })
  @Mutation(() => Boolean)
  async ingredientUploadV1(
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

    // this.pubSub
    //   .publish(QueueIngredientsCsv, <QueueIngredientsCsvType>{
    //     filePath: filePath,
    //     requestId: ctx.id,
    //   })
    //   .finally();

    this.publisher.send({
      routingKey: QUEUE_QueueIngredientsCsv
    }, <QUEUE_QueueIngredientsCsv_TMPL>{
      filePath: filePath,
      requestId: ctx.id,
    }).catch(e => {
      Logger.error(e);
    });
    return true;
  }
}
