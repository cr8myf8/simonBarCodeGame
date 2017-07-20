// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';
import 'package:angular2/platform/common.dart';

@Component(
  selector: 'play',
  styleUrls: const ['play_component.css'],
  templateUrl: 'play_component.html',
  directives: const [
    CORE_DIRECTIVES,
    materialDirectives,
  ],
  providers: const [],
)
class PlayComponent implements OnInit {
  final RouteParams _routeParams;
  final Location _location;
  String name;
  num score = 0;
  
  PlayComponent(this._routeParams, this._location);
  
  void ngOnInit() {
    name = _routeParams.get('name');
  }

  void goBack() => _location.back();
  
}
