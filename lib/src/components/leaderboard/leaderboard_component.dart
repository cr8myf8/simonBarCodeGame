// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';

import 'package:simon/src/services/leaderboard_service.dart';
import 'package:simon/src/models/leader.dart';

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
  final RouteParams _routeParams;
  final LeaderboardService leaderboardService;
  
  String name;
  String score;
  List<Leader> leaders;
  
  LeaderboardComponent(this._router, this._routeParams, this.leaderboardService) {
    if (leaderboardService.leaders.length >= 10) {
    leaders = leaderboardService.leaders.sublist(0, 10);
    }
    else {
      leaders = leaderboardService.leaders;
    }
    name = _routeParams.get('name');
    score = _routeParams.get('score');
  }
  
  void newGame() {
    _router.navigate(['Welcome']);
  }
}
