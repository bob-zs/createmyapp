import { main } from '../setup';

test('main function runs without errors', async () => {
  await expect(main()).resolves.not.toThrow();
});
