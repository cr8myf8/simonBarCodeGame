import 'package:angular2/core.dart';

import 'package:socket_io_client/socket_io_client.dart' as IO;

@Injectable()
class SocketService {

  SocketService() {
    print('initialize service');
    
//    socket.on('event', (data) => print(data));
//    socket.on('disconnect', (_) => print('disconnect'));
//    socket.on('fromServer', (_) => print(_));
  }
  
  void openSocket() {
    IO.Socket socket = IO.io('http://localhost:3000');
    socket.on('connected', (_) => print('connected'));
  }
}