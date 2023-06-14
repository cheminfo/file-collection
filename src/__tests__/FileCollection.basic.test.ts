import { test } from 'vitest';

import { FileCollection } from '../FileCollection';

test('FileCollection basic ium tests', async () => {
  const fileCollection = new FileCollection();

  await fileCollection.appendText('hello.txt', 'Hello word');

  const ium = await fileCollection.toIum();

  const newCollection = [...(await FileCollection.fromIum(ium))];
  console.log(newCollection);
  const text = await newCollection[0].text();
  console.log(text);
});
