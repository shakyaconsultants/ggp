import 'package:flutter/material.dart';

class AppTheme {
  static final ThemeData lightTheme = ThemeData(
    primaryColor: const Color(0xFFF07E28),
    scaffoldBackgroundColor: Colors.white,
    colorScheme: const ColorScheme.light(
      primary: Color(0xFFF07E28),
      secondary: Colors.blueAccent,
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    primaryColor: const Color(0xFFF07E28),
    colorScheme: const ColorScheme.dark(
      primary: Color(0xFFF07E28),
      secondary: Colors.blueAccent,
    ),
  );
}
