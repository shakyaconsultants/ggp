import 'package:flutter/material.dart';
import 'package:flutter_ruler_picker/flutter_ruler_picker.dart';
import 'package:flutter_switch/flutter_switch.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class HeightSelectionScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;

  const HeightSelectionScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _HeightSelectionScreenState createState() => _HeightSelectionScreenState();
}

class _HeightSelectionScreenState extends State<HeightSelectionScreen> {
  bool isFeet = false;
  num _currentValue = 160;

  late RulerPickerController _rulerPickerController;

  @override
  void initState() {
    super.initState();
    _rulerPickerController = RulerPickerController(value: isFeet ? 5 : 160);
  }

  final List<RulerRange> cmRanges = const [
    RulerRange(begin: 100, end: 200, scale: 0.1),
  ];

  final List<RulerRange> feetRanges = const [
    RulerRange(begin: 36, end: 96, scale: 0.0833),
  ];

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
                AppStrings.heightSelectionTitle,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              _buildToggleButton(),
              const SizedBox(height: 160),
              Center(
                child: Stack(
                  alignment: Alignment.centerRight,
                  children: [
                    Transform.rotate(
                      angle: -3.14159 / 2,
                      child: _buildRuler(),
                    ),
                    Positioned(
                      left: isFeet ? 20 : 15,
                      child: Text(
                        _formatValue(_currentValue),
                        style: const TextStyle(
                          fontSize: 20,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GGPButton(
                  onPressed: () {
                    widget.moveNext(data: _formatValue(_currentValue));
                  },
                  text: AppStrings.continueButton)
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToggleButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildToggleText('cm', !isFeet),
          const SizedBox(width: 10),
          FlutterSwitch(
            value: isFeet,
            onToggle: _handleUnitToggle,
            activeColor: const Color(0xFFF07E28),
            inactiveColor: Colors.grey,
          ),
          const SizedBox(width: 10),
          _buildToggleText('feet', isFeet),
        ],
      ),
    );
  }

  String _formatValue(num value) {
    if (isFeet) {
      // Convert value from inches to feet and inches
      int feet = (value ~/ 12);
      int inches = (value % 12).toInt();
      return '$feet\' $inches"';
    } else {
      // For cm, just format with one decimal place
      return '${value.toStringAsFixed(1)} cm';
    }
  }

  Widget _buildToggleText(String text, bool isActive) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 16,
        color: isActive ? Colors.black : Colors.grey,
      ),
    );
  }

  void _handleUnitToggle(bool value) {
    setState(() {
      isFeet = value;
      _currentValue = _convertHeight(_currentValue, isFeet);
      // Reset the RulerPickerController to reflect new ranges and value
      _rulerPickerController.dispose();
      _rulerPickerController = RulerPickerController(value: _currentValue);
    });
  }

  double _convertHeight(num value, bool toFeet) {
    return toFeet ? value / 30.48 : value * 30.48;
  }

  Widget _buildRuler() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 150,
        width: 450,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.white,
        ),
        child: RulerPicker(
          rulerBackgroundColor: Colors.white,
          controller: _rulerPickerController,
          onBuildRulerScaleText: (index, value) {
            // Display inches for feet
            if (isFeet) {
              return "";
            } else {
              // Display cm values directly
              return value.toInt().toString();
            }
          },
          ranges: isFeet ? feetRanges : cmRanges,
          scaleLineStyleList: const [
            ScaleLineStyle(
              color: Colors.grey,
              width: 1.5,
              height: 30,
              scale: 0,
            ),
            ScaleLineStyle(
              color: Colors.grey,
              width: 1,
              height: 25,
              scale: 1,
            ),
            ScaleLineStyle(
              color: Colors.grey,
              width: 1,
              height: 15,
              scale: 5,
            ),
          ],
          onValueChanged: (value) {
            setState(() {
              _currentValue = value;
            });
          },
          width: 450,
          height: 150,
          marker: Container(
            width: 2,
            height: 60,
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(5),
            ),
          ),
        ),
      ),
    );
  }
}
