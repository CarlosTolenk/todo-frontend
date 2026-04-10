import { PageStateComponent } from './page-state.component';

describe('PageStateComponent', () => {
  it('uses the expected defaults for optional inputs', () => {
    const component = new PageStateComponent();

    expect(component.icon).toBe('info');
    expect(component.action).toBeNull();
  });

  it('accepts a custom action callback', () => {
    const component = new PageStateComponent();
    const action = vi.fn();

    component.action = action;
    component.action?.();

    expect(action).toHaveBeenCalled();
  });
});
