// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
import 'dart:async';
import 'dart:html' as HTML;

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';
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
  final Router _router;
  final RouteParams _routeParams;
  final LeaderboardService _leaderboardService;

  IO.Socket socket;
  String name;
  num score;

  String timerMsg;
  int countDown;
  Timer countDownTimer;
  
  String gameTimerMsg;
  int gameTime;
  Timer gameTimer;
  bool gameInProgress;

  HTML.Animation animation;
  
  @ViewChild('one') ElementRef green;
  @ViewChild('two') ElementRef red;
  @ViewChild('three') ElementRef yellow;
  @ViewChild('four') ElementRef blue;
  
  PlayComponent(this._router, this._routeParams, this._leaderboardService) {}

  void ngOnInit() {
    print('on init');
    name = _routeParams.get('name');
    score = 0;
    countDown = 3;
    gameTime = 31;
    gameInProgress = false;

    timerMsg = countDown > 0 ? 'BEGIN IN ${countDown}' : 'GO!';
    gameTimerMsg = gameTime > 0 ? gameTime.toString() : 'END GAME';

    socket = IO.io('http://127.0.0.1:3000', {'forceNew': true});
    socket.on('connect', (_) {
      print('Socket connected (client)');

      // need to send something stupid initially so that it will keep listening
      socket.emit('client');
      socket.on('server', (_) => print('handshake'));

      // start a 3 - 2 - 1 countdown before beginning the game
      countDownTimer = new Timer.periodic(const Duration(seconds: 1), (Timer countDownTimer) {
        countDown--;
        timerMsg = countDown > 0 ? 'BEGIN IN ${countDown}' : 'GO!';

        // when the countDown is done, start the game
        if (countDown == 0) {
          socket.emit('start game');
          print('start game at ${new DateTime.now()}');
          countDownTimer.cancel();    // TODO: figure out why this doesn't stop it
//
//          // start the game timer
          gameTimer = new Timer.periodic(const Duration(seconds: 1), (Timer gameTimer) {
            gameInProgress = true;
            gameTime--;
            gameTimerMsg = gameTime > 0 ? gameTime.toString() : 'END GAME';
//
            if (gameTime == 0) {
              print('game over');
              _updateLeaderboard();
            }
          });
        }
      });
    });

    // when the socket (server) sends a new color, animate the corresponding square
    socket.on('new color', (data) {
      if (animation != null) {
        animation.cancel();
      }
      print('new color: $data');
      HTML.Element element;
      switch (data) {
        case 1: element = green.nativeElement; break;
        case 2: element = red.nativeElement; break;
        case 3: element = yellow.nativeElement; break;
        case 4: element = blue.nativeElement; break;
      }
      animation = element.animate([{"opacity": 100}, {"opacity": 0}], 150);
      animation.play();
    });

    // when the server acknowledges a correct scan, update the score
    socket.on('point', (_) {
      score++;
    });

    socket.on('disconnected', (_) => print('socket disconnected (server)'));
  }
  
  // send current player and score to leaderboard list, sort it, and go to leaderboard page
  void _updateLeaderboard() {
    Leader player = new Leader(name, score);
    _leaderboardService.leaders.add(player);
    _leaderboardService.leaders.sort((a, b) => b.score.compareTo(a.score));
    socket.emit('end game', _leaderboardService.getJSONLeaders());
    gameInProgress = false;
    if (countDownTimer.isActive) countDownTimer.cancel();
    if (gameTimer.isActive) gameTimer.cancel();
    _cleanupSocket();
    this._router.navigate(['Leaderboard', player.toMap()]);
  }
  
  // clean everything up so more games can be played
  void _cleanupSocket() {
    socket.clearListeners();
    socket.disconnect();
    socket.destroy();
    socket.close();
  }

  // reset everything if user clicks Quit button so more games can be played
  void quit() {
    socket.emit('quit game');
    gameInProgress = false;
    if (countDownTimer.isActive) countDownTimer.cancel();
    if (gameTimer.isActive) gameTimer.cancel();
    _cleanupSocket();
    this._router.navigate(['Welcome']);
  }
  
}
