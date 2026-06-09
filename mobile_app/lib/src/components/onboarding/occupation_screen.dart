import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class OccupationSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;
  const OccupationSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _OccupationSelectionScreenState createState() =>
      _OccupationSelectionScreenState();
}

class _OccupationSelectionScreenState extends State<OccupationSelectionScreen> {
  // List of conditions
  final List<String> conditions = [
    "Homemaker",
    "Student",
    "Medical Professional",
    "IT Professional",
    "Sales & Marketing",
    "CEOs/Executive Leadership/Business Owner",
    "Finance & Banking",
    "Others",
  ];

  // String to track the selected condition
  String? selectedCondition;

  // Function to handle selection
  void handleSelection(String condition) {
    setState(() {
      if (selectedCondition == condition) {
        selectedCondition = null; // Deselect if the same condition is tapped
      } else {
        selectedCondition = condition; // Select new condition
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
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            StepProgressIndicator(
                currentStep: widget.currentStep, totalSteps: 9),
            const SizedBox(height: 32),
            const Text(
              'What\'s your occupation?',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: conditions.map((condition) {
                return GestureDetector(
                  onTap: () => handleSelection(condition),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: selectedCondition == condition
                            ? const Color(0xFFF07E28)
                            : Colors.grey,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          selectedCondition == condition
                              ? Icons.check_circle
                              : Icons.circle_outlined,
                          color: selectedCondition == condition
                              ? const Color(0xFFF07E28)
                              : Colors.grey,
                        ),
                        const SizedBox(width: 8),
                        Text(condition),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.only(bottom: 16.0),
              child: Text(
                AppStrings.occupationSelectionNote,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
            GGPButton(
                onPressed: () {
                  selectedCondition != null
                      ?
                  widget.moveNext(data: selectedCondition): null;
                },
                isDisabled: selectedCondition == null,
                text: AppStrings.continueButton)
          ],
        ),
      ),
    );
  }
}
