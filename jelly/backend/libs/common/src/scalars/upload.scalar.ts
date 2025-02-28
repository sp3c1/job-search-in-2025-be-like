import { GraphQLUpload } from 'graphql-upload-ts';

import { Scalar } from '@nestjs/graphql';

@Scalar('Upload')
export class UploadScalar {
  name = 'Upload';
  description = 'Upload files';

  parseValue(value) {
    return GraphQLUpload.parseValue(value);
  }

  serialize(value) {
    return GraphQLUpload.serialize(value);
  }

  parseLiteral(ast) {
    return GraphQLUpload.parseLiteral(ast, ast.value);
  }
}
