import 'package:flutter/material.dart';

class BodyCompositionScreen extends StatelessWidget {
  const BodyCompositionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        title: const Text('Body Compositions'),
        centerTitle: true,
        titleTextStyle: const TextStyle(
            color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Circular Weight Display
            Center(
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.black45,
                    style: BorderStyle.solid,
                    width: 2,
                  ),
                ),
                child: const Center(
                  child: Text(
                    '63.95',
                    style: TextStyle(
                      fontSize: 40,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'August 23, 2024 at 9:59 PM',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  backgroundColor: Colors.white),
              child: const Text('Add Manually'),
            ),
            const SizedBox(height: 20),
            // Body Composition Data with expandable tiles
            _buildBodyCompositionTile(
              'Weight',
              '63.95Kg',
              '6.55 kg is more than standard Value',
              'High',
              const Text('More details about Weight...'),
            ),
            _buildBodyCompositionTile(
              'BMI',
              '24.4',
              null,
              null,
              const Text('More details about BMI...'),
            ),
            _buildBodyCompositionTile(
              'Body Fat',
              '18.2%',
              null,
              null,
              const Text('More details about Body Fat...'),
            ),
            _buildBodyCompositionTile(
              'Fat-Free Body Weight',
              '52.3Kg',
              null,
              null,
              const Text('More details about Fat-Free Body Weight...'),
            ),
            _buildBodyCompositionTile(
              'Subcutaneous Fat',
              '16%',
              null,
              null,
              const Text('More details about Subcutaneous Fat...'),
            ),
            _buildBodyCompositionTile(
              'Visceral Fat',
              '7',
              null,
              null,
              const Text('More details about Visceral Fat...'),
            ),
          ],
        ),
      ),
    );
  }

  // A reusable method to create a body composition tile with expandable functionality.
  Widget _buildBodyCompositionTile(
    String label,
    String value,
    String? description,
    String? flag,
    Widget expandedContent,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
      child: Card(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: Colors.grey, width: 0.2),
        ),
        child: ExpansionTile(
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  if (flag != null)
                    Text(
                      flag,
                      style: const TextStyle(
                        color: Colors.orange,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ],
          ),
          subtitle: description != null ? Text(description) : null,
          trailing: const Icon(Icons.arrow_drop_down),
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: expandedContent,
            ),
          ],
        ),
      ),
    );
  }
}
