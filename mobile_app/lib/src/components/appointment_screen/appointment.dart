import 'dart:async';

import 'package:flutter/material.dart';
import 'package:good_gut/src/components/appointment_screen/call_screen.dart';
import 'package:good_gut/src/components/menu/index.dart';
import 'package:good_gut/src/navigation/main_tab_scope.dart';
import 'package:good_gut/src/services/client_api_service.dart';
import 'package:good_gut/src/services/user_profile_store.dart';
import 'package:good_gut/src/utils/slide_router.dart';
import 'package:intl/intl.dart';

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  int? selectedSlotId;
  DateTime selectedDate = DateTime.now();
  Map<String, dynamic> userInfo = {};
  List<Map<String, dynamic>> availableSlots = [];
  bool loadingSlots = false;
  bool scheduling = false;
  List<Map<String, dynamic>> scheduledCalls = [];

  List<DateTime> generateNextDays(int count) {
    final availableDates = <DateTime>[];
    var addedDays = 0;

    while (availableDates.length < count) {
      final currentDate = DateTime.now().add(Duration(days: addedDays));
      if (currentDate.weekday != DateTime.sunday) {
        availableDates.add(
          DateTime(currentDate.year, currentDate.month, currentDate.day),
        );
      }
      addedDays++;
    }

    return availableDates;
  }

  @override
  void initState() {
    super.initState();
    _initScreen();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Timer? _refreshTimer;

  void _startAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 20), (_) {
      _loadCalls();
    });
  }

  Future<void> _initScreen() async {
    final profile = await UserProfileStore.loadCached();
    setState(() => userInfo = profile);
    await _loadSlots();
    await _loadCalls();
  }

  Future<void> _loadSlots() async {
    setState(() {
      loadingSlots = true;
      selectedSlotId = null;
    });

    final slots = await ClientApiService.fetchAvailableSlots(selectedDate);
    if (!mounted) return;
    setState(() {
      availableSlots = slots;
      loadingSlots = false;
    });
  }

  Future<void> _loadCalls() async {
    final calls = await ClientApiService.fetchScheduledCalls();
    if (!mounted) return;
    setState(() => scheduledCalls = calls);
    _startAutoRefresh();
  }

  Map<String, dynamic>? get _selectedSlot {
    if (selectedSlotId == null) return null;
    for (final slot in availableSlots) {
      if (slot['slot_id'] == selectedSlotId) return slot;
    }
    return null;
  }

  Future<void> _scheduleCall() async {
    final slot = _selectedSlot;
    if (slot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a time slot')),
      );
      return;
    }

    setState(() => scheduling = true);
    final ok = await ClientApiService.scheduleCall(
      date: selectedDate,
      slotId: slot['slot_id'] as int,
      time: slot['time']?.toString(),
    );
    if (!mounted) return;
    setState(() => scheduling = false);

    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Call scheduled successfully')),
      );
      await _loadSlots();
      await _loadCalls();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not schedule call. Slot may have been taken.')),
      );
    }
  }

  Future<void> _cancelCall(Map<String, dynamic> call) async {
    final callId = call['id']?.toString() ?? '';
    if (callId.isEmpty) return;

    final ok = await ClientApiService.cancelCall(callId);
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? 'Call cancelled' : 'Could not cancel call')),
    );
    if (ok) {
      await _loadSlots();
      await _loadCalls();
    }
  }

  void _joinCall(Map<String, dynamic> call) {
    final callId = call['id']?.toString() ?? '';
    if (callId.isEmpty) return;

    if (!_canJoinCall(call)) {
      final message = call['join_window_message']?.toString() ??
          'You can join 15 minutes before your scheduled time.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CallPage(
          callId: callId,
          userName: userInfo['nutritionistName']?.toString(),
        ),
      ),
    );
  }

  String _formatCallWhen(Map<String, dynamic> call) {
    final dateLabel = call['scheduled_date_label']?.toString();
    final timeLabel = call['scheduled_time_label']?.toString();

    if (dateLabel != null &&
        dateLabel.isNotEmpty &&
        timeLabel != null &&
        timeLabel.isNotEmpty) {
      return '$dateLabel · $timeLabel';
    }

    final rawDate = call['scheduled_date']?.toString() ?? '';
    String dateStr;
    if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(rawDate)) {
      final parts = rawDate.split('-').map(int.parse).toList();
      dateStr = DateFormat('d MMM yyyy').format(DateTime(parts[0], parts[1], parts[2]));
    } else {
      final parsed = DateTime.tryParse(rawDate);
      dateStr = parsed != null
          ? DateFormat('d MMM yyyy').format(parsed.toLocal())
          : rawDate;
    }

    final timeStr = timeLabel ?? _formatTimeLabel(call['scheduled_time']?.toString() ?? '');
    return '$dateStr · $timeStr';
  }

  String _formatTimeLabel(String rawTime) {
    final match = RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(rawTime);
    if (match == null) return rawTime;

    final hours = int.parse(match.group(1)!);
    final minutes = match.group(2)!;
    final period = hours >= 12 ? 'PM' : 'AM';
    final hour12 = hours % 12 == 0 ? 12 : hours % 12;
    return '$hour12:$minutes $period';
  }

  DateTime? _parseScheduledDate(String raw) {
    if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(raw)) {
      final parts = raw.split('-').map(int.parse).toList();
      return DateTime(parts[0], parts[1], parts[2]);
    }

    final parsed = DateTime.tryParse(raw);
    if (parsed == null) return null;
    final local = parsed.toLocal();
    return DateTime(local.year, local.month, local.day);
  }

  bool _inJoinWindow(Map<String, dynamic> call) {
    if (call['in_join_window'] == true) return true;

    final datePart = _parseScheduledDate(call['scheduled_date']?.toString() ?? '');
    final timeMatch =
        RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(call['scheduled_time']?.toString() ?? '');
    if (datePart == null || timeMatch == null) return false;

    final scheduled = DateTime(
      datePart.year,
      datePart.month,
      datePart.day,
      int.parse(timeMatch.group(1)!),
      int.parse(timeMatch.group(2)!),
    );
    const joinBeforeMinutes = 15;
    const joinAfterMinutes = 60;
    final now = DateTime.now();
    final windowStart = scheduled.subtract(const Duration(minutes: joinBeforeMinutes));
    final windowEnd = scheduled.add(const Duration(minutes: joinAfterMinutes));

    return !now.isBefore(windowStart) && !now.isAfter(windowEnd);
  }

  bool _canJoinCall(Map<String, dynamic> call) {
    if (!_isUpcoming(call)) return false;

    final status = call['status']?.toString() ?? '';
    if (status == 'in_progress') return true;

    return false;
  }

  bool _waitingForNutritionist(Map<String, dynamic> call) {
    if (call['waiting_for_nutritionist'] == true) return true;
    return _inJoinWindow(call) && call['status']?.toString() == 'scheduled';
  }

  bool _isUpcoming(Map<String, dynamic> call) {
    final status = call['status']?.toString() ?? '';
    return status != 'completed' && status != 'cancelled';
  }

  @override
  Widget build(BuildContext context) {
    final dates = generateNextDays(5);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        title: const Text(
          'Schedule Call',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.home_outlined, color: Colors.white),
          tooltip: 'Back to home',
          onPressed: () => MainTabScope.goHome(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.menu, color: Colors.white),
            onPressed: () {
              Navigator.push(
                context,
                SlideInRouter(screen: const MenuScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Book a video consultation with your nutritionist',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFDEED7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Pick an open slot below. Join opens 15 minutes before the scheduled time.',
                style: TextStyle(fontSize: 13),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Select Date',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: dates.map((date) {
                return GestureDetector(
                  onTap: () {
                    setState(() => selectedDate = date);
                    _loadSlots();
                  },
                  child: DateCard(
                    day: DateFormat('d').format(date),
                    dayName: DateFormat('E').format(date),
                    isSelected: selectedDate == date,
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            const Text(
              'Select Time',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 10),
            if (loadingSlots)
              const Center(child: CircularProgressIndicator())
            else if (availableSlots.isEmpty)
              const Text(
                'No open slots for this date. Ask your nutritionist to open times in the portal.',
                style: TextStyle(color: Colors.grey),
              )
            else
              DropdownButtonFormField<int>(
                value: selectedSlotId,
                hint: const Text('Select Time'),
                decoration: InputDecoration(
                  prefixIcon:
                      const Icon(Icons.access_time, color: Colors.black87),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                items: availableSlots.map((slot) {
                  return DropdownMenuItem<int>(
                    value: slot['slot_id'] as int,
                    child: Text(slot['label']?.toString() ?? slot['time'].toString()),
                  );
                }).toList(),
                onChanged: (value) => setState(() => selectedSlotId = value),
              ),
            const SizedBox(height: 30),
            Center(
              child: ElevatedButton(
                onPressed: scheduling ? null : _scheduleCall,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF07E28),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 80, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  scheduling ? 'Scheduling...' : 'SCHEDULE CALL',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (scheduledCalls.isNotEmpty) ...[
              const Text(
                'Your bookings',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              ...scheduledCalls.take(8).map((call) {
                final upcoming = _isUpcoming(call);
                final canJoin = _canJoinCall(call);
                final waiting = _waitingForNutritionist(call);
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.videocam, color: Color(0xFFF07E28)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _formatCallWhen(call),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    waiting
                                        ? 'Waiting for nutritionist to start'
                                        : canJoin
                                            ? '${call['status'] ?? 'scheduled'} · Tap Join'
                                            : call['join_window_message']?.toString() ??
                                                '${call['status'] ?? 'scheduled'}',
                                    style: const TextStyle(
                                      color: Colors.grey,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (upcoming) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: canJoin ? () => _joinCall(call) : null,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFF07E28),
                                    foregroundColor: Colors.white,
                                    disabledBackgroundColor: Colors.grey.shade300,
                                  ),
                                  child: Text(waiting ? 'Waiting…' : 'Join call'),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => _cancelCall(call),
                                  child: const Text('Cancel'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}

class DateCard extends StatelessWidget {
  final String day;
  final String dayName;
  final bool isSelected;

  const DateCard({
    super.key,
    required this.day,
    required this.dayName,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 60,
      height: 60,
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF07E28) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFFF07E28) : Colors.grey,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              day,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : Colors.black,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              dayName,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
