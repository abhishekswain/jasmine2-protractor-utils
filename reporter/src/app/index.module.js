/* global moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { ExpectationComponent } from '../app/components/expectation/expectation.component';
import { LogComponent } from '../app/components/log/log.component';
import { SpecComponent } from '../app/components/spec/spec.component';
import { ScreenshotComponent } from '../app/components/screenshot/screenshot.component';
// import { Data } from '../app/components/dev/data.mock';

angular.module('reporter', ['ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap'])
  .constant('moment', moment)
  // .constant('data', Data)

  .config(config)
  .config(routerConfig)
  .run(runBlock)

  .component('spec', SpecComponent)
  .component('expectations', ExpectationComponent)
  .component('logs', LogComponent)
  .component('screenshots', ScreenshotComponent)

  .controller('MainController', MainController)
  ;
