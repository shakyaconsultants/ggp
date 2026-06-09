import 'package:flutter/material.dart';

class ComingSoonBanner extends StatelessWidget {
  final String message;

  const ComingSoonBanner({
    super.key,
    this.message = 'Online checkout and order history are coming soon.',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFDEED7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFF07E28), width: 0.4),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Color(0xFFF07E28)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(fontSize: 14, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}
