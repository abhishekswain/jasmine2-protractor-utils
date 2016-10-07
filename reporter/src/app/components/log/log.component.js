class LogController {
  constructor($scope) {
    'ngInject';
    this.$onInit = () => {
      $scope.$watch(() => this.spec.showLogs, (value) => {
        this.showLogs = value;
      });
      $scope.$watch(() => this.spec.logFilter, (value) => {
        this.filter = value;
      });
    }
  }

  logLevel(log) {
    switch (log.level.toUpperCase()) {
      case 'INFO':
        return 'text-info';
      case 'WARNING':
        return 'text-warning';
      case 'SEVERE':
      case 'ERROR':
        return 'text-danger';
      case 'DEBUG':
        return 'text-muted';
      default:
        return '';
    }
  }
}


export let LogComponent = {
  bindings: {
    model: '<'
  },
  require: {
    spec: '^spec'
  },
  templateUrl: 'app/components/log/log.html',
  controller: LogController
};
