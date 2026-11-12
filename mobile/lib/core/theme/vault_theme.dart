import 'package:flutter/material.dart';

class VaultTheme {
  static const Color obsidianBlack = Color(0xFF0B0D10);
  static const Color charcoal = Color(0xFF171A20);
  static const Color graphite = Color(0xFF222630);
  static const Color silver = Color(0xFFC5CAD3);
  static const Color subtleBlue = Color(0xFF648BFF);
  static const Color white = Color(0xFFF4F5F7);
  static const Color mutedGrey = Color(0xFF9299A5);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: obsidianBlack,
      primaryColor: subtleBlue,
      colorScheme: const ColorScheme.dark(
        primary: subtleBlue,
        secondary: subtleBlue,
        surface: charcoal,
        background: obsidianBlack,
      ),
      fontFamily: 'PlusJakartaSans',
      appBarTheme: const AppBarTheme(
        backgroundColor: obsidianBlack,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardTheme(
        color: charcoal,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: graphite, width: 1),
        ),
      ),
    );
  }
}
