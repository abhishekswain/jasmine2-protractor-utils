class SpecController {
  constructor() {
    'ngInject';
  }

}


export let SpecComponent = {
  templateUrl: 'app/components/spec/spec.html',
  bindings: {
    test: '<',
    filtering: '<'
  },
  controller: SpecController
}
