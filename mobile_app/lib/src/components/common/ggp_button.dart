import 'package:flutter/material.dart';

class GGPButton extends StatelessWidget {
  final VoidCallback onPressed;
  final String text;
  final bool isDisabled;

  const GGPButton(
      {super.key, required this.onPressed, required this.text, this.isDisabled = false});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isDisabled ?  Colors.grey : const Color(0xFFF07E28),
        minimumSize: const Size(double.infinity, 50),
      ),
      child: Text(
        text,
        style: const TextStyle(
            fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
