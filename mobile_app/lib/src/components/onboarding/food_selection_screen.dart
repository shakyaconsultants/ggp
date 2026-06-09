// gender_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/menu_option.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class FoodSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;

  const FoodSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  // ignore: library_private_types_in_public_api
  _FoodSelectionScreenState createState() => _FoodSelectionScreenState();
}

class _FoodSelectionScreenState extends State<FoodSelectionScreen> {
  String? _selectedFood;

  void _selectFood(String gender) {
    setState(() {
      _selectedFood = gender;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              StepProgressIndicator(
                  currentStep: widget.currentStep, totalSteps: 9),
              const SizedBox(height: 32),
              const Text(
                AppStrings.foodSelectionTitle,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.food[1],
                isSelected: _selectedFood == AppStrings.food[1],
                onTap: () => _selectFood(AppStrings.food[1]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.food[2],
                isSelected: _selectedFood == AppStrings.food[2],
                onTap: () => _selectFood(AppStrings.food[2]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.food[3],
                isSelected: _selectedFood == AppStrings.food[3],
                onTap: () => _selectFood(AppStrings.food[3]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.food[4],
                isSelected: _selectedFood == AppStrings.food[4],
                onTap: () => _selectFood(AppStrings.food[4]),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Text(
                  AppStrings.foodSelectionNote,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
              GGPButton(
                  onPressed: () {
                    _selectedFood != null
                        ? widget.moveNext(data: _selectedFood)
                        : null;
                  },
                  isDisabled: _selectedFood == null,
                  text: AppStrings.continueButton)
            ],
          ),
        ),
      ),
    );
  }
}
