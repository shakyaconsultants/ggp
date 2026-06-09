import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

class CallPage extends StatefulWidget {
  final String callId;
  final String? userID;
  final String? userName;

  const CallPage({
    super.key,
    required this.callId,
    this.userID,
    this.userName,
  });

  @override
  State<CallPage> createState() => _CallPageState();
}

class _CallPageState extends State<CallPage> {
  WebViewController? _controller;
  bool _loading = true;
  String? _error;
  bool _openedInBrowser = false;

  bool get _useExternalBrowser => !kIsWeb && Platform.isWindows;

  @override
  void initState() {
    super.initState();
    _loadCall();
  }

  Future<void> _loadCall() async {
    final info = await ClientApiService.fetchCallJoinInfo(widget.callId);
    if (!mounted) return;

    if (info == null || info['meet_url'] == null) {
      setState(() {
        _loading = false;
        _error = info?['join_window_message']?.toString() ??
            info?['error']?.toString() ??
            'Could not join this call. Check your booking and try again.';
      });
      return;
    }

    final meetUrl = info['meet_url'].toString();

    if (_useExternalBrowser) {
      final uri = Uri.parse(meetUrl);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!mounted) return;

      setState(() {
        _loading = false;
        _openedInBrowser = launched;
        _error = launched
            ? null
            : 'Could not open your browser. Copy the link from your nutritionist portal.';
      });
      return;
    }

    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..loadRequest(Uri.parse(meetUrl));

    setState(() {
      _controller = controller;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.userName != null && widget.userName!.isNotEmpty
              ? 'Call with ${widget.userName}'
              : 'Video Call',
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFFF07E28)),
            )
          : _openedInBrowser
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.open_in_browser,
                            size: 72, color: Color(0xFFF07E28)),
                        const SizedBox(height: 16),
                        const Text(
                          'Your video call opened in the browser.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF07E28),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Done'),
                        ),
                      ],
                    ),
                  ),
                )
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.videocam_off_outlined,
                            size: 72, color: Color(0xFFF07E28)),
                        const SizedBox(height: 16),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFF07E28),
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Go back'),
                        ),
                      ],
                    ),
                  ),
                )
              : _controller == null
                  ? const SizedBox.shrink()
                  : WebViewWidget(controller: _controller!),
    );
  }
}
