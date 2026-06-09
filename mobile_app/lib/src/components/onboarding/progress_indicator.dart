// progress_indicator.dart
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';

class StepProgressIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;

  const StepProgressIndicator({
    super.key,
    required this.currentStep,
    required this.totalSteps,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('${AppStrings.stepIndicator} $currentStep/$totalSteps'),
        const SizedBox(width: 10),
        Expanded(
          child: LinearProgressIndicator(
            minHeight: 10,
            borderRadius: BorderRadius.circular(10),
            value: currentStep / totalSteps,
            backgroundColor: Colors.grey[200],
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFF07E28)),
          ),
        ),
      ],
    );
  }
}
