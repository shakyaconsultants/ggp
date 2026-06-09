import 'package:flutter/material.dart';

class WaterIntakeCard extends StatelessWidget {
  final int currentWaterIntake;
  final int totalWaterGoal;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;

  const WaterIntakeCard({
    super.key,
    required this.currentWaterIntake,
    required this.totalWaterGoal,
    required this.onIncrease,
    required this.onDecrease,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    GestureDetector(
                      onTap: onDecrease,
                      child:
                          const Icon(Icons.remove_circle, color: Colors.black),
                    ),
                    const SizedBox(width: 8),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 55,
                          height: 55,
                          child: CircularProgressIndicator(
                            value: currentWaterIntake / totalWaterGoal,
                            strokeWidth: 3,
                            backgroundColor: Colors.grey.shade300,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(0xFF4D6932)),
                          ),
                        ),
                        const Icon(Icons.local_drink,
                            size: 24, color: Color(0xFF4D6932)),
                      ],
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: onIncrease,
                      child: const Icon(Icons.add_circle, color: Colors.black),
                    ),
                  ],
                ),
                const SizedBox(
                    height: 16), // This should create the desired space
                Text(
                  '$currentWaterIntake of $totalWaterGoal',
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.black),
                  textAlign: TextAlign.center,
                ),
                const Text(
                  'Glasses',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.normal,
                      color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
