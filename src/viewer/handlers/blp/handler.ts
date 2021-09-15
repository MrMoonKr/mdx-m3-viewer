import { BlpImage } from '../../../parsers/blp/image';
import isBlp from '../../../parsers/blp/isformat';
import Texture from './texture';

export default {
  isValidSource(object: unknown) {
    if (object instanceof BlpImage) {
      return true;
    }

    return isBlp(object);
  },
  resource: Texture,
};
