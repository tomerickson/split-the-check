import { SplitTheCheckPage } from './app.po';

describe('split-the-check App', () => {
  let page: SplitTheCheckPage;

  beforeEach(() => {
    page = new SplitTheCheckPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
