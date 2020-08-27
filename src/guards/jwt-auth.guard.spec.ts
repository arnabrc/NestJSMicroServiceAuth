import { Guards\jwtAuthGuard } from './guards\jwt-auth.guard';

describe('Guards\jwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new Guards\jwtAuthGuard()).toBeDefined();
  });
});
