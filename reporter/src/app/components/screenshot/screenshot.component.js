class ScreenshotController {
  constructor($scope) {
    'ngInject';
    this.show = true;

    this.$onInit = () => {
      $scope.$watch(() => this.spec.showScreenshots, (value) => {
        this.show = value;
      });
    }
  }
}

export let ScreenshotComponent = {
  bindings: {
    screenshots: '<model'
  },
  require: {
    spec: '^spec'
  },
  templateUrl: 'app/components/screenshot/screenshot.html',
  controller: ScreenshotController
};
