// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';

import 'src/welcome/welcome_component.dart';
import 'src/play/play_component.dart';
import 'src/leaderboard/leaderboard_component.dart';
import 'src/socket_service.dart';

@Component(
  selector: 'my-app',
  styleUrls: const ['app_component.css'],
  templateUrl: 'app_component.html',
  directives: const [
    materialDirectives,
//    WelcomeComponent, PlayComponent, LeaderboardComponent,
    ROUTER_DIRECTIVES
  ],
  providers: const [materialProviders, ROUTER_PROVIDERS, SocketService],
)
@RouteConfig(const [
  const Route(path: '/welcome', name: 'Welcome', component: WelcomeComponent, useAsDefault: true),
  const Route(path: '/play', name: 'Play', component: PlayComponent),
  const Route(path: '/leaderboard', name: 'Leaderboard', component: LeaderboardComponent),
])
class AppComponent {
  final SocketService socketService;
  AppComponent(this.socketService) {
    socketService.openSocket();
  }
}
