// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
import 'dart:async';
import 'dart:html' as HTML;

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';
import 'package:angular2/platform/common.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

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
class PlayComponent implements AfterViewInit, OnInit {
  final RouteParams _routeParams;
  final Location _location;

  IO.Socket socket;
  String name;
  num score = 0;

  String timerMsg;
  int countDown = 4;
  Timer countDownTimer;
  
  String gameTimerMsg;
  int gameTime = 10;
  Timer gameTimer;
  
  @ViewChild('one') ElementRef green;
  @ViewChild('two') ElementRef red;
  @ViewChild('three') ElementRef yellow;
  @ViewChild('four') ElementRef blue;
  
  PlayComponent(this._routeParams, this._location) {}

  void ngOnInit() {
    name = _routeParams.get('name');

    socket = IO.io('http://localhost:3000');
    socket.on('connect', (_) {
      print('Socket connected (client)');

      // need to send something stupid initially so that it will keep listening
      socket.emit('stay awake');

      countDownTimer = new Timer.periodic(const Duration(seconds: 1), (Timer countDownTimer) {
        countDown--;
        timerMsg = countDown > 0 ? 'BEGIN IN ${countDown}' : 'GO!';

        if (countDown <= 0) {
          socket.emit('start game');
          countDownTimer.cancel();
          countDown = -1;
          
          gameTimer = new Timer.periodic(const Duration(seconds: 1), (Timer gameTimer) {
            gameTime--;
            gameTimerMsg = gameTime > 0 ? gameTime.toString() : 'END GAME';

            if (gameTime == 0) {
              print('game over');
              socket.emit('end game');
              gameTimer.cancel();
              
              //TODO: put score in leaders
              //TODO: sort them in leaderboard_service onInit
              //TODO: navigate to leaderboard, passing along name and score to display
            }
          });
        }
      });
    });

    socket.on('new color', (data) {
      print('new color: $data');
      HTML.Animation animation;
      switch (data) {
        case 1:
          animation = green.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
          break;
        case 2:
          animation = red.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
          break;
        case 3:
          animation = yellow.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
          break;
        case 4:
          animation = blue.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
          break;
      }
      animation.play();
    });

    socket.on('point', (_) => score++);

    socket.on('disconnected', (_) => print('Socket disconnected (client)'));
  }
  
  void ngAfterViewInit() {
//    socket.on('new color', (data) {
//      print('new color: $data');
//      //TODO: animate the corresponding square
//      HTML.Animation animation;
//      switch (data) {
//        case 1:
//          animation = green.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
//          break;
//        case 2:
//          animation = red.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
//          break;
//        case 3:
//          animation = yellow.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
//          break;
//        case 4:
//          animation = blue.nativeElement.animate([{"opacity": 75}, {"opacity": 0}], 200);
//          break;
//      }
//      animation.play();
//    });
//
//    socket.on('point', (_) => score++);
//
//    socket.on('disconnected', (_) => print('Socket disconnected (client)'));
  }

  void goBack() => _location.back();
}
