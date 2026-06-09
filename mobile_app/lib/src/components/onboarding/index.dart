import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home_screen.dart';
import 'package:good_gut/src/components/onboarding/dob_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/duration_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/food_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/gender_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/goal_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/height_selection_screen.dart';
import 'package:good_gut/src/components/onboarding/medical_screen.dart';
import 'package:good_gut/src/components/onboarding/occupation_screen.dart';
import 'package:good_gut/src/components/onboarding/weight_selection_screen.dart';
import 'package:good_gut/src/utils/api_util.dart';
import 'package:good_gut/src/utils/app_utils.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({super.key});

  @override
  _OnboardingFlowState createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<String> _onboardingData = [
    'onboarded',
    'gender',
    'dob',
    'height',
    'weight',
    'medical',
    'workout',
    'food',
    'occupation',
    'goal'
  ];

  List<Widget> _onboardingScreens = [];

  void _nextPage({dynamic data}) async {
    try {
      if (_currentPage == 3 && data is List && data.length == 2) {
        await _updateStatus("targetWeight", data[1]);
        await _updateStatus(_onboardingData[_currentPage + 1], data[0]);
      } else if (_currentPage < _onboardingScreens.length) {
        String key = _onboardingData[_currentPage + 1];
        await _updateStatus(key, data);
      }

      if (_currentPage < _onboardingScreens.length - 1) {
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.ease,
        );
      } else {
        Navigator.pushReplacement(
          context,
          SlideInRouter(screen: const HomeScreen()),
        );
      }
    } catch (e) {
      Apputils.showErrorMessage(
          context, 'Failed to update status. Please try again.');
    }
  }

  Future<void> _updateStatus(String key, dynamic value) async {
    await ApiUtil.makeApiCall(
        endpoint: "/userdata", method: "POST", payload: {key: value});
  }

  @override
  void initState() {
    super.initState();
     _updateStatus(_onboardingData[0], 1);
    _onboardingScreens = [
      GenderSelectionScreen(moveNext: _nextPage, currentStep: 1),
      DateOfBirthScreen(moveNext: _nextPage, currentStep: 2),
      HeightSelectionScreen(moveNext: _nextPage, currentStep: 3),
      WeightScreen(moveNext: _nextPage, currentStep: 4),
      MedicalConditionScreen(moveNext: _nextPage, currentStep: 5),
      DurationSelectionScreen(moveNext: _nextPage, currentStep: 6),
      FoodSelectionScreen(moveNext: _nextPage, currentStep: 7),
      OccupationSelectionScreen(moveNext: _nextPage, currentStep: 8),
      GoalSelectionScreen(moveNext: _nextPage, currentStep: 9)
    ];
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.ease,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        leading: Visibility(
          visible: _currentPage > 0,
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: _previousPage,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              if (_currentPage < _onboardingScreens.length - 1) {
                _nextPage();
              } else {
                Navigator.pushReplacement(
                  context,
                  SlideInRouter(screen: const HomeScreen()),
                );
                print('Onboarding completed');
              }
            },
            child: const Text(
              'Skip',
              style: TextStyle(color: Colors.black),
            ),
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _currentPage = index;
          });
        },
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _onboardingScreens.length,
        itemBuilder: (context, index) {
          return _onboardingScreens[index];
        },
      ),
    );
  }
}
