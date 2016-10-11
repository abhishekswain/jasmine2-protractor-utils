export class MainController {
  constructor(data, $sessionStorage) {
    'ngInject';

    this.data = data;
    this.storage = $sessionStorage;

    this.storage.$default({
      filtering: this.getDefaultConfiguration()
    });

    this.filtering = this.storage.filtering;
  }

  getDefaultConfiguration() {
    return {
      expand: true,
      showPassed: true,
      showFailed: true,
      showStack: false,
      showLogs: true,
      showSpecScreenshots: false,
      showScreenshots: false,
      logFilter: 'severe'
    };
  }

  reset() {
    this.storage.$reset({
      filtering: this.getDefaultConfiguration()
    });
    this.filtering = this.storage.filtering;
  }
}
