import { emberVisiblePhotoCount } from '../src/types/profile';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

assert(emberVisiblePhotoCount(4, 'careful', false) === 1, 'ember careful hides extra until unlocked');
assert(emberVisiblePhotoCount(4, 'careful', true) === 4, 'liked unlocks ember photos');
assert(emberVisiblePhotoCount(4, 'open', false) === 4, 'open discretion shows all photos');
assert(emberVisiblePhotoCount(3, undefined, false) === 3, 'no discretion shows all photos');

console.log('validate-discover-photo-nav: ok');
