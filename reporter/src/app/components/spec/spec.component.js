class SpecController {
  constructor($scope) {
    'ngInject';
    this.$onInit = () => {
      $scope.$watch(() => this.filtering.expand, (value) => {
        this.expand = value;
      });
    }
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
