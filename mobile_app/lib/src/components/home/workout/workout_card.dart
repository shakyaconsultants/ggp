import 'package:flutter/material.dart';
import 'package:good_gut/src/components/home/workout/workout.dart';

class WorkoutCard extends StatelessWidget {
  final Workout workout;
  final bool isSelectionScreen;

  const WorkoutCard({
    super.key,
    required this.workout,
    this.isSelectionScreen = true,
  });

  Widget _workoutImage(String imageUrl) {
    if (imageUrl.startsWith('http')) {
      return Image.network(
        imageUrl,
        height: 60,
        width: 80,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _placeholderImage(),
      );
    }
    return _placeholderImage();
  }

  Widget _placeholderImage() {
    return Container(
      height: 60,
      width: 80,
      color: const Color(0xFFFDEED7),
      child: const Icon(Icons.fitness_center, color: Color(0xFFF07E28)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.grey, width: 0.2),
      ),
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: ListTile(
        contentPadding:
            const EdgeInsets.only(left: 8, top: 8, bottom: 8, right: 16),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8.0),
          child: _workoutImage(workout.imageUrl),
        ),
        title: Text(
          workout.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        subtitle: Row(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 4),
              padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                workout.type,
                style: const TextStyle(fontSize: 10),
              ),
            ),
            const SizedBox(width: 10),
            Text(
              workout.sets,
              style: const TextStyle(color: Colors.blue, fontSize: 12),
            ),
          ],
        ),
        trailing: isSelectionScreen
            ? const Icon(Icons.add_circle_outline, color: Colors.black)
            : null,
      ),
    );
  }
}
