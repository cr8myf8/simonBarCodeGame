import 'package:angular2/core.dart';

import 'package:simon/src/models/leader.dart';

@Injectable()
class LeaderboardService {
//  TODO: this is filler data. Should be removed
  List<Leader> leaders = [
    new Leader('Candice', 10),
    new Leader('Scot', 20),
  ];
  
  LeaderboardService() {
  
  }
}