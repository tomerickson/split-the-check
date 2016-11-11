import { SplitTheCheckPage } from './app.po';

describe('split-the-check App', function() {
  let page: SplitTheCheckPage;

  beforeEach(() => {
    page = new SplitTheCheckPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
