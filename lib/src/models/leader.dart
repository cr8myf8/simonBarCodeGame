class Leader {
  final String name;
  final num score;
  
  Leader(this.name, this.score);
  
  Leader.fromMap(Map map) : this(map['name'], map['score']);
  
  Map toMap() {
    return {
      'name': name,
      'score': score.toString()
    };
  }
}