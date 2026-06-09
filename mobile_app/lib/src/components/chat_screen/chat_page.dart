import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:good_gut/src/services/chat_service.dart';

class ChatPage extends StatefulWidget {
  final String nutritionistName;
  final String nutritionistSpecialty;

  const ChatPage({
    super.key,
    this.nutritionistName = 'Your nutritionist',
    this.nutritionistSpecialty = '',
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _chatService = ChatService();
  final _user = const types.User(id: 'client');
  late final types.User _nutritionistUser;

  List<types.Message> _messages = [];
  bool _loading = true;
  bool _connected = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nutritionistUser = types.User(
      id: 'nutritionist',
      firstName: widget.nutritionistName,
    );
    _bootstrap();
  }

  @override
  void dispose() {
    _chatService.disconnect();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final raw = await ChatService.fetchMessages();
      await ChatService.markReadRest();
      if (!mounted) return;
      setState(() {
        _messages = _mapApiMessages(raw);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Could not load messages';
      });
    }

    await _chatService.connect(
      onConnected: () {
        if (!mounted) return;
        setState(() => _connected = true);
      },
      onMessage: _onIncomingMessage,
      onReadReceipt: _onReadReceipt,
      onError: (message) {
        if (!mounted) return;
        setState(() => _error = message);
      },
    );
  }

  void _onIncomingMessage(Map<String, dynamic> message) {
    setState(() {
      _messages = _upsertApiMessage(_messages, message);
    });
  }

  void _onReadReceipt(List<Map<String, dynamic>> receipts) {
    setState(() {
      _messages = _applyReadReceipts(_messages, receipts);
    });
  }

  List<types.Message> _mapApiMessages(List<Map<String, dynamic>> raw) {
    final sorted = [...raw]..sort((a, b) {
        final ad = DateTime.tryParse(a['created_at']?.toString() ?? '') ??
            DateTime.fromMillisecondsSinceEpoch(0);
        final bd = DateTime.tryParse(b['created_at']?.toString() ?? '') ??
            DateTime.fromMillisecondsSinceEpoch(0);
        return bd.compareTo(ad);
      });
    return sorted.map(_toChatMessage).toList();
  }

  List<types.Message> _upsertApiMessage(
    List<types.Message> current,
    Map<String, dynamic> apiMessage,
  ) {
    final mapped = _toChatMessage(apiMessage);
    final without = current.where((m) => m.id != mapped.id).toList();
    return [mapped, ...without];
  }

  List<types.Message> _applyReadReceipts(
    List<types.Message> current,
    List<Map<String, dynamic>> receipts,
  ) {
    final byId = {for (final r in receipts) r['id'].toString(): r};
    return current.map((message) {
      final patch = byId[message.id];
      if (patch == null || message is! types.TextMessage) return message;
      final readAt = patch['read_by_nutritionist_at'];
      if (readAt == null) return message;
      return message.copyWith(status: types.Status.seen);
    }).toList();
  }

  types.Message _toChatMessage(Map<String, dynamic> apiMessage) {
    final senderType = apiMessage['sender_type']?.toString();
    final isClient = senderType == 'client';
    final createdAt = DateTime.tryParse(apiMessage['created_at']?.toString() ?? '') ??
        DateTime.now();

    types.Status? status;
    if (isClient) {
      status = apiMessage['read_by_nutritionist_at'] != null
          ? types.Status.seen
          : types.Status.sent;
    }

    return types.TextMessage(
      author: isClient ? _user : _nutritionistUser,
      createdAt: createdAt.millisecondsSinceEpoch,
      id: apiMessage['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      text: apiMessage['body']?.toString() ?? '',
      status: status,
    );
  }

  Future<void> _handleSendPressed(types.PartialText message) async {
    final text = message.text.trim();
    if (text.isEmpty) return;

    try {
      if (_connected) {
        _chatService.send(text);
      } else {
        final saved = await ChatService.sendMessageRest(text);
        if (saved != null) {
          setState(() {
            _messages = _upsertApiMessage(_messages, saved);
          });
        }
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send message')),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios),
            onPressed: () => Navigator.pop(context),
          ),
          centerTitle: true,
          backgroundColor: Colors.white,
          title: Text(widget.nutritionistName),
          titleTextStyle: const TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Text(
                  _connected ? 'Live' : '…',
                  style: TextStyle(
                    color: _connected ? Colors.green.shade700 : Colors.grey,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
        body: Column(
          children: [
            if (_error != null)
              Container(
                width: double.infinity,
                color: const Color(0xFFFEE2E2),
                padding: const EdgeInsets.all(10),
                child: Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 13),
                ),
              ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : Chat(
                      messages: _messages,
                      onAttachmentPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Attachments coming soon'),
                          ),
                        );
                      },
                      onMessageTap: (_, __) {},
                      onPreviewDataFetched: (_, __) {},
                      onSendPressed: _handleSendPressed,
                      showUserAvatars: true,
                      showUserNames: true,
                      user: _user,
                    ),
            ),
          ],
        ),
      );
}
