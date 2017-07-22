// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';

@Component(
  selector: 'leaderboard',
  styleUrls: const ['leaderboard_component.css'],
  templateUrl: 'leaderboard_component.html',
  directives: const [
    CORE_DIRECTIVES,
    materialDirectives,
  ],
  providers: const [],
)
class LeaderboardComponent {
  final Router _router;
  
  LeaderboardComponent(this._router);
  
  void goBack() {
    _router.navigate(['Welcome']);
  }
}
