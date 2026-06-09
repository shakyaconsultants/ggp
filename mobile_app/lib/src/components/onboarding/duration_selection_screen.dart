// gender_selection_screen.dart
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/menu_option.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class DurationSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;
  const DurationSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  // ignore: library_private_types_in_public_api
  _DurationSelectionScreenState createState() =>
      _DurationSelectionScreenState();
}

class _DurationSelectionScreenState extends State<DurationSelectionScreen> {
  String? _selectedDuration;

  void _selectDuration(String gender) {
    setState(() {
      _selectedDuration = gender;
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
                AppStrings.durationSelectionTitle,
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
                label: AppStrings.duration[1],
                isSelected: _selectedDuration == AppStrings.duration[1],
                onTap: () => _selectDuration(AppStrings.duration[1]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.duration[2],
                isSelected: _selectedDuration == AppStrings.duration[2],
                onTap: () => _selectDuration(AppStrings.duration[2]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.duration[3],
                isSelected: _selectedDuration == AppStrings.duration[3],
                onTap: () => _selectDuration(AppStrings.duration[3]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.duration[4],
                isSelected: _selectedDuration == AppStrings.duration[4],
                onTap: () => _selectDuration(AppStrings.duration[4]),
              ),
              const SizedBox(height: 16),
              MenuOption(
                iconSize: 20,
                emoji: '👨',
                label: AppStrings.duration[5],
                isSelected: _selectedDuration == AppStrings.duration[5],
                onTap: () => _selectDuration(AppStrings.duration[5]),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Text(
                  AppStrings.durationSelectionNote,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey[600]),
                ),
              ),
              const Spacer(),
              GGPButton(
                  onPressed: () { 
                    _selectedDuration != null
                        ?
                    widget.moveNext(data: _selectedDuration) : null;
                  },
                  isDisabled: _selectedDuration == null,
                  text: AppStrings.continueButton)
            ],
          ),
        ),
      ),
    );
  }
}
