// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.
import 'dart:async';

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
class PlayComponent implements OnInit {
  final RouteParams _routeParams;
  final Location _location;

  IO.Socket socket;
  String name;
  num score = 0;

  //  CountDown startCountdown = new CountDown(new Duration(seconds : 6));
  //  CountDown gameCountdown = new CountDown(new Duration(seconds: 10));
  //  var timer;
  //  StreamSubscription gameTimer;
  String timerMsg;
  int countDown = 4;
  Timer timer;

  PlayComponent(this._routeParams, this._location) {}

  void ngOnInit() {
    name = _routeParams.get('name');

    socket = IO.io('http://localhost:3000');
    socket.on('connect', (_) {
      print('Socket connected (client)');

      // need to send something stupid initially so that it will keep listening
      socket.emit('hello', 2);

      timer = new Timer.periodic(const Duration(seconds: 1), (Timer timer) {
        countDown--;
        timerMsg = countDown > 0 ? 'BEGIN IN ${countDown}' : 'GO!';

        if (countDown == 0) {
          socket.emit('start game');
          timer.cancel();
        }
      });
    });

    socket.on('new color', (data) {
      //TODO: animate the corresponding square
      print('new color: $data');
    });

    socket.on('point', (_) => score++);

    socket.on('disconnected', (_) => print('Socket disconnected (client)'));
  }

  void goBack() => _location.back();
}
