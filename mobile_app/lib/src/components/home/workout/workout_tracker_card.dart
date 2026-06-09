import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home/workout/index.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class WorkoutTrackerCard extends StatelessWidget {
  final String title;
  final String subTitle;
  final int progress;

  const WorkoutTrackerCard({
    super.key,
    required this.title,
    required this.subTitle,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        double width = constraints.maxWidth;
        return SizedBox(
          width: width,
          height: width,
          child: GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                SlideInRouter(screen: const WorkoutSelectedScreen()),
              );
            },
            child: Card(
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: const BorderSide(color: Colors.grey, width: 0.2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 50,
                          height: 50,
                          child: CircularProgressIndicator(
                            value: progress / 100,
                            strokeWidth: 3,
                            backgroundColor: Colors.grey.shade300,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                                Color(0xFF4D6932)),
                          ),
                        ),
                        const Icon(Icons.fitness_center,
                            size: 20, color: Color(0xFF4D6932)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      title,
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black),
                      textAlign: TextAlign.center,
                    ),
                    Text(
                      subTitle,
                      style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.normal,
                          color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
