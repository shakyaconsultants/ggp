import 'dart:async';
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/utils/api_util.dart';

class FaqSection extends StatefulWidget {
  const FaqSection({super.key});

  @override
  _FaqSectionState createState() => _FaqSectionState();
}

class _FaqSectionState extends State<FaqSection> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  String _searchQuery = "";

  final ScrollController _scrollController =
      ScrollController(); // Scroll controller

  List<Map<String, String>> _faqs = [];
  List<Map<String, String>> _filteredFaqs = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchFaqs();
    _searchController.addListener(_onSearchChanged);

    // Add listener to the scroll controller to dismiss the keyboard when scrolling
    _scrollController.addListener(() {
      FocusScope.of(context).unfocus(); // Dismiss the keyboard on scroll
    });
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _scrollController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> fetchFaqs() async {

    try {
      final response = await ApiUtil.makeApiCall(endpoint: AppStrings.faqURL, method: 'GET');
      if (response["statusCode"] == 200) {
        final List<dynamic> data = response["data"];
        setState(() {
          _faqs = data.map((faq) => {
            'question': faq['question'] as String,
            'answer': faq['answer'] as String
          }).toList().cast<Map<String, String>>();
          _filteredFaqs = _faqs;
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
        debugPrint('Failed to load FAQs: ${response["statusCode"]}');
      }
    } catch (error) {
      setState(() {
        isLoading = false;
      });
      debugPrint('Error fetching FAQs: $error');
    }
  }

  _onSearchChanged() {
    if (_debounce?.isActive ?? false) _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      setState(() {
        _searchQuery = _searchController.text.toLowerCase();
        _filteredFaqs = _faqs
            .where((faq) =>
                faq['question']!.toLowerCase().contains(_searchQuery))
            .toList();
      });
    });
  }

  void _dismissKeyboard() {
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _dismissKeyboard,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: TextField(
                      controller: _searchController,
                      decoration: const InputDecoration(
                        labelText: 'Search',
                        floatingLabelBehavior: FloatingLabelBehavior.never,
                        focusColor: Colors.black,
                        border: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.grey),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.black),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.black, width: 1.0),
                        ),
                        prefixIcon: Icon(Icons.search),
                      ),
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      controller: _scrollController,
                      itemCount: _filteredFaqs.length,
                      itemBuilder: (context, index) {
                        return ExpansionTile(
                          title: Text(
                            _filteredFaqs[index]["question"]!,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          shape: const RoundedRectangleBorder(
                            side: BorderSide.none,
                          ),
                          collapsedShape: const RoundedRectangleBorder(
                            side: BorderSide.none,
                          ),
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16.0),
                              child: Text(
                                _filteredFaqs[index]["answer"]!.isNotEmpty
                                    ? _filteredFaqs[index]["answer"]!
                                    : "Answer not available",
                                     textAlign: TextAlign.left, 
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
