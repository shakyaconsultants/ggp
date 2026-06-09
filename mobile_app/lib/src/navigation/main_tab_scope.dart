import 'package:flutter/material.dart';

/// Global hook from [HomeScreen] so menus and pushed screens can switch tabs.
class MainTabNavigation {
  static void Function(int index)? _switchTab;

  static void register(void Function(int index) switchTab) {
    _switchTab = switchTab;
  }

  static void unregister(void Function(int index) switchTab) {
    if (_switchTab == switchTab) {
      _switchTab = null;
    }
  }

  /// Close pushed screens and switch to the Home tab.
  static void goHome(BuildContext context) {
    navigateToTab(context, 0);
  }

  /// Close pushed screens and switch to a bottom-nav tab.
  static void navigateToTab(BuildContext context, int index) {
    final navigator = Navigator.of(context);
    if (navigator.canPop()) {
      navigator.popUntil((route) => route.isFirst);
    }
    _switchTab?.call(index);
  }
}

/// Legacy alias used across tab screens.
typedef MainTabScope = MainTabNavigation;
