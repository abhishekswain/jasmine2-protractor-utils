export class MainController {
  constructor(data) {
    'ngInject';

    this.expand = true;
    this.showPassed = true;
    this.showFailed = true;
    this.showStack = false;
    this.showLogs = true;
    this.showSpecScreenshots = false;
    this.showScreenshots = false;
    this.logFilter = 'severe';
    this.data = data;
  }
}
