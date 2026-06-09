import 'package:flutter/material.dart';

class VegIcon extends StatelessWidget {
  const VegIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return const Stack(
      alignment: Alignment.center,
      children: [
        Icon(
          Icons.crop_square_sharp,
          color: Colors.green,
          size: 20,
        ),
        Icon(
          Icons.circle,
          color: Colors.green,
          size: 8,
        ),
      ],
    );
  }
}

class NonVegIcon extends StatelessWidget {
  const NonVegIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return const Stack(
      alignment: Alignment.center,
      children: [
        Icon(
          Icons.crop_square_sharp,
          color: Colors.red,
          size: 20,
        ),
        Icon(
          Icons.circle,
          color: Colors.red,
          size: 8,
        ),
      ],
    );
  }
}

class EggIcon extends StatelessWidget {
  const EggIcon({super.key});

  @override
  Widget build(BuildContext context) {
    return const Stack(
      alignment: Alignment.center,
      children: [
        Icon(
          Icons.crop_square_sharp,
          color: Colors.yellow,
          size: 20,
        ),
        Icon(
          Icons.circle,
          color: Colors.yellow,
          size: 8,
        ),
      ],
    );
  }
}
