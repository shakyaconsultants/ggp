import 'package:flutter/material.dart';
import 'package:good_gut/src/services/client_api_service.dart';

class LogMealScreen extends StatefulWidget {
  final DateTime selectedDate;
  final VoidCallback? onSaved;

  const LogMealScreen({
    super.key,
    required this.selectedDate,
    this.onSaved,
  });

  @override
  State<LogMealScreen> createState() => _LogMealScreenState();
}

class _LogMealScreenState extends State<LogMealScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _quantityController = TextEditingController(text: '1');
  final _kcalController = TextEditingController();
  final _pController = TextEditingController();
  final _cController = TextEditingController();
  final _fController = TextEditingController();
  String mealType = 'Lunch';
  bool isVeg = true;
  bool saving = false;

  static const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  @override
  void dispose() {
    _nameController.dispose();
    _quantityController.dispose();
    _kcalController.dispose();
    _pController.dispose();
    _cController.dispose();
    _fController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => saving = true);

    final ok = await ClientApiService.addMeal(
      date: widget.selectedDate,
      name: _nameController.text.trim(),
      quantity: _quantityController.text.trim(),
      kcal: num.tryParse(_kcalController.text) ?? 0,
      p: num.tryParse(_pController.text) ?? 0,
      c: num.tryParse(_cController.text) ?? 0,
      f: num.tryParse(_fController.text) ?? 0,
      mealType: mealType,
      isVeg: isVeg,
    );

    if (!mounted) return;
    setState(() => saving = false);

    if (ok) {
      widget.onSaved?.call();
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not log meal')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFF07E28),
        foregroundColor: Colors.white,
        title: const Text('Log Meal'),
        actions: [
          IconButton(
            onPressed: saving ? null : _save,
            icon: saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Icon(Icons.check),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              'Date: ${ClientApiService.formatDate(widget.selectedDate)}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Meal name *'),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            TextFormField(
              controller: _quantityController,
              decoration: const InputDecoration(labelText: 'Quantity'),
            ),
            DropdownButtonFormField<String>(
              value: mealType,
              decoration: const InputDecoration(labelText: 'Meal type'),
              items: mealTypes
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) => setState(() => mealType = v ?? mealType),
            ),
            TextFormField(
              controller: _kcalController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Calories (kcal) *'),
              validator: (v) =>
                  v == null || v.isEmpty ? 'Required' : null,
            ),
            TextFormField(
              controller: _pController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Protein (g)'),
            ),
            TextFormField(
              controller: _cController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Carbs (g)'),
            ),
            TextFormField(
              controller: _fController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Fat (g)'),
            ),
            SwitchListTile(
              title: const Text('Vegetarian'),
              value: isVeg,
              onChanged: (v) => setState(() => isVeg = v),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: saving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF07E28),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: Text(saving ? 'Saving…' : 'Save meal'),
            ),
          ],
        ),
      ),
    );
  }
}
