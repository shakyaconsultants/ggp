import 'package:flutter/material.dart';

class StepIndicator extends StatelessWidget {
  final int currentStep;

  const StepIndicator({super.key, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStepIndicator(context, "1", "Address", currentStep >= 1),
            _buildSeparator(),
            _buildStepIndicator(
                context, "2", "Order Summary", currentStep >= 2),
            _buildSeparator(),
            _buildStepIndicator(context, "3", "Payment", currentStep >= 3),
          ],
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildStepIndicator(
      BuildContext context, String stepNumber, String label, bool isActive) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: isActive ? Theme.of(context).colorScheme.primary : Colors.grey[300],
          radius: 15,
          child: Text(
            stepNumber,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? Colors.black : Colors.grey,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildSeparator() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      height: 1,
      width: 30,
      color: Colors.grey[300],
    );
  }
}
