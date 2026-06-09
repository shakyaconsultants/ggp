import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class MedicalConditionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;
  const MedicalConditionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _MedicalConditionScreenState createState() => _MedicalConditionScreenState();
}

class _MedicalConditionScreenState extends State<MedicalConditionScreen> {
  // List of conditions
  final List<String> conditions = [
    "Diabetes",
    "Pre-Diabetes",
    "Cholesterol",
    "Hypertension",
    "PCOS",
    "Thyroid",
    "Physical Injury",
    "Excessive stress/anxiety",
    "Sleep issues",
    "Depression",
    "Anger issues",
    "Loneliness",
    "Relationship stress"
  ];

  // Set to track selected conditions
  Set<String> selectedConditions = {"None"};
  bool noneSelected = true;

  // Function to handle selection
  void handleSelection(String condition) {
    setState(() {
      if (condition == "None") {
        noneSelected = !noneSelected;
        selectedConditions.clear();
      } else {
        if (noneSelected) noneSelected = false;
        if (selectedConditions.contains(condition)) {
          selectedConditions.remove(condition);
        } else {
          selectedConditions.add(condition);
        }
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
          children: [
            StepProgressIndicator(
                currentStep: widget.currentStep, totalSteps: 9),
            const SizedBox(height: 32),
            const Text(
              'Any Medical Condition we should be aware of?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            GestureDetector(
              onTap: () => handleSelection("None"),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: noneSelected ? const Color(0xFFF07E28) : Colors.grey,
                  ),
                ),
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Icon(
                      noneSelected ? Icons.check_circle : Icons.circle_outlined,
                      color:
                          noneSelected ? const Color(0xFFF07E28) : Colors.grey,
                    ),
                    const SizedBox(width: 8),
                    const Text("None"),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),
            // Multi-select grid for diseases
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
                        color: selectedConditions.contains(condition)
                            ? const Color(0xFFF07E28)
                            : Colors.grey,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          selectedConditions.contains(condition)
                              ? Icons.check_circle
                              : Icons.circle_outlined,
                          color: selectedConditions.contains(condition)
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
                AppStrings.medicalSelectionNote,
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[600]),
              ),
            ),
            GGPButton(
                onPressed: () {
                  widget.moveNext(data: selectedConditions.toList().join(", "));
                },
                text: AppStrings.continueButton)
          ],
        ),
      ),
    );
  }
}
