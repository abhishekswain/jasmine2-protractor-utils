class SpecController {
  constructor() {
    'ngInject';
  }

}


export let SpecComponent = {
  templateUrl: 'app/components/spec/spec.html',
  bindings: {
    test: '<',
    expand: '<',
    showPassed: '<',
    showFailed: '<',
    showStack: '<',
    showLogs: '<',
    showSpecScreenshots: '<',
    logFilter: '<',
    showScreenshots: '<'
  },
  controller: SpecController
}
