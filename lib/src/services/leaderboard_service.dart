import 'dart:convert';
import 'dart:html';

import 'package:angular2/core.dart';

import 'package:simon/src/models/leader.dart';

@Injectable()
class LeaderboardService {
  List<Leader> leaders = [];
  
  LeaderboardService() {
    HttpRequest.getString('assets/leaderboard.json').then((String fileContents) {
      print(fileContents);
      if (fileContents.isNotEmpty) {
        List<Map> jsonLeaders = JSON.decode(fileContents);
        for (Map leader in jsonLeaders) {
          leaders.add(new Leader.fromMap(leader));
        }
      }
    });
  }
  
  List<Map> getJSONLeaders() {
    List<Map> jsonLeaders = [];
    for (Leader leader in leaders) {
      jsonLeaders.add(leader.toMap());
    }
    
    return jsonLeaders;
  }
  
}