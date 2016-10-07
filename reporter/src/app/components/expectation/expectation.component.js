class ExpectationController {
  constructor($scope, $log) {
    'ngInject';

    this.$onInit = () => {

      $scope.$watch(() => this.spec.showStack, (value) => {
        this.showStack = value;
        $log.debug('showStack = ', value);
      });

      this.setup($scope, $log);
    };
  }

  setup($scope, $log) {
    if (this.failed()) {
      $scope.$watch(() => this.spec.showFailed, (value) => {
        this.show = value;
        $log.debug('showFailed = ', value);
      });
    }

    if (this.passed()) {
      $scope.$watch(() => this.spec.showPassed, (value) => {
        this.show = value;
        $log.debug('showPassed = ', value);
      });
    }
  }

  failed() {
    return this.type === 'failed';
  }

  passed() {
    return this.type === 'passed';
  }

}


export let ExpectationComponent = {
  templateUrl: 'app/components/expectation/expectation.html',
  bindings: {
    model: '<',
    type: '@'
  },
  controller: ExpectationController,
  require: {
    spec: '^spec'
  }
};
