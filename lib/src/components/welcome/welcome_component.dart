// Copyright (c) 2017, candice. All rights reserved. Use of this source code
// is governed by a BSD-style license that can be found in the LICENSE file.

import 'dart:html';

import 'package:angular2/angular2.dart';
import 'package:angular_components/angular_components.dart';
import 'package:angular2/router.dart';

@Component(
  selector: 'welcome',
  styleUrls: const ['welcome_component.css'],
  templateUrl: 'welcome_component.html',
  directives: const [
    CORE_DIRECTIVES,
    MaterialInputComponent,
    MaterialMultilineInputComponent,
    materialDirectives,
  ],
  providers: const [materialProviders]
)
class WelcomeComponent implements OnInit {
  final Router _router;
  String name = "";
  
  WelcomeComponent(this._router) {}
  
  void ngOnInit() {
    Element nameInput = querySelector('#nameInput');
    nameInput.focus();
  }
  
  void play() {
    _router.navigate(['Play', {'name': name}]);
  }

  void scores() {
    _router.navigate(['Leaderboard']);
  }
}
