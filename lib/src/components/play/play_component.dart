// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
import 'dart:async';
import 'dart:html' as HTML;

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';
import 'package:angular2/platform/common.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

import 'package:simon/src/models/leader.dart';
import 'package:simon/src/services/leaderboard_service.dart';

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
  final Router _router;
  final Location _location;
  final LeaderboardService _leaderboardService;

  IO.Socket socket;
  String name;
  num score = 0;

  String timerMsg;
  int countDown = 4;
  Timer countDownTimer;
  
  String gameTimerMsg;
  int gameTime = 5;
  Timer gameTimer;
  bool gameInProgress = false;
  
  @ViewChild('one') ElementRef green;
  @ViewChild('two') ElementRef red;
  @ViewChild('three') ElementRef yellow;
  @ViewChild('four') ElementRef blue;
  
  PlayComponent(this._router, this._routeParams,
      this._location, this._leaderboardService) {}

  void ngOnInit() {
    print('running oninit');
    name = _routeParams.get('name');

    socket = IO.io('http://localhost:3000');
    socket.on('connect', (_) {
      print('Socket connected (client)');
      
      // need to send something stupid initially so that it will keep listening
      socket.emit('client');

      socket.on('server', (_) => print('handshake'));
      
      countDownTimer = new Timer.periodic(const Duration(seconds: 1), (Timer countDownTimer) {
        countDown--;
        timerMsg = countDown > 0 ? 'BEGIN IN ${countDown}' : 'GO!';

        if (countDown == 0) {
          socket.emit('start game');
          countDownTimer.cancel();
          gameInProgress = true;
          
          gameTimer = new Timer.periodic(const Duration(seconds: 1), (Timer gameTimer) {
            gameTime--;
            gameTimerMsg = gameTime > 0 ? gameTime.toString() : 'END GAME';

            if (gameTime == 0) {
              print('game over');
              _updateLeaderboard();
              socket.emit('end game', _leaderboardService.getJSONLeaders());
              socket.disconnect();
              gameTimer.cancel();
//              gameInProgress = false;
            }
          });
        }
      });
    });

    socket.on('new color', (data) {
      print('new color: $data');
      HTML.Animation animation;
      HTML.Element element;
      switch (data) {
        case 1:
          element = green.nativeElement; break;
        case 2:
          element = red.nativeElement; break;
        case 3:
          element = yellow.nativeElement; break;
        case 4:
          element = blue.nativeElement; break;
      }
      animation = element.animate([{"opacity": 100}, {"opacity": 0}], 150);
      animation.play();
    });

    socket.on('point', (_) => score++);

    socket.on('disconnected', (_) => print('socket disconnected (server)'));
  }
  
  void _updateLeaderboard() {
//    Leader player = new Leader(name, score);
    Leader player = new Leader(name, 25);
    _leaderboardService.leaders.add(player);
    _leaderboardService.leaders.sort((a, b) => b.score.compareTo(a.score));
    this._router.navigate(['Leaderboard', player.toMap()]);
  }

  void goBack() => _location.back();
}
