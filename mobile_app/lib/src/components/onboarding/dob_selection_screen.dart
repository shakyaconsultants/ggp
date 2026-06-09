import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/components/common/ggp_button.dart';
import 'package:good_gut/src/components/onboarding/progress_indicator.dart';

class DateOfBirthScreen extends StatefulWidget {
  final Function({dynamic data}) moveNext;
  final int currentStep;

  const DateOfBirthScreen(
      {super.key, required this.moveNext, required this.currentStep});

  @override
  _DateOfBirthScreenState createState() => _DateOfBirthScreenState();
}

class _DateOfBirthScreenState extends State<DateOfBirthScreen> {
  int selectedYearIndex = 40; // Initial index of the year in the picker
  int selectedMonthIndex = 7; // Initial index of the month in the picker
  int selectedDayIndex = 2; // Initial index of the day in the picker

  // Dynamic year, month, and day lists
  List<int> years =
      List<int>.generate(70, (index) => 1955 + index); // From 1920 to 2019
  List<String> months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  int getDaysInMonth(int year, int month) {
    // Ensure month is between 1 and 12
    if (month < 1 || month > 12) {
      return 0;
    }

    // Month is 1-indexed (1 for January, 2 for February, etc.)
    return DateTime(year, month + 1, 0).day;
  }

  // Method to get the days list based on the selected year and month
  List<int> getDaysList(int year, int month) {
    int daysInMonth = getDaysInMonth(year, month + 1); // month is 0-indexed
    return List<int>.generate(daysInMonth, (index) => index + 1);
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
                  'What is your date of birth?',
                  style: TextStyle(fontSize: 20),
                  textAlign: TextAlign.center,
                ),

                // Display the selected date in bold
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    '${getDaysList(years[selectedYearIndex], selectedMonthIndex)[selectedDayIndex]} ${months[selectedMonthIndex]} ${years[selectedYearIndex]}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),

                SizedBox(
                  height: 300,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Year Picker
                      Expanded(
                        child: CupertinoPicker(
                          itemExtent: 60.0, // Height of each item
                          scrollController: FixedExtentScrollController(
                              initialItem: selectedYearIndex),
                          onSelectedItemChanged: (int index) {
                            setState(() {
                              selectedYearIndex = index;
                              // Reset the selected day index if it's out of bounds
                              if (selectedDayIndex >=
                                  getDaysList(years[selectedYearIndex],
                                          selectedMonthIndex)
                                      .length) {
                                selectedDayIndex = getDaysList(
                                            years[selectedYearIndex],
                                            selectedMonthIndex)
                                        .length -
                                    1;
                              }
                            });
                          },
                          children: years.map((int year) {
                            return Center(child: Text(year.toString()));
                          }).toList(),
                        ),
                      ),

                      // Month Picker
                      Expanded(
                        child: CupertinoPicker(
                          itemExtent: 60.0,
                          scrollController: FixedExtentScrollController(
                              initialItem: selectedMonthIndex),
                          onSelectedItemChanged: (int index) {
                            setState(() {
                              selectedMonthIndex = index;
                              // Reset the selected day index if it's out of bounds
                              if (selectedDayIndex >=
                                  getDaysList(years[selectedYearIndex],
                                          selectedMonthIndex)
                                      .length) {
                                selectedDayIndex = getDaysList(
                                            years[selectedYearIndex],
                                            selectedMonthIndex)
                                        .length -
                                    1;
                              }
                            });
                          },
                          children: months.map((String month) {
                            return Center(child: Text(month));
                          }).toList(),
                        ),
                      ),

                      // Day Picker
                      Expanded(
                        child: CupertinoPicker(
                          itemExtent: 60.0,
                          scrollController: FixedExtentScrollController(
                              initialItem: selectedDayIndex),
                          onSelectedItemChanged: (int index) {
                            setState(() {
                              selectedDayIndex = index;
                            });
                          },
                          children: getDaysList(
                                  years[selectedYearIndex], selectedMonthIndex)
                              .map((int day) {
                            return Center(child: Text(day.toString()));
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                GGPButton(
                    onPressed: () {
                      final day = getDaysList(
                          years[selectedYearIndex], selectedMonthIndex)[selectedDayIndex];
                      final month = selectedMonthIndex + 1;
                      final year = years[selectedYearIndex];
                      final isoDate =
                          '${year.toString().padLeft(4, '0')}-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
                      debugPrint('Selected Date of Birth: $isoDate');
                      widget.moveNext(data: isoDate);
                    },
                    text: AppStrings.continueButton)
              ],
            ),
          ),
        ));
  }
}
