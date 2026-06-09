import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class WeightScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;
  const WeightScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _WeightScreenState createState() => _WeightScreenState();
}

class _WeightScreenState extends State<WeightScreen> {
  double currentWeight = 65; // Initial weight in kg
  double targetWeight = 65; // Initial target weight in kg
  bool isKg = true; // Unit of measurement

  // Conversion factors
  static const double kgToLbsFactor = 2.20462;
  static const double lbsToKgFactor = 0.453592;

  double get minWeight => isKg ? 25 : 55.11; // Min weight in kg or lbs
  double get maxWeight => isKg ? 200 : 440.9; // Max weight in kg or lbs

  void _toggleUnit(bool value) {
    setState(() {
      isKg = !value;
      // Convert weights when the unit is toggled
      if (isKg) {
        currentWeight *= lbsToKgFactor;
        targetWeight *= lbsToKgFactor;
      } else {
        currentWeight *= kgToLbsFactor;
        targetWeight *= kgToLbsFactor;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            StepProgressIndicator(
                currentStep: widget.currentStep, totalSteps: 9),
            const SizedBox(height: 32),
            const Text(
              'What is your current weight?',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 16),
            Text(
              '${currentWeight.round()} ${isKg ? "kg" : "lbs"}',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("kg"),
                Switch(
                  activeColor: const Color(0xFFF07E28),
                  value: !isKg,
                  onChanged: _toggleUnit,
                ),
                const Text("lbs"),
              ],
            ),
            const SizedBox(height: 16),
            Slider(
              activeColor: const Color(0xFFF07E28),
              value: currentWeight,
              min: minWeight,
              max: maxWeight,
              divisions: isKg ? 175 : 385,
              label: currentWeight.round().toString(),
              onChanged: (double value) {
                setState(() {
                  currentWeight = value;
                });
              },
            ),
            const SizedBox(height: 16),
            const Text(
              'What is your target weight?',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 16),
            Text(
              '${targetWeight.round()} ${isKg ? "kg" : "lbs"}',
              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Slider(
              activeColor: const Color(0xFFF07E28),
              value: targetWeight,
              min: minWeight,
              max: maxWeight,
              divisions: isKg ? 175 : 385,
              label: targetWeight.round().toString(),
              onChanged: (double value) {
                setState(() {
                  targetWeight = value;
                });
              },
            ),
            const Spacer(),
            GGPButton(
                onPressed: () {
                  widget.moveNext(data: [currentWeight, targetWeight]);
                },
                text: AppStrings.continueButton)
          ],
        ),
      ),
    );
  }
}
