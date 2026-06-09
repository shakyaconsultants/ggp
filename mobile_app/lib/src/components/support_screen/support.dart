import 'package:flutter/material.dart';

class SupportSection extends StatefulWidget {
  const SupportSection({super.key});

  @override
  _SupportSectionState createState() => _SupportSectionState();
}

class _SupportSectionState extends State<SupportSection> {
  @override
  Widget build(BuildContext context) {
    return const SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          children: [Text("Support")],
        ),
      ),
    );
  }
}
