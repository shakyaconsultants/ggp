import 'dart:async';
import 'dart:convert';

import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/utils/api_util.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

typedef ChatMessageHandler = void Function(Map<String, dynamic> message);
typedef ChatReadReceiptHandler = void Function(List<Map<String, dynamic>> receipts);
typedef ChatErrorHandler = void Function(String message);

class ChatService {
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;

  static String get wsUrl {
    final uri = Uri.parse(AppStrings.apiURL);
    final scheme = uri.scheme == 'https' ? 'wss' : 'ws';
    final defaultPort = uri.scheme == 'https' ? 443 : 80;
    final portSuffix =
        uri.hasPort && uri.port != defaultPort ? ':${uri.port}' : '';
    return '$scheme://${uri.host}$portSuffix/ws/chat';
  }

  static Future<List<Map<String, dynamic>>> fetchMessages() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/chat/messages',
      method: 'GET',
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      final messages = (response['data'] as Map)['messages'];
      if (messages is List) {
        return messages
            .whereType<Map>()
            .map((m) => Map<String, dynamic>.from(m))
            .toList();
      }
    }
    return [];
  }

  static Future<Map<String, dynamic>?> sendMessageRest(String body) async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/chat/messages',
      method: 'POST',
      payload: {'body': body},
    );

    if (response['statusCode'] == 201 && response['data'] is Map) {
      final message = (response['data'] as Map)['message'];
      if (message is Map) {
        return Map<String, dynamic>.from(message);
      }
    }
    return null;
  }

  static Future<List<Map<String, dynamic>>> markReadRest() async {
    final response = await ApiUtil.makeApiCall(
      endpoint: '/client/chat/read',
      method: 'POST',
      payload: {},
    );

    if (response['statusCode'] == 200 && response['data'] is Map) {
      final receipts = (response['data'] as Map)['receipts'];
      if (receipts is List) {
        return receipts
            .whereType<Map>()
            .map((r) => Map<String, dynamic>.from(r))
            .toList();
      }
    }
    return [];
  }

  Future<void> connect({
    required void Function() onConnected,
    required ChatMessageHandler onMessage,
    required ChatReadReceiptHandler onReadReceipt,
    required ChatErrorHandler onError,
  }) async {
    await disconnect();

    final token = await ApiUtil.getAuthToken();
    if (token == null || token.isEmpty) {
      onError('Not logged in');
      return;
    }

    _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
    _subscription = _channel!.stream.listen(
      (event) {
        try {
          final data = jsonDecode(event as String) as Map<String, dynamic>;
          final type = data['type']?.toString();

          if (type == 'auth_ok') {
            onConnected();
            _channel?.sink.add(jsonEncode({'type': 'read'}));
            return;
          }

          if (type == 'message' && data['message'] is Map) {
            onMessage(Map<String, dynamic>.from(data['message'] as Map));
            _channel?.sink.add(jsonEncode({'type': 'read'}));
            return;
          }

          if (type == 'read_receipt' && data['receipts'] is List) {
            final receipts = (data['receipts'] as List)
                .whereType<Map>()
                .map((r) => Map<String, dynamic>.from(r))
                .toList();
            onReadReceipt(receipts);
            return;
          }

          if (type == 'error') {
            onError(data['message']?.toString() ?? 'Chat error');
          }
        } catch (_) {
          onError('Invalid chat response');
        }
      },
      onError: (_) => onError('Connection error'),
    );

    _channel!.sink.add(jsonEncode({
      'type': 'auth',
      'role': 'client',
      'token': token,
    }));
  }

  void send(String text) {
    _channel?.sink.add(jsonEncode({'type': 'send', 'text': text}));
  }

  void markRead() {
    _channel?.sink.add(jsonEncode({'type': 'read'}));
  }

  Future<void> disconnect() async {
    await _subscription?.cancel();
    _subscription = null;
    await _channel?.sink.close();
    _channel = null;
  }
}
