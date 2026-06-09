import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class GoalSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;

  const GoalSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _GoalSelectionScreenState createState() => _GoalSelectionScreenState();
}

class _GoalSelectionScreenState extends State<GoalSelectionScreen> {
  String? selectedGoal; // Move selectedGoal here

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> goals = [
      {"title": "Lose Weight", "image": "assets/images/weight_loss.png"},
      {"title": "Gain Weight", "image": "assets/images/weight_gain.png"},
      {"title": "Bodybuilding", "image": "assets/images/body_building.png"},
      {"title": "Stamina & Mobility", "image": "assets/images/stamina.png"},
      {"title": "Lifestyle Management", "image": "assets/images/lifestyle.png"},
      {
        "title": "Autoimmune Disease Management",
        "image": "assets/images/autoimmune_disease.png"
      },
    ];

    // Function to handle selection
    void handleSelection(String goal) {
      debugPrint('Selected goal: $goal');
      setState(() {
        if (selectedGoal == goal) {
          selectedGoal = null; // Deselect if the same goal is tapped
        } else {
          selectedGoal = goal; // Select new goal
        }
      });
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
             StepProgressIndicator(
                currentStep: widget.currentStep, totalSteps: 9),
            // Title Section
             const SizedBox(height: 32),
            const Text(
              'What is your goal?',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Select any one and proceed',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 24),

            // Goal Options Grid
            Expanded(
              child: GridView.builder(
                itemCount: goals.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 2 columns
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio:
                      2.5, // Adjusted aspect ratio for a wider layout
                ),
                itemBuilder: (context, index) {
                  final goal = goals[index];
                  return GestureDetector(
                    onTap: () {
                      handleSelection(goal['title']!);
                      print("Selected Goal: ${goal['title']}  $selectedGoal");
                      print(goal['title'] == selectedGoal);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.3),
                            spreadRadius: 3,
                            blurRadius: 5,
                            offset: const Offset(
                                0, 3), // changes position of shadow
                          ),
                        ],
                        border: selectedGoal == goal['title']
                            ? Border.all(
                                color: const Color(0xFFF07E28), width: 3)
                            : Border.all(color: Colors.grey.shade300, width: 1),
                      ),
                      child: Row(
                        children: [
                          // Text Section
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.only(left: 8.0),
                              child: Text(
                                goal['title']!,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ),
                          ),

                          // Image Section
                          Image.asset(
                            goal['image']!,
                            width: 60,
                            fit: BoxFit.cover,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // Continue Button
            GGPButton(
              onPressed: () {
                selectedGoal != null ?
                  widget.moveNext(data: selectedGoal):
                null;
              },
              isDisabled: selectedGoal == null,
              text: AppStrings.continueButton,
            )
          ],
        ),
      ),
    );
  }
}
