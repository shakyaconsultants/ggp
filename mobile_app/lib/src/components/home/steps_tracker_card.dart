import 'package:flutter/material.dart';

class StepsTrackerCard extends StatelessWidget {
  final String title;
  final String subTitle;
  final int steps;

  const StepsTrackerCard({
    super.key,
    required this.title,
    required this.subTitle,
    this.steps = 0,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        double width = constraints.maxWidth;
        return SizedBox(
          width: width,
          height: width,
          child: Card(
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: Colors.grey, width: 0.2),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Image(
                    image: AssetImage('assets/images/steps.png'),
                    width: 40,
                    height: 40,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.black),
                    textAlign: TextAlign.center,
                  ),
                  Text(
                    subTitle,
                    style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.normal,
                        color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  if (steps > 0) ...[
                    const SizedBox(height: 8),
                    Text(
                      '$steps',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF486A21),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
