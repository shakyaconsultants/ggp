// gender_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/menu_option.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class GenderSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;
  const GenderSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  // ignore: library_private_types_in_public_api
  _GenderSelectionScreenState createState() => _GenderSelectionScreenState();
}

class _GenderSelectionScreenState extends State<GenderSelectionScreen> {
  String? _selectedGender;

  void _selectGender(String gender) {
    setState(() {
      _selectedGender = gender;
    });
  }

  @override
  Widget build(BuildContext context) {
    print(_selectedGender);
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
                AppStrings.genderSelectionTitle,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              MenuOption(
                iconSize: 40,
                emoji: '👩‍🦳',
                label: AppStrings.femaleLabel,
                isSelected: _selectedGender == AppStrings.femaleLabel,
                onTap: () => _selectGender(AppStrings.femaleLabel),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 40,
                emoji: '👨',
                label: AppStrings.maleLabel,
                isSelected: _selectedGender == AppStrings.maleLabel,
                onTap: () => _selectGender(AppStrings.maleLabel),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Text(
                  AppStrings.genderSelectionNote,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
              GGPButton(
                  onPressed: () {
                    _selectedGender == null
                        ? null
                        : widget.moveNext(data: _selectedGender);
                  },
                  isDisabled: _selectedGender == null,
                  text: AppStrings.continueButton)
            ],
          ),
        ),
      ),
    );
  }
}
